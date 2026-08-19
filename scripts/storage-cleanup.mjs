import { AbortMultipartUploadCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";

const required = ["STORAGE_S3_BUCKET", "STORAGE_S3_ACCESS_KEY_ID", "STORAGE_S3_SECRET_ACCESS_KEY"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) throw new Error(`Storage cleanup is missing ${missing.join(", ")}.`);

const prisma = new PrismaClient();
const client = new S3Client({
  endpoint: process.env.STORAGE_S3_ENDPOINT || undefined,
  region: process.env.STORAGE_S3_REGION || "us-east-1",
  forcePathStyle: process.env.STORAGE_S3_FORCE_PATH_STYLE === "true",
  credentials: { accessKeyId: process.env.STORAGE_S3_ACCESS_KEY_ID, secretAccessKey: process.env.STORAGE_S3_SECRET_ACCESS_KEY }
});

try {
  const stale = await prisma.storageObject.findMany({
    where: {
      OR: [
        { status: "PENDING", uploadExpiresAt: { lt: new Date(Date.now() - 60 * 60 * 1000) } },
        { status: "QUARANTINED", updatedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
      ]
    },
    take: 500,
    orderBy: { updatedAt: "asc" }
  });
  let deleted = 0;
  for (const object of stale) {
    if (object.multipartUploadId) await client.send(new AbortMultipartUploadCommand({ Bucket: object.bucket, Key: object.key, UploadId: object.multipartUploadId }));
    else await client.send(new DeleteObjectCommand({ Bucket: object.bucket, Key: object.key }));
    await prisma.storageObject.update({
      where: { id: object.id },
      data: {
        status: object.status === "PENDING" ? "EXPIRED" : "DELETED",
        deletedAt: new Date(),
        transfers: { create: { kind: object.multipartUploadId ? "MULTIPART_ABORTED" : object.status === "PENDING" ? "EXPIRED" : "DELETED", bytes: object.sizeBytes, detail: { source: "scheduled-cleanup" } } }
      }
    });
    deleted += 1;
  }
  console.log(`TeachX storage cleanup completed: ${deleted} stale object(s) removed.`);
} finally {
  await prisma.$disconnect();
}
