import { prisma } from "@/lib/db";

export async function getRecentAuditActivity(institutionId?: string | null) {
  if (!institutionId) return [];

  return prisma.auditLog.findMany({
    where: { institutionId },
    orderBy: { createdAt: "desc" },
    take: 6
  });
}
