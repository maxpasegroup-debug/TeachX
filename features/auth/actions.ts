"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import type { PhoneOtpPurpose } from "@prisma/client";

import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { getRequestOrigin } from "@/lib/host";
import { getClientKey, rateLimit } from "@/lib/security";
import type { RoleKey } from "@/lib/constants/roles";
import { consumeEmailVerification, issueEmailVerification, sendPasswordResetEmail } from "@/services/transactional-email-service";
import { maskPhoneNumber, normalizePhoneNumber, validatePin } from "@/lib/auth/phone";
import { consumeVerifiedPhoneChallenge, issuePhoneOtp, verifyPhoneOtp } from "@/services/phone-auth-service";
import { defaultSubscriptionPlans, getTrialEndDate } from "@/services/commerce-service";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  remember: z.string().optional(),
  callbackUrl: z.string().optional()
});

function getSafeEntryTarget(path?: string) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/dashboard";
  return path;
}

async function getAuthRedirect(path: string) {
  const origin = getRequestOrigin(await headers());
  return origin ? new URL(path, origin).toString() : path;
}

async function getActionClientKey(fallback: string) {
  const h = await headers();
  return getClientKey({ headers: h } as Request, fallback);
}

function credentialsFormData(email: string, password: string, redirectTo: string) {
  const data = new FormData();
  data.set("email", email);
  data.set("password", password);
  data.set("redirectTo", redirectTo);
  return data;
}

export async function loginAction(previousState: string | undefined, formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Please check your login details.";
  }

  const limited = await rateLimit(`login:${await getActionClientKey(parsed.data.email.toLowerCase())}`, 10, 60_000);
  if (limited) return "Too many login attempts. Please try again shortly.";

  try {
    await signIn("staff-credentials", credentialsFormData(
      parsed.data.email.toLowerCase(),
      parsed.data.password,
      await getAuthRedirect(`/entry?mode=login&next=${encodeURIComponent(getSafeEntryTarget(parsed.data.callbackUrl))}`)
    ));
  } catch (error) {
    if (error instanceof AuthError) {
      return "Email or password is incorrect.";
    }
    throw error;
  }
}

export type PhoneAuthActionResult = {
  ok: boolean;
  message: string;
  phoneE164?: string;
  maskedPhone?: string;
  challengeId?: string;
  verificationToken?: string;
  developmentCode?: string;
};

const phoneRequestSchema = z.object({
  phone: z.string().min(5, "Enter your mobile number."),
  country: z.string().length(2).optional()
});

const phoneVerificationSchema = phoneRequestSchema.extend({
  challengeId: z.string().min(10),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code.")
});

async function requestPhoneOtp(formData: FormData, purpose: PhoneOtpPurpose): Promise<PhoneAuthActionResult> {
  const parsed = phoneRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Enter a valid mobile number." };
  const phoneE164 = normalizePhoneNumber(parsed.data.phone, parsed.data.country);
  if (!phoneE164) return { ok: false, message: "Enter a valid mobile number with the correct country." };

  const clientKey = await getActionClientKey(phoneE164);
  const cooldown = await rateLimit(`phone-otp-cooldown:${purpose}:${phoneE164}`, 1, 45_000);
  const phoneLimit = await rateLimit(`phone-otp-hour:${purpose}:${phoneE164}`, 3, 60 * 60 * 1000);
  const clientLimit = await rateLimit(`phone-otp-client:${purpose}:${clientKey}`, 10, 60 * 60 * 1000);
  if (cooldown || phoneLimit || clientLimit) return { ok: false, message: "Please wait before requesting another code." };

  try {
    const challenge = await issuePhoneOtp(phoneE164, purpose);
    return {
      ok: true,
      message: `We sent a verification code to ${maskPhoneNumber(phoneE164)}.`,
      phoneE164,
      maskedPhone: maskPhoneNumber(phoneE164),
      challengeId: challenge.challengeId,
      developmentCode: challenge.developmentCode
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "We could not send the code. Please try again." };
  }
}

