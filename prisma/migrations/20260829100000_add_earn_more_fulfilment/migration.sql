-- Earn More fulfilment is intentionally tenant-owned and server-side. Existing
-- teacher booking requests remain untouched; these tables power paid bookings.
CREATE TYPE "TeacherServiceBookingStatus" AS ENUM ('RESERVED', 'PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'REFUNDED', 'DISPUTED');
CREATE TYPE "EarnMoreSettlementStatus" AS ENUM ('PENDING', 'AVAILABLE', 'PAID_OUT', 'REFUNDED', 'DISPUTED', 'CANCELLED');
CREATE TYPE "TeacherPayoutAccountStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED', 'DISABLED');
CREATE TYPE "TeacherPayoutRequestStatus" AS ENUM ('REQUESTED', 'UNDER_REVIEW', 'PROCESSING', 'PAID', 'FAILED', 'REJECTED', 'CANCELLED');
CREATE TYPE "EarnMoreDisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED', 'CANCELLED');
CREATE TYPE "TeacherLiveProgramStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'CANCELLED', 'COMPLETED');
CREATE TYPE "TeacherLiveProgramRegistrationStatus" AS ENUM ('RESERVED', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'REFUNDED');

CREATE TABLE "TeacherServiceBooking" (
  "id" TEXT NOT NULL,
  "institutionId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "learnerId" TEXT NOT NULL,
  "serviceId" TEXT,
  "servicePlanId" TEXT,
  "bookingRequestId" TEXT,
  "orderId" TEXT,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "timezone" TEXT NOT NULL,
  "status" "TeacherServiceBookingStatus" NOT NULL DEFAULT 'RESERVED',
  "reservationExpiresAt" TIMESTAMP(3),
  "idempotencyKey" TEXT NOT NULL,
  "meetingDetails" JSONB,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeacherServiceBooking_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EarnMoreCommissionPolicy" (
  "id" TEXT NOT NULL,
  "institutionId" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "commissionBps" INTEGER NOT NULL,
  "settlementDays" INTEGER NOT NULL DEFAULT 7,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EarnMoreCommissionPolicy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EarnMoreSettlement" (
  "id" TEXT NOT NULL,
  "institutionId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "bookingId" TEXT,
  "teacherId" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "grossAmount" DECIMAL(65,30) NOT NULL,
  "commissionBps" INTEGER NOT NULL,
  "commissionAmount" DECIMAL(65,30) NOT NULL,
  "netAmount" DECIMAL(65,30) NOT NULL,
  "availableAt" TIMESTAMP(3) NOT NULL,
  "status" "EarnMoreSettlementStatus" NOT NULL DEFAULT 'PENDING',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EarnMoreSettlement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeacherPayoutAccount" (
  "id" TEXT NOT NULL,
  "institutionId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "recipientReference" TEXT NOT NULL,
  "status" "TeacherPayoutAccountStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
  "kycStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "verifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeacherPayoutAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeacherPayoutRequest" (
  "id" TEXT NOT NULL,
  "institutionId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "orderId" TEXT,
  "amount" DECIMAL(65,30) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" "TeacherPayoutRequestStatus" NOT NULL DEFAULT 'REQUESTED',
  "providerPayoutReference" TEXT,
  "failureReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeacherPayoutRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EarnMoreDispute" (
  "id" TEXT NOT NULL,
  "institutionId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "bookingId" TEXT,
  "raisedById" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "status" "EarnMoreDisputeStatus" NOT NULL DEFAULT 'OPEN',
  "resolution" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EarnMoreDispute_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeacherLiveProgram" (
  "id" TEXT NOT NULL,
  "institutionId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "timezone" TEXT NOT NULL,
  "capacity" INTEGER NOT NULL,
  "price" DECIMAL(65,30) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" "TeacherLiveProgramStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeacherLiveProgram_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeacherLiveProgramRegistration" (
  "id" TEXT NOT NULL,
  "institutionId" TEXT NOT NULL,
  "programId" TEXT NOT NULL,
  "learnerId" TEXT NOT NULL,
  "orderId" TEXT,
  "status" "TeacherLiveProgramRegistrationStatus" NOT NULL DEFAULT 'RESERVED',
  "reservationExpiresAt" TIMESTAMP(3),
  "idempotencyKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeacherLiveProgramRegistration_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CommerceOrderItem" ADD COLUMN "teacherServiceBookingId" TEXT;

CREATE UNIQUE INDEX "TeacherServiceBooking_bookingRequestId_key" ON "TeacherServiceBooking"("bookingRequestId");
CREATE UNIQUE INDEX "TeacherServiceBooking_orderId_key" ON "TeacherServiceBooking"("orderId");
CREATE UNIQUE INDEX "TeacherServiceBooking_institutionId_learnerId_idempotencyKey_key" ON "TeacherServiceBooking"("institutionId", "learnerId", "idempotencyKey");
CREATE INDEX "TeacherServiceBooking_institutionId_teacherId_startsAt_idx" ON "TeacherServiceBooking"("institutionId", "teacherId", "startsAt");
CREATE INDEX "TeacherServiceBooking_institutionId_learnerId_startsAt_idx" ON "TeacherServiceBooking"("institutionId", "learnerId", "startsAt");
CREATE INDEX "TeacherServiceBooking_status_reservationExpiresAt_idx" ON "TeacherServiceBooking"("status", "reservationExpiresAt");
CREATE UNIQUE INDEX "EarnMoreCommissionPolicy_institutionId_source_key" ON "EarnMoreCommissionPolicy"("institutionId", "source");
CREATE UNIQUE INDEX "EarnMoreSettlement_orderId_key" ON "EarnMoreSettlement"("orderId");
CREATE UNIQUE INDEX "EarnMoreSettlement_bookingId_key" ON "EarnMoreSettlement"("bookingId");
CREATE INDEX "EarnMoreSettlement_institutionId_teacherId_status_availableAt_idx" ON "EarnMoreSettlement"("institutionId", "teacherId", "status", "availableAt");
CREATE UNIQUE INDEX "TeacherPayoutAccount_institutionId_teacherId_provider_key" ON "TeacherPayoutAccount"("institutionId", "teacherId", "provider");
CREATE INDEX "TeacherPayoutAccount_institutionId_teacherId_status_idx" ON "TeacherPayoutAccount"("institutionId", "teacherId", "status");
CREATE UNIQUE INDEX "TeacherPayoutRequest_orderId_key" ON "TeacherPayoutRequest"("orderId");
CREATE INDEX "TeacherPayoutRequest_institutionId_teacherId_status_createdAt_idx" ON "TeacherPayoutRequest"("institutionId", "teacherId", "status", "createdAt");
CREATE INDEX "EarnMoreDispute_institutionId_status_createdAt_idx" ON "EarnMoreDispute"("institutionId", "status", "createdAt");
CREATE INDEX "EarnMoreDispute_orderId_idx" ON "EarnMoreDispute"("orderId");
CREATE INDEX "TeacherLiveProgram_institutionId_teacherId_status_startsAt_idx" ON "TeacherLiveProgram"("institutionId", "teacherId", "status", "startsAt");
CREATE UNIQUE INDEX "TeacherLiveProgramRegistration_orderId_key" ON "TeacherLiveProgramRegistration"("orderId");
CREATE UNIQUE INDEX "TeacherLiveProgramRegistration_programId_learnerId_key" ON "TeacherLiveProgramRegistration"("programId", "learnerId");
CREATE UNIQUE INDEX "TeacherLiveProgramRegistration_institutionId_learnerId_idempotencyKey_key" ON "TeacherLiveProgramRegistration"("institutionId", "learnerId", "idempotencyKey");
CREATE INDEX "TeacherLiveProgramRegistration_institutionId_programId_status_idx" ON "TeacherLiveProgramRegistration"("institutionId", "programId", "status");
CREATE INDEX "CommerceOrderItem_teacherServiceBookingId_idx" ON "CommerceOrderItem"("teacherServiceBookingId");

ALTER TABLE "TeacherServiceBooking" ADD CONSTRAINT "TeacherServiceBooking_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherServiceBooking" ADD CONSTRAINT "TeacherServiceBooking_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherServiceBooking" ADD CONSTRAINT "TeacherServiceBooking_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherServiceBooking" ADD CONSTRAINT "TeacherServiceBooking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "TeacherEarningService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TeacherServiceBooking" ADD CONSTRAINT "TeacherServiceBooking_servicePlanId_fkey" FOREIGN KEY ("servicePlanId") REFERENCES "TeacherEarningServicePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TeacherServiceBooking" ADD CONSTRAINT "TeacherServiceBooking_bookingRequestId_fkey" FOREIGN KEY ("bookingRequestId") REFERENCES "TeacherBookingRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TeacherServiceBooking" ADD CONSTRAINT "TeacherServiceBooking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CommerceOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EarnMoreCommissionPolicy" ADD CONSTRAINT "EarnMoreCommissionPolicy_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EarnMoreSettlement" ADD CONSTRAINT "EarnMoreSettlement_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EarnMoreSettlement" ADD CONSTRAINT "EarnMoreSettlement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CommerceOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EarnMoreSettlement" ADD CONSTRAINT "EarnMoreSettlement_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "TeacherServiceBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EarnMoreSettlement" ADD CONSTRAINT "EarnMoreSettlement_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherPayoutAccount" ADD CONSTRAINT "TeacherPayoutAccount_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherPayoutAccount" ADD CONSTRAINT "TeacherPayoutAccount_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherPayoutRequest" ADD CONSTRAINT "TeacherPayoutRequest_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherPayoutRequest" ADD CONSTRAINT "TeacherPayoutRequest_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherPayoutRequest" ADD CONSTRAINT "TeacherPayoutRequest_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TeacherPayoutAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TeacherPayoutRequest" ADD CONSTRAINT "TeacherPayoutRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CommerceOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EarnMoreDispute" ADD CONSTRAINT "EarnMoreDispute_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EarnMoreDispute" ADD CONSTRAINT "EarnMoreDispute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CommerceOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EarnMoreDispute" ADD CONSTRAINT "EarnMoreDispute_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "TeacherServiceBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EarnMoreDispute" ADD CONSTRAINT "EarnMoreDispute_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherLiveProgram" ADD CONSTRAINT "TeacherLiveProgram_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherLiveProgram" ADD CONSTRAINT "TeacherLiveProgram_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherLiveProgramRegistration" ADD CONSTRAINT "TeacherLiveProgramRegistration_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherLiveProgramRegistration" ADD CONSTRAINT "TeacherLiveProgramRegistration_programId_fkey" FOREIGN KEY ("programId") REFERENCES "TeacherLiveProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherLiveProgramRegistration" ADD CONSTRAINT "TeacherLiveProgramRegistration_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeacherLiveProgramRegistration" ADD CONSTRAINT "TeacherLiveProgramRegistration_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CommerceOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommerceOrderItem" ADD CONSTRAINT "CommerceOrderItem_teacherServiceBookingId_fkey" FOREIGN KEY ("teacherServiceBookingId") REFERENCES "TeacherServiceBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- A serializable transaction protects capacity checks; this constraint provides
-- the second, database-level guarantee against overlapping paid time.
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE "TeacherServiceBooking" ADD CONSTRAINT "TeacherServiceBooking_no_paid_overlap"
  EXCLUDE USING gist ("teacherId" WITH =, tstzrange("startsAt", "endsAt", '[)') WITH &&)
  WHERE ("status" IN ('RESERVED', 'PENDING_PAYMENT', 'CONFIRMED'));
