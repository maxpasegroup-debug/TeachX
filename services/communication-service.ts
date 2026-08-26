import type { CommunicationChannel, CommunicationKind, CommunicationPriority } from "@prisma/client";

import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { userHasPermission } from "@/lib/rbac";
import { createModuleNotification } from "@/services/notification-aggregation-service";
import { requireAcademicReferences } from "@/services/academic-integrity-service";

export async function getCommunicationCenter(institutionId?: string | null) {
  if (!institutionId) return { communications: [], logs: [] };

  const [communications, logs] = await Promise.all([
    prisma.communication.findMany({ where: { institutionId }, include: { recipients: { include: { user: true } }, logs: true }, orderBy: { createdAt: "desc" } }),
    prisma.communicationLog.findMany({ where: { communication: { institutionId } }, include: { communication: true, user: true }, orderBy: { createdAt: "desc" }, take: 20 })
  ]);

  return { communications, logs };
}

export async function createCommunication(input: {
  institutionId?: string;
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
  const actor = await requireCurrentUser();
  if (!actor.institutionId || input.institutionId && input.institutionId !== actor.institutionId) {
    throw new Error("Authorized institution context is required.");
  }
  if (!userHasPermission(actor.roles, "operations.view") && !userHasPermission(actor.roles, "classrooms.manage")) {
    throw new Error("Communication permission is required.");
  }

  const institutionId = actor.institutionId;
  await requireAcademicReferences(institutionId, { courseId: input.courseId, batchId: input.batchId });
  const requestedUserIds = [...new Set(input.userIds ?? [])];
  const [authorizedUsers, course, batch, role] = await Promise.all([
    requestedUserIds.length
      ? prisma.user.findMany({ where: { id: { in: requestedUserIds }, institutionId, status: "ACTIVE" }, select: { id: true } })
      : Promise.resolve([]),
    input.courseId ? prisma.course.findFirst({ where: { id: input.courseId, institutionId }, select: { id: true } }) : Promise.resolve(null),
    input.batchId ? prisma.batch.findFirst({ where: { id: input.batchId, course: { institutionId } }, select: { id: true } }) : Promise.resolve(null),
    input.roleKey ? prisma.role.findUnique({ where: { key: input.roleKey }, select: { key: true } }) : Promise.resolve(null)
  ]);
  if (authorizedUsers.length !== requestedUserIds.length) throw new Error("One or more recipients are not authorized.");
  if (input.courseId && !course) throw new Error("The selected course is not authorized.");
  if (input.batchId && !batch) throw new Error("The selected batch is not authorized.");
  if (input.roleKey && !role) throw new Error("The selected role is not valid.");

  const communication = await prisma.communication.create({
    data: {
      institutionId,
      createdById: actor.id,
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
    await createModuleNotification({ institutionId, type: input.kind === "ANNOUNCEMENT" ? "ANNOUNCEMENT" : "SYSTEM", title: input.title, body: input.body, link: "/dashboard" });
  }

  return communication;
}
