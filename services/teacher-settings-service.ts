import { prisma } from "@/lib/db";
import { getAICreditSummary } from "@/services/commerce-service";

const teacherRoles = ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"];

export async function getTeacherSettings(userId?: string, institutionId?: string | null) {
  if (!userId || !institutionId) return null;
  const [user, preference, notifications] = await Promise.all([
    prisma.user.findFirst({
      where: { id: userId, institutionId, status: "ACTIVE", roles: { some: { role: { key: { in: teacherRoles } } } } },
      include: { profile: true, teacherProfile: true, institution: { select: { name: true } } }
    }),
    prisma.userPreference.findUnique({ where: { userId_key: { userId, key: "teacher.settings" } } }),
    prisma.notificationPreference.findMany({ where: { userId } })
  ]);
  if (!user) return null;
  const credits = await getAICreditSummary({ userId, institutionId, audience: "TEACHER" });
  const subscription = await prisma.userSubscription.findFirst({
    where: { userId, institutionId, status: { in: ["ACTIVE", "TRIALING"] }, plan: { audience: "TEACHER" } },
    include: { plan: true }, orderBy: { updatedAt: "desc" }
  });
  const settings = preference?.value && typeof preference.value === "object" && !Array.isArray(preference.value) ? preference.value as Record<string, unknown> : {};
  const profileFields = [user.profile?.avatarUrl, user.name, user.teacherProfile?.bio ?? user.profile?.bio, user.teacherProfile?.subjects.length, user.teacherProfile?.qualification, user.teacherProfile?.languages.length, user.teacherProfile?.teachingMode].filter(Boolean).length;
  return {
    user: { ...user, email: user.email.endsWith("@accounts.teachx.invalid") ? null : user.email },
    settings, notifications, subscription, credits,
    profileCompletion: Math.round((profileFields / 7) * 100),
    security: { authMethod: user.pinHash ? "Mobile number and PIN" : user.passwordHash ? "Email and password" : "Account sign-in", lastLoginAt: user.lastLoginAt, phoneVerified: Boolean(user.phoneVerifiedAt), emailVerified: Boolean(user.emailVerifiedAt) }
  };
}
