import { randomUUID } from "node:crypto";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { RoleKey } from "@/lib/constants/roles";
import { userHasPermission } from "@/lib/rbac";
import { getStorageConfig, requireStorageConfig } from "@/lib/storage/config";
import { abortMultipartStorageUpload, completeMultipartStorageUpload, createMultipartStorageUpload, deleteStorageObject, inspectStorageObject, listMultipartParts, signMultipartPart, signStorageDownload, signStorageUpload } from "@/lib/storage/provider";
import { safeFileName, type UploadReservationInput } from "@/lib/storage/validation";
import { createContentUpload } from "@/services/upload-service";

type StoredMetadata = Omit<UploadReservationInput, "fileName" | "mimeType" | "sizeBytes" | "checksumSha256">;

function checksumBase64(hex: string) {
  return Buffer.from(hex, "hex").toString("base64");
}

function storageKey(config: ReturnType<typeof getStorageConfig>, institutionId: string, ownerId: string, objectId: string, fileName: string) {
  const date = new Date();
  return [config.prefix, institutionId, ownerId, date.getUTCFullYear(), String(date.getUTCMonth() + 1).padStart(2, "0"), objectId, safeFileName(fileName)].join("/");
}

async function assertContentScope(institutionId: string, input: UploadReservationInput) {
  if (input.purpose === "PROFILE_PHOTO") return;
  if (!input.courseId) throw new Error("CONTENT_SCOPE_INVALID");
  const checks = await Promise.all([
    prisma.course.count({ where: { id: input.courseId, institutionId } }),
    input.subjectId ? prisma.subject.count({ where: { id: input.subjectId, courseId: input.courseId, course: { institutionId } } }) : 1,
    input.chapterId ? prisma.chapter.count({ where: { id: input.chapterId, courseId: input.courseId, course: { institutionId } } }) : 1,
    input.topicId ? prisma.topic.count({ where: { id: input.topicId, courseId: input.courseId, course: { institutionId } } }) : 1,
    input.classroomId ? prisma.classroom.count({ where: { id: input.classroomId, courseId: input.courseId, institutionId } }) : 1,
    input.batchId ? prisma.batch.count({ where: { id: input.batchId, courseId: input.courseId, course: { institutionId } } }) : 1
  ]);
  if (checks.some((count) => count !== 1)) throw new Error("CONTENT_SCOPE_INVALID");
}

async function quotaBytes(ownerId: string) {
  const config = getStorageConfig();
  const subscription = await prisma.userSubscription.findFirst({
    where: { userId: ownerId, status: "ACTIVE", OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: new Date() } }] },
    select: { plan: { select: { storageLimitMb: true } } },
    orderBy: { createdAt: "desc" }
  });
  const mb = subscription?.plan.storageLimitMb && subscription.plan.storageLimitMb > 0
    ? subscription.plan.storageLimitMb
    : config.defaultQuotaMb;
  return BigInt(mb) * BigInt(1024) * BigInt(1024);
}

