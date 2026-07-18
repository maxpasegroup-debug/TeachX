import { prisma } from "@/lib/db";

export async function getRecentNotifications(userId?: string, take = 5) {
  if (!userId) return [];

  return prisma.notification.findMany({
    where: { userId, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "desc" },
    take
  });
}

export async function markNotificationRead(userId: string, notificationId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { status: "READ", readAt: new Date() }
  });
}

export async function archiveNotification(userId: string, notificationId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { status: "ARCHIVED" }
  });
}
