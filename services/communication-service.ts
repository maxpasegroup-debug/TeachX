import type { CommunicationChannel, CommunicationKind, CommunicationPriority } from "@prisma/client";

import { prisma } from "@/lib/db";
import { createModuleNotification } from "@/services/notification-aggregation-service";

export async function getCommunicationCenter(institutionId?: string | null) {
  if (!institutionId) return { communications: [], logs: [] };

  const [communications, logs] = await Promise.all([
    prisma.communication.findMany({ where: { institutionId }, include: { recipients: { include: { user: true } }, logs: true }, orderBy: { createdAt: "desc" } }),
    prisma.communicationLog.findMany({ where: { communication: { institutionId } }, include: { communication: true, user: true }, orderBy: { createdAt: "desc" }, take: 20 })
  ]);

  return { communications, logs };
}

export async function createCommunication(input: {
  institutionId: string;
  createdById?: string;
  kind: CommunicationKind;
  title: string;
  body: string;
  priority?: CommunicationPriority;
  channels: CommunicationChannel[];
  roleKey?: string;
  courseId?: string;
  batchId?: string;
  userIds?: string[];
  scheduledAt?: Date;
  expiresAt?: Date;
  attachmentUrl?: string;
}) {
  const communication = await prisma.communication.create({
    data: {
      institutionId: input.institutionId,
      createdById: input.createdById,
      kind: input.kind,
      title: input.title,
      body: input.body,
      priority: input.priority ?? "NORMAL",
      channels: input.channels,
      roleKey: input.roleKey,
      courseId: input.courseId,
      batchId: input.batchId,
      scheduledAt: input.scheduledAt,
      expiresAt: input.expiresAt,
      attachmentUrl: input.attachmentUrl,
      status: input.scheduledAt ? "SCHEDULED" : "SENT",
      publishedAt: input.scheduledAt ? undefined : new Date(),
      recipients: {
        create: [
          ...(input.userIds ?? []).map((userId) => ({ userId })),
          ...(input.roleKey ? [{ roleKey: input.roleKey }] : []),
          ...(input.courseId ? [{ courseId: input.courseId }] : []),
          ...(input.batchId ? [{ batchId: input.batchId }] : [])
        ]
      },
      logs: {
        create: input.channels.map((channel) => ({ channel, status: input.scheduledAt ? "SCHEDULED" : "SENT", provider: `${channel.toLowerCase()}_ready` }))
      }
    }
  });

  if (input.channels.includes("IN_APP")) {
    await createModuleNotification({ institutionId: input.institutionId, type: input.kind === "ANNOUNCEMENT" ? "ANNOUNCEMENT" : "SYSTEM", title: input.title, body: input.body, link: "/dashboard" });
  }

  return communication;
}
