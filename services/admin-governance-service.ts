import { prisma } from "@/lib/db";

/** Platform-wide read model.  It deliberately reports unavailable infrastructure
 * telemetry as readiness, rather than inventing uptime, queue, or backup values. */
export async function getAdminGovernanceData() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [audits, flags, metrics, tickets, automations, executions, institutions] = await Promise.all([
    prisma.auditLog.findMany({ include: { actor: { select: { name: true, email: true } }, institution: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 250 }),
    prisma.featureFlag.findMany({ include: { institution: { select: { name: true } } }, orderBy: { updatedAt: "desc" }, take: 200 }),
    prisma.platformMetric.findMany({ orderBy: { recordedAt: "desc" }, take: 200 }),
    prisma.supportTicket.findMany({ where: { OR: [{ type: "BUG" }, { priority: "URGENT" }, { priority: "HIGH" }] }, include: { institution: { select: { name: true } } }, orderBy: { updatedAt: "desc" }, take: 100 }),
    prisma.automationRule.findMany({ orderBy: { updatedAt: "desc" }, take: 80 }),
    prisma.automationExecution.findMany({ orderBy: { createdAt: "desc" }, take: 120 }),
    prisma.institution.count()
  ]);
  const failedJobs = executions.filter((item) => String(item.status).includes("FAIL"));
  const failedLogins = audits.filter((item) => /login|sign.?in|auth/i.test(`${item.entity} ${item.message ?? ""}`) && /fail|denied|invalid/i.test(`${item.action} ${item.message ?? ""}`));
  const security = audits.filter((item) => /permission|role|security|access/i.test(`${item.entity} ${item.message ?? ""}`));
  const critical = tickets.filter((item) => item.priority === "URGENT" && item.status !== "RESOLVED");
  const health = Math.max(0, 100 - failedJobs.length * 8 - critical.length * 6);
  return {
    audits, flags, metrics, tickets, automations, executions, institutions,
    health: { score: health, critical: critical.length, failedJobs: failedJobs.length, auditEvents7d: audits.filter((item) => item.createdAt >= since).length },
    security: { failedLogins: failedLogins.length, permissionSignals: security.length, blockedAccounts: "No governed blocked-account event source is registered." },
    readiness: {
      infrastructure: "API latency, database availability, storage capacity, queues, cron, webhooks, and deployment telemetry require a connected observability provider.",
      errors: "Application exceptions and frontend crash events require an error-tracking source.",
      releases: "Release history, deployment notes, maintenance windows, and rollback events require CI/CD or release metadata.",
      backups: "Backup history, restore points, snapshots, and recovery logs require a backup provider event source."
    }
  };
}
