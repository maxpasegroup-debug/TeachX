"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import type { RoleKey } from "@/lib/constants/roles";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  remember: z.string().optional(),
  callbackUrl: z.string().optional()
});

export async function loginAction(previousState: string | undefined, formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Please check your login details.";
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: parsed.data.callbackUrl || "/dashboard"
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Email or password is incorrect.";
    }
    throw error;
  }
}

const signupSchema = z.object({
  userType: z.enum(["teacher", "student"]),
  name: z.string().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phone: z.string().optional(),
  goal: z.string().optional()
});

const roleByUserType: Record<z.infer<typeof signupSchema>["userType"], RoleKey> = {
  teacher: "ACADEMIC_FACULTY",
  student: "STUDENT"
};

export async function signupAction(_: string | undefined, formData: FormData) {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Please check your signup details.";

  const email = parsed.data.email.toLowerCase();
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
          title: parsed.data.userType === "teacher" ? "Teacher" : "Student"
        }
      },
      roles: {
        create: {
          roleId: role.id
        }
      },
      teacherProfile: parsed.data.userType === "teacher" ? { create: { headline: parsed.data.goal || "Teach with AI on TeachX" } } : undefined,
      studentProfile: parsed.data.userType === "student" ? { create: { learningGoal: parsed.data.goal || "Learn with AI on TeachX" } } : undefined
    }
  });

  await signIn("credentials", {
    email: user.email,
    password: parsed.data.password,
    redirectTo: parsed.data.userType === "teacher" ? "/teacher" : "/student"
  });
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

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30)
      }
    });
  }

  return "If the email exists, a reset link will be sent.";
}

const resetPasswordSchema = z.object({
  token: z.string().min(16),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

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

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) }
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() }
    })
  ]);

  redirect("/login?reset=success");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
