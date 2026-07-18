import type { AuditAction, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

type WriteAuditLogInput = {
  institutionId?: string | null;
  actorId?: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  message?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
};

export async function writeAuditLog(input: WriteAuditLogInput) {
  return prisma.auditLog.create({
    data: {
      institutionId: input.institutionId,
      actorId: input.actorId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      message: input.message,
      metadata: input.metadata,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent
    }
  });
}
