import type { ActivityType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export async function recordActivity(input: {
  institutionId?: string | null;
  actorId?: string | null;
  type: ActivityType;
  title: string;
  body?: string;
  entity?: string;
  entityId?: string;
  link?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.activity.create({
    data: {
      institutionId: input.institutionId ?? undefined,
      actorId: input.actorId ?? undefined,
      type: input.type,
      title: input.title,
      body: input.body,
      entity: input.entity,
      entityId: input.entityId,
      link: input.link,
      metadata: input.metadata
    }
  });
}

export async function getRecentActivities(institutionId?: string | null, limit = 12) {
  if (!institutionId) return [];

  const [activities, auditLogs, leadActivities] = await Promise.all([
    prisma.activity.findMany({
      where: { institutionId },
      include: { actor: true },
      orderBy: { createdAt: "desc" },
      take: limit
    }),
    prisma.auditLog.findMany({
      where: { institutionId },
      include: { actor: true },
      orderBy: { createdAt: "desc" },
      take: limit
    }),
    prisma.leadActivity.findMany({
      where: { lead: { institutionId } },
      include: { actor: true, lead: true },
      orderBy: { createdAt: "desc" },
      take: limit
    })
  ]);

  return [
    ...activities.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      actor: item.actor?.name,
      link: item.link ?? undefined,
      createdAt: item.createdAt,
      type: item.type
    })),
    ...auditLogs.map((item) => ({
      id: item.id,
      title: item.message ?? `${item.action.toLowerCase()} ${item.entity}`,
      body: item.entity,
      actor: item.actor?.name,
      link: undefined,
      createdAt: item.createdAt,
      type: "SYSTEM" as const
    })),
    ...leadActivities.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.lead.name,
      actor: item.actor?.name,
      link: "/admissions",
      createdAt: item.createdAt,
      type: "ADMISSION" as const
    }))
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}
