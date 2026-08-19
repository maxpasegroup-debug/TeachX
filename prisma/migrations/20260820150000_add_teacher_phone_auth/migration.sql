-- Mobile-first teacher authentication with one-time enrollment and recovery challenges.
CREATE TYPE "PhoneOtpPurpose" AS ENUM ('TEACHER_SIGNUP', 'PIN_RESET');

ALTER TABLE "User"
ADD COLUMN "phoneE164" TEXT,
ADD COLUMN "phoneVerifiedAt" TIMESTAMP(3),
ADD COLUMN "pinHash" TEXT,
ADD COLUMN "pinFailedAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "pinLockedUntil" TIMESTAMP(3),
ADD COLUMN "pinChangedAt" TIMESTAMP(3),
ADD COLUMN "authSessionVersion" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "PhoneOtpChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "phoneE164" TEXT NOT NULL,
    "purpose" "PhoneOtpPurpose" NOT NULL,
    "codeHash" TEXT NOT NULL,
    "verificationTokenHash" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "consumedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhoneOtpChallenge_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_phoneE164_key" ON "User"("phoneE164");
CREATE UNIQUE INDEX "PhoneOtpChallenge_verificationTokenHash_key" ON "PhoneOtpChallenge"("verificationTokenHash");
CREATE INDEX "PhoneOtpChallenge_phoneE164_purpose_createdAt_idx" ON "PhoneOtpChallenge"("phoneE164", "purpose", "createdAt");
CREATE INDEX "PhoneOtpChallenge_userId_purpose_createdAt_idx" ON "PhoneOtpChallenge"("userId", "purpose", "createdAt");
CREATE INDEX "PhoneOtpChallenge_expiresAt_idx" ON "PhoneOtpChallenge"("expiresAt");

ALTER TABLE "PhoneOtpChallenge" ADD CONSTRAINT "PhoneOtpChallenge_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
