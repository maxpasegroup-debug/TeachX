import type { ActivityType, NotificationStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

const teacherRoles = ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"];

export async function getTeacherNotificationCenter(userId?: string, institutionId?: string | null) {
  if (!userId || !institutionId) return null;
  const teacher = await prisma.user.findFirst({
    where: { id: userId, institutionId, status: "ACTIVE", roles: { some: { role: { key: { in: teacherRoles } } } } },
    select: { id: true }
  });
  if (!teacher) return null;

  const [notifications, states, preferences] = await Promise.all([
    prisma.notification.findMany({
      where: { status: { not: "ARCHIVED" }, OR: [{ userId }, { userId: null, institutionId }] },
      orderBy: { createdAt: "desc" },
      take: 100
    }),
    prisma.userPreference.findMany({ where: { userId, key: { startsWith: "notification-state:" } }, take: 200 }),
    prisma.notificationPreference.findMany({ where: { userId } })
  ]);
  const stateMap = new Map(states.map((item) => [item.key.slice("notification-state:".length), item.value]));
  return {
    notifications: notifications.flatMap((item) => {
      const state = stateMap.get(item.id);
      const record = state && typeof state === "object" && !Array.isArray(state) ? state as Record<string, unknown> : {};
      if (record.hidden) return [];
      return [{
        id: item.id, title: item.title, body: item.body, link: item.link,
        category: notificationCategory(item.metadata),
        status: (record.read === true ? "READ" : record.read === false ? "UNREAD" : item.status) as NotificationStatus,
        createdAt: item.createdAt.toISOString()
      }];
    }),
    preferences
  };
}

export function notificationCategory(metadata: unknown) {
  const record = metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata as Record<string, unknown> : {};
  const source = String(record.category ?? record.type ?? "SYSTEM").toUpperCase();
  if (source.includes("STUDENT") || source.includes("ASSIGN") || source.includes("ATTEND")) return "STUDENTS";
  if (source.includes("TEACH") || source.includes("CLASS") || source.includes("PLANNER")) return "TEACHING";
  if (source.includes("AI")) return "AI";
  if (source.includes("RESOURCE") || source.includes("CONTENT")) return "RESOURCES";
  if (source.includes("COMMUNITY") || source.includes("MESSAGE") || source.includes("DISCUSSION")) return "COMMUNITY";
  if (source.includes("MARKET")) return "MARKETPLACE";
  if (source.includes("BUSINESS") || source.includes("ORDER") || source.includes("WALLET")) return "BUSINESS";
  if (source.includes("INSTITUTION") || source.includes("ANNOUNCEMENT")) return "INSTITUTION";
  return "SYSTEM";
}

export async function setTeacherNotificationState(input: { userId: string; institutionId: string; id: string; status: "READ" | "UNREAD" }) {
  const owned = await prisma.notification.updateMany({
    where: { id: input.id, userId: input.userId },
    data: { status: input.status, readAt: input.status === "READ" ? new Date() : null }
  });
  if (owned.count) return owned.count;
  const broadcast = await prisma.notification.count({ where: { id: input.id, userId: null, institutionId: input.institutionId, status: { not: "ARCHIVED" } } });
  if (!broadcast) return 0;
  await prisma.userPreference.upsert({
    where: { userId_key: { userId: input.userId, key: `notification-state:${input.id}` } },
    create: { userId: input.userId, key: `notification-state:${input.id}`, value: { read: input.status === "READ" } },
    update: { value: { read: input.status === "READ" } }
  });
  return 1;
}

export async function markAllTeacherNotificationsRead(userId: string, institutionId: string) {
  const broadcasts = await prisma.notification.findMany({ where: { userId: null, institutionId, status: { not: "ARCHIVED" } }, select: { id: true }, take: 100 });
  await prisma.$transaction([
    prisma.notification.updateMany({ where: { userId, status: "UNREAD" }, data: { status: "READ", readAt: new Date() } }),
    ...broadcasts.map((item) => prisma.userPreference.upsert({
      where: { userId_key: { userId, key: `notification-state:${item.id}` } },
      create: { userId, key: `notification-state:${item.id}`, value: { read: true } },
      update: { value: { read: true } }
    }))
  ]);
}

export const teacherNotificationPreferenceTypes: ActivityType[] = ["SYSTEM", "CONTENT", "ANNOUNCEMENT", "ASSIGNMENT", "PLANNER"];
