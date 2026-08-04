import { prisma } from "@/lib/db";

/** Platform-wide AI read model. Cost comes from recorded AIUsage.costEstimate;
 * availability, moderation, and forecasts are never inferred when no source exists. */
export async function getAdminAIPlatformData(userId?: string) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [usage, prompts, rules, executions, preferences] = await Promise.all([
    prisma.aIUsage.findMany({ where: { createdAt: { gte: since } }, include: { institution: { select: { name: true } }, user: { select: { name: true, roles: { include: { role: { select: { key: true } } } } } } }, orderBy: { createdAt: "desc" }, take: 500 }),
    prisma.promptTemplate.findMany({ include: { institution: { select: { name: true } } }, orderBy: { updatedAt: "desc" }, take: 200 }),
    prisma.automationRule.findMany({ include: { institution: { select: { name: true } }, _count: { select: { executions: true } } }, orderBy: { updatedAt: "desc" }, take: 200 }),
    prisma.automationExecution.findMany({ include: { rule: { select: { name: true, trigger: true, institution: { select: { name: true } } } } }, orderBy: { createdAt: "desc" }, take: 300 }),
    userId ? prisma.userPreference.findUnique({ where: { userId_key: { userId, key: "adminx.ai-platform.preferences" } } }) : null
  ]);
  const sum = (rows: typeof usage) => rows.reduce((n, row) => n + Number(row.costEstimate), 0);
  const models = [...new Set(usage.map((x) => x.model))].map((model) => { const rows = usage.filter((x) => x.model === model); return { model, requests: rows.length, tokens: rows.reduce((n, x) => n + x.totalTokens, 0), cost: sum(rows), features: [...new Set(rows.map((x) => x.feature))] }; }).sort((a,b) => b.tokens - a.tokens);
  const todayRows = usage.filter((x) => x.createdAt >= today);
  const failed = executions.filter((x) => String(x.status).includes("FAIL"));
  const completed = executions.filter((x) => String(x.status).includes("COMPLETED"));
  const institutionUsage = [...new Set(usage.map((x) => x.institutionId))].map((id) => { const rows = usage.filter((x) => x.institutionId === id); return { id, institution: rows[0]?.institution?.name ?? "Platform / unassigned", requests: rows.length, tokens: rows.reduce((n,x)=>n+x.totalTokens,0), cost: sum(rows) }; }).sort((a,b)=>b.tokens-a.tokens);
  const roleUsage = ["TEACHER", "STUDENT", "DIRECTOR", "ADMIN"].map((role) => { const rows = usage.filter((x) => x.user?.roles.some((entry) => entry.role.key.includes(role))); return { role, requests: rows.length, tokens: rows.reduce((n, x) => n + x.totalTokens, 0), cost: sum(rows) }; });
  return {
    usage, prompts, rules, executions, models, institutionUsage, roleUsage, preferences: preferences?.value ?? { compact: false, format: "csv" },
    summary: { todayRequests: todayRows.length, todayTokens: todayRows.reduce((n,x)=>n+x.totalTokens,0), todayCost: sum(todayRows), monthRequests: usage.length, monthTokens: usage.reduce((n,x)=>n+x.totalTokens,0), monthCost: sum(usage), models: models.length, successRate: executions.length ? Math.round((completed.length / executions.length) * 100) : null, aiScore: Math.max(0, 100 - failed.length * 8) },
    readiness: {
      modelControl: "Model routing, fallback chains, per-institution overrides, and managed price cards require a governed model-configuration source.",
      prompts: "Templates show their current stored revision. Prompt publishing, testing, rollback, and version history require a governed prompt-release workflow.",
      safety: "No content-moderation, sensitive-request, or policy-violation event source is registered. Existing audit and AI usage evidence remains read-only.",
      performance: "Recorded usage does not include response duration, throughput, or request-level success/failure telemetry.",
      forecast: "A cost or usage forecast is not produced without an approved forecast model and sufficient governed history.",
      costCapture: "Costs are shown only where AIUsage.costEstimate is captured. No provider invoice, credit ledger, or cost-allocation source is registered."
    }
  };
}