async function confirmPhoneOtp(formData: FormData, purpose: PhoneOtpPurpose): Promise<PhoneAuthActionResult> {
  const parsed = phoneVerificationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the verification code." };
  const phoneE164 = normalizePhoneNumber(parsed.data.phone, parsed.data.country);
  if (!phoneE164) return { ok: false, message: "The mobile number is invalid." };
  const limited = await rateLimit(`phone-otp-verify:${purpose}:${await getActionClientKey(phoneE164)}`, 10, 5 * 60 * 1000);
  if (limited) return { ok: false, message: "Too many attempts. Request a new code." };

  const verificationToken = await verifyPhoneOtp(parsed.data.challengeId, phoneE164, parsed.data.code, purpose);
  if (!verificationToken) return { ok: false, message: "The code is incorrect or expired." };
  return { ok: true, message: "Mobile number verified.", phoneE164, challengeId: parsed.data.challengeId, verificationToken };
}

export async function requestTeacherSignupOtpAction(formData: FormData) {
  return requestPhoneOtp(formData, "TEACHER_SIGNUP");
}

export async function verifyTeacherSignupOtpAction(formData: FormData) {
  return confirmPhoneOtp(formData, "TEACHER_SIGNUP");
}

export async function requestPinResetOtpAction(formData: FormData) {
  return requestPhoneOtp(formData, "PIN_RESET");
}

export async function verifyPinResetOtpAction(formData: FormData) {
  return confirmPhoneOtp(formData, "PIN_RESET");
}

const teacherPhoneSignupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(100),
  email: z.union([z.literal(""), z.string().email("Enter a valid email or leave it blank.")]).optional(),
  country: z.string().length(2).default("IN"),
  phone: z.string().min(8),
  pin: z.string(),
  confirmPin: z.string(),
  agreement: z.literal("on", { errorMap: () => ({ message: "Please accept the privacy policy and terms." }) })
}).superRefine((data, context) => {
  const pinError = validatePin(data.pin);
  if (pinError) context.addIssue({ code: z.ZodIssueCode.custom, message: pinError, path: ["pin"] });
  if (data.pin !== data.confirmPin) context.addIssue({ code: z.ZodIssueCode.custom, message: "PINs do not match.", path: ["confirmPin"] });
});

export type TeacherSignupResult = { ok: boolean; message?: string };

