import { prisma } from "@/lib/db";

/**
 * A read-only cross-platform executive projection. It assembles evidence already
 * produced by the platform instead of inventing another event, monitoring, or AI system.
 */
export async function getAdminPlatformBrainData(userId?: string) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [institutions, tickets, audits, notifications, usage, executions, flags, preference] = await Promise.all([
    prisma.institution.findMany({ select: { id: true, name: true, createdAt: true, _count: { select: { users: true } } }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.supportTicket.findMany({ select: { id: true, subject: true, priority: true, status: true, updatedAt: true, institution: { select: { name: true } } }, where: { status: { not: "CLOSED" } }, orderBy: { updatedAt: "desc" }, take: 50 }),
    prisma.auditLog.findMany({ select: { id: true, action: true, entity: true, message: true, createdAt: true, institution: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 120 }),
    prisma.notification.findMany({ select: { id: true, title: true, body: true, status: true, createdAt: true, readAt: true }, orderBy: { createdAt: "desc" }, take: 80 }),
    prisma.aIUsage.findMany({ select: { id: true, feature: true, model: true, totalTokens: true, costEstimate: true, createdAt: true, institution: { select: { name: true } } }, where: { createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 500 }),
    prisma.automationExecution.findMany({ select: { id: true, status: true, createdAt: true, completedAt: true, rule: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 80 }),
    prisma.featureFlag.findMany({ select: { id: true, key: true, name: true, enabled: true, scope: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 80 }),
    userId ? prisma.userPreference.findUnique({ where: { userId_key: { userId, key: "adminx.platform-brain.preferences" } } }) : null,
  ]);
  const failedExecutions = executions.filter((row) => String(row.status).includes("FAIL"));
  const criticalTickets = tickets.filter((row) => row.priority === "URGENT" || row.priority === "HIGH");
  const health = Math.max(0, 100 - failedExecutions.length * 8 - criticalTickets.length * 4);
  const timeline = [
    ...audits.map((row) => ({ id: `audit-${row.id}`, source: "Platform", title: `${row.action}: ${row.entity}`, detail: row.message ?? row.institution?.name ?? "Platform activity", at: row.createdAt })),
    ...tickets.map((row) => ({ id: `support-${row.id}`, source: "Support", title: row.subject, detail: `${row.priority} / ${row.status}${row.institution?.name ? ` / ${row.institution.name}` : ""}`, at: row.updatedAt })),
    ...usage.map((row) => ({ id: `ai-${row.id}`, source: "AI", title: `${row.feature} request`, detail: `${row.model} / ${row.totalTokens.toLocaleString()} tokens`, at: row.createdAt })),
    ...executions.map((row) => ({ id: `automation-${row.id}`, source: "Automation", title: row.rule.name, detail: String(row.status), at: row.createdAt })),
    ...notifications.map((row) => ({ id: `notification-${row.id}`, source: "Notification", title: row.title, detail: String(row.status), at: row.createdAt })),
    ...institutions.map((row) => ({ id: `institution-${row.id}`, source: "Institution", title: row.name, detail: `${row._count.users} registered users`, at: row.createdAt })),
    ...flags.map((row) => ({ id: `flag-${row.id}`, source: "Release", title: row.name, detail: `${row.enabled ? "Enabled" : "Disabled"} / ${row.scope}`, at: row.updatedAt })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 100);
  return {
    institutions, tickets, audits, notifications, usage, executions, flags, timeline,
    summary: { health, criticalTickets: criticalTickets.length, failedAutomations: failedExecutions.length, unreadNotifications: notifications.filter((row) => !row.readAt).length, aiRequests: usage.length, aiTokens: usage.reduce((sum, row) => sum + row.totalTokens, 0), enabledFlags: flags.filter((row) => row.enabled).length },
    preference: preference?.value ?? { compact: false, format: "csv" },
    readiness: {
      command: "Natural-language commands use the existing AI conversation service when configured. This view does not interpret or execute operational changes.",
      governance: "Organization chart, platform policy lifecycle, and permission-change approvals remain governed by existing identity and settings workflows.",
      health: "Database, API, storage, queues, infrastructure latency, and uptime require a connected observability provider; the health score is an evidence signal only.",
      reports: "Daily, weekly, and monthly board narratives require the existing reporting/AI workflow. Exports here contain current source evidence.",
      quality: "This is a read-only audit inventory. It does not delete dead code, temporary files, mock data, or routes. Cleanup requires a separately reviewed change.",
    },
  };
}
