import "server-only";

import crypto from "node:crypto";
import type { PhoneOtpPurpose, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { phoneAuthDigest, secureDigestMatch } from "@/lib/auth/phone";
import { sendPhoneAuthCode } from "@/lib/sms/provider";

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

export async function issuePhoneOtp(phoneE164: string, purpose: PhoneOtpPurpose) {
  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  const user = await prisma.user.findUnique({ where: { phoneE164 }, select: { id: true } });
  const challenge = await prisma.$transaction(async (tx) => {
    await tx.phoneOtpChallenge.updateMany({
      where: { phoneE164, purpose, consumedAt: null },
      data: { consumedAt: new Date() }
    });
    const created = await tx.phoneOtpChallenge.create({
      data: {
        userId: user?.id,
        phoneE164,
        purpose,
        codeHash: "pending",
        expiresAt: new Date(Date.now() + OTP_TTL_MS)
      }
    });
    return tx.phoneOtpChallenge.update({
      where: { id: created.id },
      data: { codeHash: phoneAuthDigest(`${created.id}:${code}`) }
    });
  });

  try {
    const result = await sendPhoneAuthCode(phoneE164, code);
    return { challengeId: challenge.id, developmentCode: result.developmentCode };
  } catch (error) {
    await prisma.phoneOtpChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } }).catch(() => undefined);
    throw error;
  }
}

export async function verifyPhoneOtp(challengeId: string, phoneE164: string, code: string, purpose: PhoneOtpPurpose) {
  const challenge = await prisma.phoneOtpChallenge.findUnique({ where: { id: challengeId } });
  if (!challenge || challenge.phoneE164 !== phoneE164 || challenge.purpose !== purpose || challenge.consumedAt || challenge.verifiedAt || challenge.expiresAt <= new Date() || challenge.attempts >= OTP_MAX_ATTEMPTS) {
    return null;
  }

  const digest = phoneAuthDigest(`${challenge.id}:${code}`);
  if (!secureDigestMatch(digest, challenge.codeHash)) {
    await prisma.phoneOtpChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
    return null;
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenHash = phoneAuthDigest(`${challenge.id}:${verificationToken}`);
  const claimed = await prisma.phoneOtpChallenge.updateMany({
    where: { id: challenge.id, verifiedAt: null, consumedAt: null, expiresAt: { gt: new Date() }, attempts: { lt: OTP_MAX_ATTEMPTS } },
    data: { verifiedAt: new Date(), verificationTokenHash }
  });
  return claimed.count ? verificationToken : null;
}

export async function consumeVerifiedPhoneChallenge(
  tx: Prisma.TransactionClient,
  input: { challengeId: string; phoneE164: string; purpose: PhoneOtpPurpose; verificationToken: string }
) {
  const verificationTokenHash = phoneAuthDigest(`${input.challengeId}:${input.verificationToken}`);
  const challenge = await tx.phoneOtpChallenge.findUnique({ where: { id: input.challengeId } });
  if (!challenge || challenge.phoneE164 !== input.phoneE164 || challenge.purpose !== input.purpose || !challenge.verifiedAt || challenge.consumedAt || challenge.expiresAt <= new Date() || !challenge.verificationTokenHash || !secureDigestMatch(verificationTokenHash, challenge.verificationTokenHash)) {
    return false;
  }
  const consumed = await tx.phoneOtpChallenge.updateMany({
    where: { id: challenge.id, consumedAt: null, verificationTokenHash },
    data: { consumedAt: new Date() }
  });
  return consumed.count === 1;
}
