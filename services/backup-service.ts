import { prisma } from "@/lib/db";

export async function getBackupReadiness(institutionId: string) {
  const [settings, contentItems, users, auditLogs] = await Promise.all([
    prisma.setting.count({ where: { institutionId } }),
    prisma.contentItem.count({ where: { institutionId } }),
    prisma.user.count({ where: { institutionId } }),
    prisma.auditLog.count({ where: { institutionId } })
  ]);

  return {
    database: { status: "ready", scope: "PostgreSQL logical dump per institution" },
    media: { status: "ready", filesTracked: contentItems, scope: "Content item fileUrl and externalUrl inventory" },
    configuration: { status: "ready", settings },
    restore: { status: "manual-review-required", note: "Restore must target an empty tenant database or isolated schema." },
    counts: { users, auditLogs }
  };
}
