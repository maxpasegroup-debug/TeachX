import type { ActivityType } from "@prisma/client";

import { prisma } from "@/lib/db";

export async function getNotificationCenter(userId?: string, institutionId?: string | null) {
  if (!userId) return { unread: [], recent: [], preferences: [] };

  const [unread, recent, preferences] = await Promise.all([
    prisma.notification.findMany({ where: { userId, status: "UNREAD" }, orderBy: { createdAt: "desc" }, take: 12 }),
    prisma.notification.findMany({ where: { OR: [{ userId }, { userId: null, institutionId }] }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.notificationPreference.findMany({ where: { userId } })
  ]);

  return { unread, recent, preferences };
}

export async function createModuleNotification(input: {
  institutionId?: string | null;
  userId?: string | null;
  type: ActivityType;
  title: string;
  body?: string;
  link?: string;
  metadata?: Record<string, unknown>;
}) {
  if (input.userId) {
    const preference = await prisma.notificationPreference.findUnique({ where: { userId_type: { userId: input.userId, type: input.type } } });
    if (preference && !preference.enabled) return null;
  }

  return prisma.notification.create({
    data: {
      institutionId: input.institutionId ?? undefined,
      userId: input.userId ?? undefined,
      title: input.title,
      body: input.body,
      link: input.link,
      metadata: { type: input.type, ...(input.metadata ?? {}) }
    }
  });
}
