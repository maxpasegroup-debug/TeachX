CREATE TYPE "TransactionalEmailStatus" AS ENUM ('QUEUED', 'ACCEPTED', 'DELIVERED', 'DELAYED', 'BOUNCED', 'COMPLAINED', 'SUPPRESSED', 'FAILED');

CREATE TABLE "TransactionalEmail" (
  "id" TEXT NOT NULL,
  "institutionId" TEXT,
  "userId" TEXT,
  "kind" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'resend',
  "providerMessageId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "recipientHash" TEXT NOT NULL,
  "recipientDomain" TEXT NOT NULL,
  "status" "TransactionalEmailStatus" NOT NULL DEFAULT 'QUEUED',
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "lastErrorCode" TEXT,
  "acceptedAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TransactionalEmail_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TransactionalEmailEvent" (
  "id" TEXT NOT NULL,
  "providerEventId" TEXT NOT NULL,
  "providerMessageId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "payloadHash" TEXT NOT NULL,
  "emailId" TEXT,
  "providerCreatedAt" TIMESTAMP(3),
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TransactionalEmailEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TransactionalEmail_providerMessageId_key" ON "TransactionalEmail"("providerMessageId");
CREATE UNIQUE INDEX "TransactionalEmail_idempotencyKey_key" ON "TransactionalEmail"("idempotencyKey");
CREATE INDEX "TransactionalEmail_institutionId_createdAt_idx" ON "TransactionalEmail"("institutionId", "createdAt");
CREATE INDEX "TransactionalEmail_userId_createdAt_idx" ON "TransactionalEmail"("userId", "createdAt");
CREATE INDEX "TransactionalEmail_status_createdAt_idx" ON "TransactionalEmail"("status", "createdAt");
CREATE UNIQUE INDEX "TransactionalEmailEvent_providerEventId_key" ON "TransactionalEmailEvent"("providerEventId");
CREATE INDEX "TransactionalEmailEvent_providerMessageId_receivedAt_idx" ON "TransactionalEmailEvent"("providerMessageId", "receivedAt");
CREATE INDEX "TransactionalEmailEvent_emailId_receivedAt_idx" ON "TransactionalEmailEvent"("emailId", "receivedAt");

ALTER TABLE "TransactionalEmail" ADD CONSTRAINT "TransactionalEmail_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TransactionalEmail" ADD CONSTRAINT "TransactionalEmail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TransactionalEmailEvent" ADD CONSTRAINT "TransactionalEmailEvent_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "TransactionalEmail"("id") ON DELETE SET NULL ON UPDATE CASCADE;
