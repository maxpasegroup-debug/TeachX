CREATE TYPE "PrivacyRequestType" AS ENUM ('ACCESS', 'EXPORT', 'CORRECTION', 'DELETION', 'RESTRICTION', 'OBJECTION');
CREATE TYPE "PrivacyRequestStatus" AS ENUM ('SUBMITTED', 'IDENTITY_VERIFICATION', 'IN_REVIEW', 'APPROVED', 'FULFILLED', 'REJECTED', 'CANCELLED');
CREATE TYPE "ConsentCategory" AS ENUM ('ESSENTIAL', 'FUNCTIONAL', 'ANALYTICS', 'MARKETING', 'AI_PROCESSING', 'POLICY_ACKNOWLEDGEMENT');

CREATE TABLE "PrivacyConsent" (
  "id" TEXT NOT NULL, "userId" TEXT, "anonymousId" TEXT, "category" "ConsentCategory" NOT NULL,
  "granted" BOOLEAN NOT NULL, "policyVersion" TEXT NOT NULL, "source" TEXT NOT NULL,
  "jurisdiction" TEXT, "globalPrivacyControl" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PrivacyConsent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PrivacyRequest" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "institutionId" TEXT, "type" "PrivacyRequestType" NOT NULL,
  "status" "PrivacyRequestStatus" NOT NULL DEFAULT 'SUBMITTED', "details" TEXT, "assignedToId" TEXT,
  "resolution" TEXT, "legalHold" BOOLEAN NOT NULL DEFAULT false, "dueAt" TIMESTAMP(3) NOT NULL,
  "verifiedAt" TIMESTAMP(3), "fulfilledAt" TIMESTAMP(3), "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PrivacyRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PrivacyRequestEvent" (
  "id" TEXT NOT NULL, "requestId" TEXT NOT NULL, "status" "PrivacyRequestStatus" NOT NULL,
  "note" TEXT NOT NULL, "actorId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PrivacyRequestEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DataRetentionPolicy" (
  "id" TEXT NOT NULL, "dataset" TEXT NOT NULL, "retentionDays" INTEGER NOT NULL, "legalBasis" TEXT NOT NULL,
  "disposition" TEXT NOT NULL, "enabled" BOOLEAN NOT NULL DEFAULT true, "updatedById" TEXT,
  "lastReviewedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "DataRetentionPolicy_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PrivacyConsent_userId_category_createdAt_idx" ON "PrivacyConsent"("userId", "category", "createdAt");
CREATE INDEX "PrivacyConsent_anonymousId_category_createdAt_idx" ON "PrivacyConsent"("anonymousId", "category", "createdAt");
CREATE INDEX "PrivacyConsent_policyVersion_createdAt_idx" ON "PrivacyConsent"("policyVersion", "createdAt");
CREATE INDEX "PrivacyRequest_userId_createdAt_idx" ON "PrivacyRequest"("userId", "createdAt");
CREATE INDEX "PrivacyRequest_status_dueAt_idx" ON "PrivacyRequest"("status", "dueAt");
CREATE INDEX "PrivacyRequest_institutionId_status_createdAt_idx" ON "PrivacyRequest"("institutionId", "status", "createdAt");
CREATE INDEX "PrivacyRequestEvent_requestId_createdAt_idx" ON "PrivacyRequestEvent"("requestId", "createdAt");
CREATE UNIQUE INDEX "DataRetentionPolicy_dataset_key" ON "DataRetentionPolicy"("dataset");
ALTER TABLE "PrivacyConsent" ADD CONSTRAINT "PrivacyConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PrivacyRequest" ADD CONSTRAINT "PrivacyRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PrivacyRequestEvent" ADD CONSTRAINT "PrivacyRequestEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "PrivacyRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "DataRetentionPolicy" ("id", "dataset", "retentionDays", "legalBasis", "disposition", "enabled", "createdAt", "updatedAt") VALUES
('privacy_account', 'Account and profile', 30, 'Contract and user request', 'Delete or irreversibly anonymize after approved closure', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('privacy_finance', 'Invoices, payments and tax', 2555, 'Legal obligation', 'Restrict access, then delete after statutory period', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('privacy_security', 'Security and audit evidence', 365, 'Legitimate interests and security', 'Delete or aggregate after review', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('privacy_support', 'Support conversations', 730, 'Contract and legitimate interests', 'Delete after closure period unless held', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('privacy_ai', 'AI prompts and outputs', 90, 'Contract and user control', 'Delete saved history unless retained by user', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('privacy_backups', 'Encrypted backups', 30, 'Security and continuity', 'Expire through provider lifecycle rules', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