export async function completeTeacherPhoneSignupAction(formData: FormData): Promise<TeacherSignupResult> {
  const parsed = teacherPhoneSignupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check your account details." };
  const phoneE164 = normalizePhoneNumber(parsed.data.phone, parsed.data.country);
  if (!phoneE164) return { ok: false, message: "Enter a valid mobile number." };

  const role = await prisma.role.findUnique({ where: { key: "ACADEMIC_FACULTY" } });
  if (!role) return { ok: false, message: "Teacher accounts are not configured yet. Please contact support." };
  const email = parsed.data.email?.trim().toLowerCase() || `mobile-${phoneE164.slice(1)}-${crypto.randomBytes(5).toString("hex")}@accounts.teachx.invalid`;
  const existing = await prisma.user.findFirst({ where: { OR: [{ phoneE164 }, { email }] }, select: { phoneE164: true } });
  if (existing) return { ok: false, message: existing.phoneE164 === phoneE164 ? "An account already exists for this mobile number. Please log in." : "This email is already connected to another account." };

  const pinHash = await bcrypt.hash(parsed.data.pin, 12);
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: parsed.data.name,
        email,
        userType: "teacher",
        // A teacher must always enter TeachX through a real tenant. Creating a
        // personal institution uses the existing tenancy model and prevents
        // every teacher-facing query from receiving an undefined tenant.
        institution: { create: { name: `${parsed.data.name}'s TeachX Workspace` } },
        phoneE164,
        phoneVerifiedAt: new Date(),
        pinHash,
        pinChangedAt: new Date(),
        profile: { create: { phone: phoneE164, title: "Teacher" } },
        teacherProfile: { create: { headline: "Teach with AI on TeachX", onboardingStep: "welcome" } },
        roles: { create: { roleId: role.id } },
        privacyConsents: {
          create: [
            { category: "ESSENTIAL", granted: true, policyVersion: "2026-08-20", source: "teacher_phone_signup" },
            { category: "POLICY_ACKNOWLEDGEMENT", granted: true, policyVersion: "2026-08-20", source: "teacher_phone_signup" }
          ]
        }
      }
    });
    if (!user.institutionId) throw new Error("Teacher workspace creation did not return a tenant.");

    const launchPlan = defaultSubscriptionPlans.find((plan) => plan.key === "teacher-basic");
    if (!launchPlan) throw new Error("TeachX Basic is not configured.");
    const plan = await tx.subscriptionPlan.create({
      data: {
        institutionId: user.institutionId,
        key: launchPlan.key,
        name: launchPlan.name,
        audience: launchPlan.audience,
        price: launchPlan.price,
        currency: "INR",
        aiMonthlyCredits: launchPlan.aiMonthlyCredits,
        marketplaceAccess: launchPlan.marketplaceAccess,
        resourceLimit: launchPlan.resourceLimit,
        storageLimitMb: launchPlan.storageLimitMb,
        featureFlags: launchPlan.featureFlags
      }
    });
    const trialStartedAt = new Date();
    const trialEndsAt = getTrialEndDate(trialStartedAt);
    await tx.userSubscription.create({
      data: {
        userId: user.id,
        institutionId: user.institutionId,
        planId: plan.id,
        status: "TRIALING",
        currentPeriodStart: trialStartedAt,
        currentPeriodEnd: trialEndsAt,
        metadata: { source: "teacher_phone_signup", trial: true, trialDays: 7 }
      }
    });
    await tx.notification.create({
      data: {
        userId: user.id,
        institutionId: user.institutionId,
        title: "Your 7-day TeachX trial is active",
        body: "Explore the four teacher worlds and use your included AI credits before choosing a plan.",
        link: "/teacher/business/subscription"
      }
    });
    await tx.auditLog.create({ data: { actorId: user.id, action: "CREATE", entity: "TeacherAccount", entityId: user.id, message: "Teacher created a mobile and PIN account." } });
  }, { isolationLevel: "Serializable" });

  // The browser performs the sign-in after this action completes. Keeping
  // account creation and credential sign-in separate avoids an Auth.js server
  // action callback mismatch on Railway's multi-domain proxy.
  return { ok: true };
}

const completePinResetSchema = z.object({
  phone: z.string().min(8),
  pin: z.string(),
  confirmPin: z.string(),
  challengeId: z.string().min(10),
  verificationToken: z.string().length(64)
}).superRefine((data, context) => {
  const pinError = validatePin(data.pin);
  if (pinError) context.addIssue({ code: z.ZodIssueCode.custom, message: pinError, path: ["pin"] });
  if (data.pin !== data.confirmPin) context.addIssue({ code: z.ZodIssueCode.custom, message: "PINs do not match.", path: ["confirmPin"] });
});

export async function completePinResetAction(_: string | undefined, formData: FormData) {
  const parsed = completePinResetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Please check your new PIN.";
  const phoneE164 = normalizePhoneNumber(parsed.data.phone);
  if (!phoneE164) return "The verified mobile number is invalid.";
  const user = await prisma.user.findUnique({ where: { phoneE164 }, select: { id: true } });
  if (!user) return "The code is incorrect or expired.";
  const pinHash = await bcrypt.hash(parsed.data.pin, 12);

  const changed = await prisma.$transaction(async (tx) => {
    const consumed = await consumeVerifiedPhoneChallenge(tx, {
      challengeId: parsed.data.challengeId,
      phoneE164,
      purpose: "PIN_RESET",
      verificationToken: parsed.data.verificationToken
    });
    if (!consumed) return false;
    await tx.user.update({
      where: { id: user.id },
      data: { pinHash, pinChangedAt: new Date(), pinFailedAttempts: 0, pinLockedUntil: null, authSessionVersion: { increment: 1 } }
    });
    await tx.session.deleteMany({ where: { userId: user.id } });
    await tx.auditLog.create({ data: { actorId: user.id, action: "PASSWORD_RESET", entity: "TeacherPin", entityId: user.id, message: "Teacher PIN reset after SMS verification." } });
    return true;
  }, { isolationLevel: "Serializable" });
  if (!changed) return "Your verification expired. Please request a new code.";
  redirect("/login?reset=success");
}

