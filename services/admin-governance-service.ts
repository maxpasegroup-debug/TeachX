import { prisma } from "@/lib/db";
import { getRecoveryConfig } from "@/lib/recovery/config";

/** Platform-wide read model.  It deliberately reports unavailable infrastructure
 * telemetry as readiness, rather than inventing uptime, queue, or backup values. */
export async function getAdminGovernanceData() {
  const observabilityConfigured = Boolean(process.env.SENTRY_DSN && process.env.NEXT_PUBLIC_SENTRY_DSN);
  const recovery = getRecoveryConfig();
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
    observability: {
      configured: observabilityConfigured,
      serverCapture: Boolean(process.env.SENTRY_DSN),
      browserCapture: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
      sourceMaps: Boolean(process.env.SENTRY_ORG && process.env.SENTRY_PROJECT && process.env.SENTRY_AUTH_TOKEN)
    },
    health: { score: health, critical: critical.length, failedJobs: failedJobs.length, auditEvents7d: audits.filter((item) => item.createdAt >= since).length },
    security: { failedLogins: failedLogins.length, permissionSignals: security.length, blockedAccounts: "No governed blocked-account event source is registered." },
    readiness: {
      infrastructure: observabilityConfigured ? "Sentry runtime tracing is configured for API, database, Redis, browser navigation, and application errors. Storage capacity, queues, cron, and webhook delivery still require their provider metrics." : "API latency, database availability, storage capacity, queues, cron, webhooks, and deployment telemetry require a connected observability provider.",
      errors: observabilityConfigured ? "Server, edge, browser navigation, React boundary, and request errors are connected to privacy-filtered Sentry capture." : "Application exceptions and frontend crash events require an error-tracking source.",
      releases: observabilityConfigured ? "Runtime events use the configured Sentry or Railway release identifier; deployment history remains owned by CI and Railway." : "Release history, deployment notes, maintenance windows, and rollback events require CI/CD or release metadata.",
      backups: recovery.storageConfigured && recovery.pitrEnabled && recovery.volumeBackupEnabled
        ? "Recovery providers are configured. Open the protected backup-readiness endpoint to verify dump freshness, checksum, restore-drill evidence, and recovery objectives."
        : "Database snapshots, PITR, private portable dumps, and restore-drill evidence are not fully configured."
    }
  };
}
