import type { ActivityType, Prisma, WorkspaceKind } from "@prisma/client";

import { prisma } from "@/lib/db";

export async function getUserPreferences(userId?: string) {
  if (!userId) return { workspacePreferences: [], preferences: [], savedSearches: [], recentItems: [], favoriteItems: [], notificationPreferences: [] };

  const [workspacePreferences, preferences, savedSearches, recentItems, favoriteItems, notificationPreferences] = await Promise.all([
    prisma.workspacePreference.findMany({ where: { userId } }),
    prisma.userPreference.findMany({ where: { userId } }),
    prisma.savedSearch.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 8 }),
    prisma.recentItem.findMany({ where: { userId }, orderBy: { viewedAt: "desc" }, take: 10 }),
    prisma.favoriteItem.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.notificationPreference.findMany({ where: { userId } })
  ]);

  return { workspacePreferences, preferences, savedSearches, recentItems, favoriteItems, notificationPreferences };
}

export async function setWorkspacePreference(userId: string, workspace: WorkspaceKind, layout?: Prisma.InputJsonValue) {
  return prisma.workspacePreference.upsert({
    where: { userId_workspace: { userId, workspace } },
    update: { layout },
    create: { userId, workspace, layout }
  });
}

export async function setNotificationPreference(userId: string, type: ActivityType, enabled: boolean) {
  return prisma.notificationPreference.upsert({
    where: { userId_type: { userId, type } },
    update: { enabled },
    create: { userId, type, enabled }
  });
}

export async function rememberRecentItem(input: { userId: string; type: string; entityId: string; title: string; link?: string }) {
  return prisma.recentItem.upsert({
    where: { userId_type_entityId: { userId: input.userId, type: input.type, entityId: input.entityId } },
    update: { title: input.title, link: input.link, viewedAt: new Date() },
    create: input
  });
}