const signupSchema = z.object({
  userType: z.enum(["teacher", "student"]),
  name: z.string().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(8, "Confirm your password."),
  phone: z.string().optional(),
  goal: z.string().optional(),
  agreement: z.literal("on", { errorMap: () => ({ message: "Please accept the privacy policy and terms." }) })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"]
});

const roleByUserType: Record<z.infer<typeof signupSchema>["userType"], RoleKey> = {
  teacher: "ACADEMIC_FACULTY",
  student: "STUDENT"
};

export async function signupAction(_: string | undefined, formData: FormData) {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Please check your signup details.";
  if (parsed.data.userType === "teacher") return "Teacher accounts must be created with mobile verification.";

  const email = parsed.data.email.toLowerCase();
  const limited = await rateLimit(`signup:${await getActionClientKey(email)}`, 5, 60_000);
  if (limited) return "Too many signup attempts. Please try again shortly.";

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return "An account already exists with this email.";

  const role = await prisma.role.findUnique({ where: { key: roleByUserType[parsed.data.userType] } });
  if (!role) return "Signup roles are not configured yet. Please run the platform seed first.";

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      userType: parsed.data.userType,
      profile: {
        create: {
          phone: parsed.data.phone || undefined,
          title: "Student"
        }
      },
      roles: {
        create: {
          roleId: role.id
        }
      },
      studentProfile: { create: { learningGoal: parsed.data.goal || "Learn with AI on LearnX" } }
    }
  });

  after(() => issueEmailVerification(user).catch(() => undefined));

  await signIn("staff-credentials", credentialsFormData(
    user.email,
    parsed.data.password,
    await getAuthRedirect("/entry?mode=signup&next=%2Fstudent")
  ));
}

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address.")
});

export async function forgotPasswordAction(_: string | undefined, formData: FormData) {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message;

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() }
  });

  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetToken = await prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
      return tx.passwordResetToken.create({ data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30)
      } });
    });
    after(() => sendPasswordResetEmail(user, token, resetToken.id).catch(() => undefined));
  }

  return "If the email exists, a reset link will be sent.";
}

const resetPasswordSchema = z.object({
  token: z.string().min(16),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string().min(8, "Confirm your password.")
}).refine((data) => data.password === data.confirmPassword, { message: "Passwords do not match.", path: ["confirmPassword"] });

export async function resetPasswordAction(_: string | undefined, formData: FormData) {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message;

  const tokenHash = crypto.createHash("sha256").update(parsed.data.token).digest("hex");
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash }
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return "This reset link is invalid or expired.";
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const changed = await prisma.$transaction(async (tx) => {
    const claimed = await tx.passwordResetToken.updateMany({ where: { id: resetToken.id, usedAt: null, expiresAt: { gt: new Date() } }, data: { usedAt: new Date() } });
    if (!claimed.count) return false;
    await tx.user.update({ where: { id: resetToken.userId }, data: { passwordHash, authSessionVersion: { increment: 1 } } });
    await tx.session.deleteMany({ where: { userId: resetToken.userId } });
    await tx.passwordResetToken.updateMany({ where: { userId: resetToken.userId, usedAt: null }, data: { usedAt: new Date() } });
    return true;
  }, { isolationLevel: "Serializable" });
  if (!changed) return "This reset link is invalid or expired.";

  redirect("/login?reset=success");
}

export async function verifyEmailAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const user = await consumeEmailVerification(token);
  if (!user) redirect("/verify-email?invalid=1");
  redirect("/login?verified=success");
}

export async function resendVerificationAction(_: string | undefined) {
  const session = await auth();
  if (!session?.user.id) return "Sign in to resend verification.";
  const limited = await rateLimit(`verify-email:${session.user.id}`, 3, 60 * 60 * 1000);
  if (limited) return "Please wait before requesting another verification email.";
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, institutionId: true, email: true, name: true, emailVerifiedAt: true } });
  if (!user || user.emailVerifiedAt) return "Your email is already verified.";
  if (user.email.endsWith("@accounts.teachx.invalid")) return "Add an email in settings before requesting verification.";
  after(() => issueEmailVerification(user).catch(() => undefined));
  return "Verification email requested.";
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
