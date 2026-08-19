import { AbortMultipartUploadCommand, CompleteMultipartUploadCommand, CreateMultipartUploadCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, ListPartsCommand, PutObjectCommand, S3Client, UploadPartCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { requireStorageConfig, type StorageConfig } from "@/lib/storage/config";

function client(config: StorageConfig) {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint || undefined,
    forcePathStyle: config.forcePathStyle,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey }
  });
}

export async function signStorageUpload(input: { key: string; mimeType: string; checksumBase64: string; objectId: string }) {
  const config = requireStorageConfig();
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: input.key,
    ContentType: input.mimeType,
    ChecksumSHA256: input.checksumBase64,
    Metadata: { teachx_object_id: input.objectId }
  });
  return {
    url: await getSignedUrl(client(config), command, { expiresIn: config.uploadTtlSeconds }),
    expiresIn: config.uploadTtlSeconds,
    headers: { "Content-Type": input.mimeType, "x-amz-checksum-sha256": input.checksumBase64 }
  };
}

export async function createMultipartStorageUpload(input: { key: string; mimeType: string; objectId: string; fullChecksumHex: string }) {
  const config = requireStorageConfig();
  const response = await client(config).send(new CreateMultipartUploadCommand({
    Bucket: config.bucket,
    Key: input.key,
    ContentType: input.mimeType,
    ChecksumAlgorithm: "SHA256",
    ChecksumType: "COMPOSITE",
    Metadata: { teachx_object_id: input.objectId, teachx_checksum_sha256: input.fullChecksumHex }
  }));
  if (!response.UploadId) throw new Error("MULTIPART_START_FAILED");
  return response.UploadId;
}

export async function signMultipartPart(input: { key: string; uploadId: string; partNumber: number; checksumBase64: string }) {
  const config = requireStorageConfig();
  const command = new UploadPartCommand({ Bucket: config.bucket, Key: input.key, UploadId: input.uploadId, PartNumber: input.partNumber, ChecksumSHA256: input.checksumBase64 });
  return {
    url: await getSignedUrl(client(config), command, { expiresIn: config.uploadTtlSeconds }),
    expiresIn: config.uploadTtlSeconds,
    headers: { "x-amz-checksum-sha256": input.checksumBase64 }
  };
}

export async function listMultipartParts(input: { key: string; uploadId: string }) {
  const config = requireStorageConfig();
  const parts = [];
  let marker: string | undefined;
  do {
    const response = await client(config).send(new ListPartsCommand({ Bucket: config.bucket, Key: input.key, UploadId: input.uploadId, PartNumberMarker: marker }));
    parts.push(...(response.Parts ?? []));
    marker = response.IsTruncated ? response.NextPartNumberMarker : undefined;
  } while (marker);
  return parts;
}

export async function completeMultipartStorageUpload(input: { key: string; uploadId: string; parts: Array<{ partNumber: number; etag: string; checksumBase64: string }> }) {
  const config = requireStorageConfig();
  return client(config).send(new CompleteMultipartUploadCommand({
    Bucket: config.bucket,
    Key: input.key,
    UploadId: input.uploadId,
    MultipartUpload: { Parts: input.parts.map((part) => ({ PartNumber: part.partNumber, ETag: part.etag, ChecksumSHA256: part.checksumBase64 })) }
  }));
}

export async function abortMultipartStorageUpload(input: { key: string; uploadId: string }) {
  const config = requireStorageConfig();
  await client(config).send(new AbortMultipartUploadCommand({ Bucket: config.bucket, Key: input.key, UploadId: input.uploadId }));
}

export async function inspectStorageObject(key: string) {
  const config = requireStorageConfig();
  return client(config).send(new HeadObjectCommand({ Bucket: config.bucket, Key: key, ChecksumMode: "ENABLED" }));
}

export async function signStorageDownload(input: { key: string; filename: string; mimeType: string }) {
  const config = requireStorageConfig();
  const fallback = input.filename.replace(/["\\\r\n]/g, "_");
  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: input.key,
    ResponseContentType: input.mimeType,
    ResponseContentDisposition: `attachment; filename="${fallback}"`
  });
  return getSignedUrl(client(config), command, { expiresIn: config.downloadTtlSeconds });
}

export async function deleteStorageObject(key: string) {
  const config = requireStorageConfig();
  await client(config).send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
}
