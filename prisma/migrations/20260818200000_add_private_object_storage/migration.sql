CREATE TYPE "StorageObjectStatus" AS ENUM ('PENDING', 'ACTIVE', 'QUARANTINED', 'EXPIRED', 'DELETED', 'FAILED');
CREATE TYPE "StorageTransferKind" AS ENUM ('UPLOAD_RESERVED', 'UPLOAD_COMPLETED', 'DOWNLOAD_SIGNED', 'QUARANTINED', 'EXPIRED', 'DELETED');

CREATE TABLE "StorageObject" (
  "id" TEXT NOT NULL,
  "institutionId" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "contentItemId" TEXT,
  "key" TEXT NOT NULL,
  "bucket" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" BIGINT NOT NULL,
  "checksumSha256" TEXT NOT NULL,
  "etag" TEXT,
  "status" "StorageObjectStatus" NOT NULL DEFAULT 'PENDING',
  "uploadExpiresAt" TIMESTAMP(3) NOT NULL,
  "activatedAt" TIMESTAMP(3),
  "deletedAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StorageObject_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StorageTransferEvent" (
  "id" TEXT NOT NULL,
  "objectId" TEXT NOT NULL,
  "actorId" TEXT,
  "kind" "StorageTransferKind" NOT NULL,
  "requestId" TEXT,
  "bytes" BIGINT,
  "detail" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StorageTransferEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StorageObject_contentItemId_key" ON "StorageObject"("contentItemId");
CREATE UNIQUE INDEX "StorageObject_key_key" ON "StorageObject"("key");
CREATE INDEX "StorageObject_institutionId_status_createdAt_idx" ON "StorageObject"("institutionId", "status", "createdAt");
CREATE INDEX "StorageObject_ownerId_status_createdAt_idx" ON "StorageObject"("ownerId", "status", "createdAt");
CREATE INDEX "StorageTransferEvent_objectId_createdAt_idx" ON "StorageTransferEvent"("objectId", "createdAt");
CREATE INDEX "StorageTransferEvent_actorId_createdAt_idx" ON "StorageTransferEvent"("actorId", "createdAt");
CREATE INDEX "StorageTransferEvent_kind_createdAt_idx" ON "StorageTransferEvent"("kind", "createdAt");

ALTER TABLE "StorageObject" ADD CONSTRAINT "StorageObject_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StorageObject" ADD CONSTRAINT "StorageObject_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StorageObject" ADD CONSTRAINT "StorageObject_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StorageTransferEvent" ADD CONSTRAINT "StorageTransferEvent_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "StorageObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StorageTransferEvent" ADD CONSTRAINT "StorageTransferEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
