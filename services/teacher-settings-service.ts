import { prisma } from "@/lib/db";

export async function getTeacherSettings(userId?: string) {
  if (!userId) return null;
  const [user, preference, notifications, subscription] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, include: { profile: true, teacherProfile: true } }),
    prisma.userPreference.findUnique({ where: { userId_key: { userId, key: "teacher.settings" } } }),
    prisma.notificationPreference.findMany({ where: { userId } }),
    prisma.userSubscription.findFirst({ where: { userId, status: { in: ["ACTIVE", "TRIALING"] } }, include: { plan: true }, orderBy: { updatedAt: "desc" } })
  ]);
  if (!user) return null;
  const settings = preference?.value && typeof preference.value === "object" && !Array.isArray(preference.value) ? preference.value as Record<string, unknown> : {};
  return { user, settings, notifications, subscription };
}