export async function reservePrivateUpload(input: UploadReservationInput & { institutionId: string; ownerId: string; requestId?: string }) {
  const config = requireStorageConfig();
  if (input.sizeBytes > config.maxFileBytes) throw new Error("FILE_TOO_LARGE");
  await assertContentScope(input.institutionId, input);
  const limit = await quotaBytes(input.ownerId);
  const objectId = randomUUID();
  const key = storageKey(config, input.institutionId, input.ownerId, objectId, input.fileName);
  const multipart = input.sizeBytes >= config.multipartThresholdBytes;
  const partSize = config.multipartPartBytes;
  const partCount = multipart ? Math.ceil(input.sizeBytes / partSize) : 1;
  if (partCount > 10_000) throw new Error("FILE_TOO_LARGE");
  const expiresAt = new Date(Date.now() + (multipart ? config.resumableTtlHours * 60 * 60 : config.uploadTtlSeconds) * 1000);
  const metadata: StoredMetadata = {
    purpose: input.purpose,
    courseId: input.courseId,
    subjectId: input.subjectId,
    chapterId: input.chapterId,
    topicId: input.topicId,
    classroomId: input.classroomId,
    batchId: input.batchId,
    title: input.title,
    description: input.description,
    type: input.type,
    durationSeconds: input.durationSeconds,
    status: input.status
  };

  await prisma.$transaction(async (tx) => {
    const usage = await tx.storageObject.aggregate({
      where: {
        ownerId: input.ownerId,
        OR: [{ status: "ACTIVE" }, { status: "PENDING", uploadExpiresAt: { gt: new Date() } }]
      },
      _sum: { sizeBytes: true }
    });
    if ((usage._sum.sizeBytes ?? BigInt(0)) + BigInt(input.sizeBytes) > limit) throw new Error("STORAGE_QUOTA_EXCEEDED");
    await tx.storageObject.create({
      data: {
        id: objectId,
        institutionId: input.institutionId,
        ownerId: input.ownerId,
        key,
        bucket: config.bucket,
        originalName: safeFileName(input.fileName),
        mimeType: input.mimeType,
        sizeBytes: BigInt(input.sizeBytes),
        checksumSha256: input.checksumSha256.toLowerCase(),
        uploadExpiresAt: expiresAt,
        metadata: metadata as Prisma.InputJsonValue,
        transfers: { create: { actorId: input.ownerId, kind: "UPLOAD_RESERVED", requestId: input.requestId, bytes: BigInt(input.sizeBytes) } }
      }
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  try {
    if (multipart) {
      const uploadId = await createMultipartStorageUpload({ key, mimeType: input.mimeType, objectId, fullChecksumHex: input.checksumSha256.toLowerCase() });
      await prisma.storageObject.update({
        where: { id: objectId },
        data: {
          multipartUploadId: uploadId,
          multipartPartSize: partSize,
          multipartPartCount: partCount,
          transfers: { create: { actorId: input.ownerId, kind: "MULTIPART_STARTED", requestId: input.requestId, detail: { partSize, partCount } } }
        }
      });
      return { objectId, strategy: "multipart" as const, partSize, partCount, completedParts: [], expiresAt: expiresAt.toISOString(), quotaBytes: Number(limit) };
    }
    const signed = await signStorageUpload({ key, mimeType: input.mimeType, checksumBase64: checksumBase64(input.checksumSha256), objectId });
    return { objectId, strategy: "single" as const, ...signed, expiresAt: expiresAt.toISOString(), quotaBytes: Number(limit) };
  } catch (error) {
    await prisma.storageObject.update({ where: { id: objectId }, data: { status: "FAILED" } });
    throw error;
  }
}

async function ownedPendingObject(input: { objectId: string; institutionId: string; ownerId: string }) {
  const object = await prisma.storageObject.findFirst({ where: { id: input.objectId, institutionId: input.institutionId, ownerId: input.ownerId }, include: { uploadParts: { orderBy: { partNumber: "asc" } } } });
  if (!object) throw new Error("UPLOAD_NOT_FOUND");
  if (object.status !== "PENDING") throw new Error("UPLOAD_NOT_PENDING");
  if (object.uploadExpiresAt <= new Date()) throw new Error("UPLOAD_EXPIRED");
  return object;
}

export async function getPrivateUploadStatus(input: { objectId: string; institutionId: string; ownerId: string }) {
  const object = await prisma.storageObject.findFirst({ where: { id: input.objectId, institutionId: input.institutionId, ownerId: input.ownerId }, include: { uploadParts: { orderBy: { partNumber: "asc" } } } });
  if (!object) throw new Error("UPLOAD_NOT_FOUND");
  if (object.status === "PENDING" && object.uploadExpiresAt <= new Date()) throw new Error("UPLOAD_EXPIRED");
  return {
    objectId: object.id,
    strategy: object.multipartUploadId ? "multipart" as const : "single" as const,
    status: object.status,
    fileName: object.originalName,
    mimeType: object.mimeType,
    sizeBytes: Number(object.sizeBytes),
    checksumSha256: object.checksumSha256,
    partSize: object.multipartPartSize,
    partCount: object.multipartPartCount,
    completedParts: object.uploadParts.filter((part) => part.completedAt && part.etag).map((part) => part.partNumber),
    expiresAt: object.uploadExpiresAt.toISOString(),
    contentItemId: object.contentItemId
  };
}

function expectedPartSize(object: { sizeBytes: bigint; multipartPartSize: number | null; multipartPartCount: number | null }, partNumber: number) {
  if (!object.multipartPartSize || !object.multipartPartCount || partNumber < 1 || partNumber > object.multipartPartCount) throw new Error("UPLOAD_PART_INVALID");
  return partNumber === object.multipartPartCount
    ? Number(object.sizeBytes) - object.multipartPartSize * (object.multipartPartCount - 1)
    : object.multipartPartSize;
}

export async function signPrivateUploadPart(input: { objectId: string; institutionId: string; ownerId: string; partNumber: number; sizeBytes: number; checksumSha256: string; requestId?: string }) {
  const object = await ownedPendingObject(input);
  if (!object.multipartUploadId) throw new Error("UPLOAD_NOT_MULTIPART");
  if (input.sizeBytes !== expectedPartSize(object, input.partNumber) || !/^[a-f0-9]{64}$/i.test(input.checksumSha256)) throw new Error("UPLOAD_PART_INVALID");
  const existing = object.uploadParts.find((part) => part.partNumber === input.partNumber);
  if (existing?.completedAt && existing.checksumSha256 !== input.checksumSha256.toLowerCase()) throw new Error("UPLOAD_PART_CONFLICT");
  const signed = await signMultipartPart({ key: object.key, uploadId: object.multipartUploadId, partNumber: input.partNumber, checksumBase64: checksumBase64(input.checksumSha256) });
  await prisma.storageObject.update({
    where: { id: object.id },
    data: {
      uploadParts: { upsert: { where: { objectId_partNumber: { objectId: object.id, partNumber: input.partNumber } }, create: { partNumber: input.partNumber, sizeBytes: input.sizeBytes, checksumSha256: input.checksumSha256.toLowerCase() }, update: { sizeBytes: input.sizeBytes, checksumSha256: input.checksumSha256.toLowerCase(), signedAt: new Date() } } },
      transfers: { create: { actorId: input.ownerId, kind: "PART_SIGNED", requestId: input.requestId, bytes: BigInt(input.sizeBytes), detail: { partNumber: input.partNumber } } }
    }
  });
  return signed;
}

export async function recordPrivateUploadPart(input: { objectId: string; institutionId: string; ownerId: string; partNumber: number; etag: string; checksumSha256: string; requestId?: string }) {
  const object = await ownedPendingObject(input);
  const part = object.uploadParts.find((candidate) => candidate.partNumber === input.partNumber);
  const etag = input.etag.replaceAll('"', "").trim();
  if (!part || part.checksumSha256 !== input.checksumSha256.toLowerCase() || !/^[A-Za-z0-9+/=:_-]{8,200}$/.test(etag)) throw new Error("UPLOAD_PART_INVALID");
  await prisma.storageObject.update({
    where: { id: object.id },
    data: {
      uploadParts: { update: { where: { objectId_partNumber: { objectId: object.id, partNumber: input.partNumber } }, data: { etag, completedAt: new Date() } } },
      transfers: { create: { actorId: input.ownerId, kind: "PART_RECORDED", requestId: input.requestId, bytes: BigInt(part.sizeBytes), detail: { partNumber: input.partNumber } } }
    }
  });
  return getPrivateUploadStatus(input);
}

export async function abortPrivateUpload(input: { objectId: string; institutionId: string; ownerId: string; requestId?: string }) {
  const object = await ownedPendingObject(input);
  if (object.multipartUploadId) await abortMultipartStorageUpload({ key: object.key, uploadId: object.multipartUploadId });
  else await deleteStorageObject(object.key).catch(() => undefined);
  await prisma.storageObject.update({ where: { id: object.id }, data: { status: "DELETED", deletedAt: new Date(), transfers: { create: { actorId: input.ownerId, kind: object.multipartUploadId ? "MULTIPART_ABORTED" : "DELETED", requestId: input.requestId } } } });
}

export async function completePrivateUpload(input: { objectId: string; institutionId: string; ownerId: string; requestId?: string }) {
  const object = await prisma.storageObject.findFirst({ where: { id: input.objectId, institutionId: input.institutionId, ownerId: input.ownerId }, include: { uploadParts: { orderBy: { partNumber: "asc" } } } });
  if (!object) throw new Error("UPLOAD_NOT_FOUND");
  const stored = object.metadata as StoredMetadata | null;
  if (object.status === "ACTIVE" && stored?.purpose === "PROFILE_PHOTO") return object;
  if (object.status === "ACTIVE" && object.contentItemId) return prisma.contentItem.findUniqueOrThrow({ where: { id: object.contentItemId } });
  if (object.status !== "PENDING") throw new Error("UPLOAD_NOT_PENDING");
  if (object.uploadExpiresAt <= new Date()) {
    await prisma.storageObject.update({ where: { id: object.id }, data: { status: "EXPIRED", transfers: { create: { actorId: input.ownerId, kind: "EXPIRED", requestId: input.requestId } } } });
    throw new Error("UPLOAD_EXPIRED");
  }

  if (object.multipartUploadId) {
    if (!object.multipartPartCount || object.uploadParts.length !== object.multipartPartCount || object.uploadParts.some((part) => !part.completedAt || !part.etag)) throw new Error("UPLOAD_PARTS_INCOMPLETE");
    try {
      const remoteParts = (await listMultipartParts({ key: object.key, uploadId: object.multipartUploadId })).sort((a, b) => (a.PartNumber ?? 0) - (b.PartNumber ?? 0));
      const remoteValid = remoteParts.length === object.multipartPartCount && remoteParts.every((remote, index) => {
        const local = object.uploadParts[index];
        return remote.PartNumber === local.partNumber
          && Number(remote.Size) === local.sizeBytes
          && remote.ETag?.replaceAll('"', "") === local.etag
          && remote.ChecksumSHA256 === checksumBase64(local.checksumSha256);
      });
      if (!remoteValid) {
        await abortMultipartStorageUpload({ key: object.key, uploadId: object.multipartUploadId }).catch(() => undefined);
        await prisma.storageObject.update({ where: { id: object.id }, data: { status: "QUARANTINED", transfers: { create: { actorId: input.ownerId, kind: "QUARANTINED", requestId: input.requestId, detail: { reason: "provider multipart evidence mismatch" } } } } });
        throw new Error("UPLOAD_INTEGRITY_FAILED");
      }
      await completeMultipartStorageUpload({
        key: object.key,
        uploadId: object.multipartUploadId,
        parts: object.uploadParts.map((part) => ({ partNumber: part.partNumber, etag: part.etag!, checksumBase64: checksumBase64(part.checksumSha256) }))
      });
      await prisma.storageTransferEvent.create({ data: { objectId: object.id, actorId: input.ownerId, kind: "MULTIPART_COMPLETED", requestId: input.requestId, bytes: object.sizeBytes, detail: { partCount: object.multipartPartCount } } });
    } catch (error) {
      const alreadyComplete = await inspectStorageObject(object.key).catch(() => null);
      if (!alreadyComplete || Number(alreadyComplete.ContentLength) !== Number(object.sizeBytes) || alreadyComplete.Metadata?.teachx_object_id !== object.id || alreadyComplete.Metadata?.teachx_checksum_sha256 !== object.checksumSha256) throw error;
    }
  }

  const head = await inspectStorageObject(object.key);
  const actualChecksum = head.ChecksumSHA256;
  const valid = Number(head.ContentLength) === Number(object.sizeBytes)
    && head.ContentType?.toLowerCase() === object.mimeType.toLowerCase()
    && (object.multipartUploadId ? Boolean(actualChecksum) && head.Metadata?.teachx_checksum_sha256 === object.checksumSha256 : actualChecksum === checksumBase64(object.checksumSha256))
    && head.Metadata?.teachx_object_id === object.id;
  if (!valid) {
    await prisma.storageObject.update({
      where: { id: object.id },
      data: { status: "QUARANTINED", transfers: { create: { actorId: input.ownerId, kind: "QUARANTINED", requestId: input.requestId, detail: { reason: "size, type, checksum, or ownership metadata mismatch" } } } }
    });
    await deleteStorageObject(object.key).catch(() => undefined);
    throw new Error("UPLOAD_INTEGRITY_FAILED");
  }

  const metadata = object.metadata as StoredMetadata | null;
  if (metadata?.purpose === "PROFILE_PHOTO") {
    if (!object.mimeType.startsWith("image/") || Number(object.sizeBytes) > 2 * 1024 * 1024) throw new Error("UPLOAD_METADATA_INVALID");
    return prisma.$transaction(async (tx) => {
      const current = await tx.storageObject.findUniqueOrThrow({ where: { id: object.id } });
      if (current.status === "ACTIVE") return current;
      if (current.status !== "PENDING") throw new Error("UPLOAD_NOT_PENDING");
      const avatarUrl = `/api/storage/objects/${object.id}/download`;
      await tx.profile.upsert({ where: { userId: input.ownerId }, update: { avatarUrl }, create: { userId: input.ownerId, avatarUrl } });
      return tx.storageObject.update({ where: { id: object.id }, data: { status: "ACTIVE", etag: head.ETag?.replaceAll('"', ""), activatedAt: new Date(), transfers: { create: { actorId: input.ownerId, kind: "UPLOAD_COMPLETED", requestId: input.requestId, bytes: object.sizeBytes } } } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }
  if (!metadata?.courseId || !metadata.title || !metadata.type) throw new Error("UPLOAD_METADATA_INVALID");
  return prisma.$transaction(async (tx) => {
    const current = await tx.storageObject.findUniqueOrThrow({ where: { id: object.id } });
    if (current.status === "ACTIVE" && current.contentItemId) return tx.contentItem.findUniqueOrThrow({ where: { id: current.contentItemId } });
    if (current.status !== "PENDING") throw new Error("UPLOAD_NOT_PENDING");
    const item = await createContentUpload({
      institutionId: input.institutionId,
      createdById: input.ownerId,
      courseId: metadata.courseId!,
      subjectId: metadata.subjectId,
      chapterId: metadata.chapterId,
      topicId: metadata.topicId,
      classroomId: metadata.classroomId,
      batchId: metadata.batchId,
      title: metadata.title,
      description: metadata.description,
      type: metadata.type,
      storageKey: object.key,
      mimeType: object.mimeType,
      sizeBytes: Number(object.sizeBytes),
      durationSeconds: metadata.durationSeconds,
      status: metadata.status
    }, tx);
    await tx.storageObject.update({
      where: { id: object.id },
      data: {
        status: "ACTIVE",
        contentItemId: item.id,
        etag: head.ETag?.replaceAll('"', ""),
        activatedAt: new Date(),
        transfers: { create: { actorId: input.ownerId, kind: "UPLOAD_COMPLETED", requestId: input.requestId, bytes: object.sizeBytes } }
      }
    });
    return item;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function authorizePrivateDownload(input: { objectId: string; userId: string; institutionId?: string | null; roles: RoleKey[]; requestId?: string }) {
  const object = await prisma.storageObject.findFirst({
    where: { id: input.objectId, status: "ACTIVE" },
    include: { contentItem: { include: { marketplaceListing: { select: { price: true } } } } }
  });
  if (!object) throw new Error("DOWNLOAD_NOT_FOUND");
  const metadata = object.metadata as StoredMetadata | null;
  if (metadata?.purpose === "PROFILE_PHOTO") {
    const visible = object.ownerId === input.userId || Boolean(await prisma.teacherProfile.count({ where: { userId: object.ownerId, isMarketplaceListed: true, user: { status: "ACTIVE" } } }));
    if (!visible) throw new Error("DOWNLOAD_FORBIDDEN");
    const url = await signStorageDownload({ key: object.key, filename: object.originalName, mimeType: object.mimeType });
    await prisma.storageTransferEvent.create({ data: { objectId: object.id, actorId: input.userId, kind: "DOWNLOAD_SIGNED", requestId: input.requestId, bytes: object.sizeBytes } });
    return url;
  }
  const item = object.contentItem;
  if (!item) throw new Error("DOWNLOAD_NOT_FOUND");
  const owns = object.ownerId === input.userId;
  const manages = object.institutionId === input.institutionId && userHasPermission(input.roles, "content.manage");
  const entitlement = await prisma.marketplaceEntitlement.count({ where: { userId: input.userId, contentItemId: item.id, status: "ACTIVE" } });
  let audienceAccess = false;
  if (object.institutionId === input.institutionId && item.status === "PUBLISHED") {
    if (item.visibility === "PUBLIC") audienceAccess = !item.marketplaceListing || Number(item.marketplaceListing.price) === 0;
    if (item.visibility === "TEACHERS") audienceAccess = userHasPermission(input.roles, "content.view");
    if (item.visibility === "ENROLLED_STUDENTS") {
      const enrollmentTargets = [
        ...(item.batchId ? [{ batchId: item.batchId }] : []),
        ...(item.classroomId ? [{ batch: { classroom: { id: item.classroomId } } }] : [])
      ];
      audienceAccess = enrollmentTargets.length > 0 && Boolean(await prisma.batchStudent.count({ where: { studentId: input.userId, OR: enrollmentTargets } }));
    }
  }
  if (!owns && !manages && !entitlement && !audienceAccess) throw new Error("DOWNLOAD_FORBIDDEN");
  const url = await signStorageDownload({ key: object.key, filename: object.originalName, mimeType: object.mimeType });
  await prisma.$transaction([
    prisma.storageTransferEvent.create({ data: { objectId: object.id, actorId: input.userId, kind: "DOWNLOAD_SIGNED", requestId: input.requestId, bytes: object.sizeBytes } }),
    prisma.downloadHistory.create({ data: { itemId: item.id, userId: input.userId } }),
    prisma.contentAnalytics.upsert({ where: { itemId: item.id }, create: { itemId: item.id, downloads: 1 }, update: { downloads: { increment: 1 } } })
  ]);
  return url;
}

export async function storageReadiness(institutionId: string) {
  const config = getStorageConfig();
  const [active, pending, expiredPending, quarantined, usage] = await Promise.all([
    prisma.storageObject.count({ where: { institutionId, status: "ACTIVE" } }),
    prisma.storageObject.count({ where: { institutionId, status: "PENDING", uploadExpiresAt: { gt: new Date() } } }),
    prisma.storageObject.count({ where: { institutionId, status: "PENDING", uploadExpiresAt: { lte: new Date() } } }),
    prisma.storageObject.count({ where: { institutionId, status: "QUARANTINED" } }),
    prisma.storageObject.aggregate({ where: { institutionId, status: "ACTIVE" }, _sum: { sizeBytes: true } })
  ]);
  return {
    ok: config.live && expiredPending === 0 && quarantined === 0,
    provider: config.provider || "unconfigured",
    controls: { credentials: config.credentialsReady, privateBucket: process.env.STORAGE_PRIVATE_BUCKET_READY === "true", cors: process.env.STORAGE_CORS_READY === "true", retention: process.env.STORAGE_RETENTION_READY === "true", cleanup: process.env.STORAGE_CLEANUP_READY === "true" },
    limits: { maxFileMb: config.maxFileMb, defaultQuotaMb: config.defaultQuotaMb, uploadTtlSeconds: config.uploadTtlSeconds, downloadTtlSeconds: config.downloadTtlSeconds, multipartThresholdMb: config.multipartThresholdMb, multipartPartMb: config.multipartPartMb, resumableTtlHours: config.resumableTtlHours },
    evidence: { active, pending, expiredPending, quarantined, usedBytes: Number(usage._sum.sizeBytes ?? BigInt(0)) }
  };
}
