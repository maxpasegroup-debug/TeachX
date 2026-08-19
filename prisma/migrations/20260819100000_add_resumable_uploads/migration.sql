ALTER TYPE "StorageTransferKind" ADD VALUE 'MULTIPART_STARTED';
ALTER TYPE "StorageTransferKind" ADD VALUE 'PART_SIGNED';
ALTER TYPE "StorageTransferKind" ADD VALUE 'PART_RECORDED';
ALTER TYPE "StorageTransferKind" ADD VALUE 'MULTIPART_COMPLETED';
ALTER TYPE "StorageTransferKind" ADD VALUE 'MULTIPART_ABORTED';

ALTER TABLE "StorageObject"
  ADD COLUMN "multipartUploadId" TEXT,
  ADD COLUMN "multipartPartSize" INTEGER,
  ADD COLUMN "multipartPartCount" INTEGER;

CREATE TABLE "StorageUploadPart" (
  "id" TEXT NOT NULL,
  "objectId" TEXT NOT NULL,
  "partNumber" INTEGER NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "checksumSha256" TEXT NOT NULL,
  "etag" TEXT,
  "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StorageUploadPart_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StorageUploadPart_objectId_partNumber_key" ON "StorageUploadPart"("objectId", "partNumber");
CREATE INDEX "StorageUploadPart_objectId_completedAt_idx" ON "StorageUploadPart"("objectId", "completedAt");
ALTER TABLE "StorageUploadPart" ADD CONSTRAINT "StorageUploadPart_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "StorageObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
