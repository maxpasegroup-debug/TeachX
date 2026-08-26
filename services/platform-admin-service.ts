import { prisma } from "@/lib/db";
import { getPlatformAdminGrowthOS } from "@/services/admin-growth-service";

export const platformAdminModules = ["dashboard", "users", "roles", "marketplace", "moderation", "subscriptions", "ai-monitoring", "analytics", "settings", "audit-logs"] as const;
export type PlatformAdminModule = (typeof platformAdminModules)[number];

export async function getPlatformAdminData() {
  const [growth, institutions, roles, permissions, plans, loginAccounts] = await Promise.all([
    getPlatformAdminGrowthOS(),
    prisma.institution.findMany({ include: { _count: { select: { users: true, courses: true } } }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.role.findMany({ include: { permissions: { include: { permission: true } }, _count: { select: { users: true } } }, orderBy: { name: "asc" } }),
    prisma.permission.findMany({ orderBy: { key: "asc" } }),
    prisma.subscriptionPlan.findMany({ include: { _count: { select: { subscriptions: true } } }, orderBy: { price: "asc" } }),
    prisma.account.findMany({ include: { user: true }, orderBy: { user: { lastLoginAt: "desc" } }, take: 100 })
  ]);
  const models = new Map<string, { requests: number; tokens: number; cost: number }>();
  growth.ai.usage.forEach((x) => {
    const row = models.get(x.model) ?? { requests: 0, tokens: 0, cost: 0 };
    row.requests += 1; row.tokens += x.totalTokens; row.cost += Number(x.costEstimate); models.set(x.model, row);
  });
  return {
    ...growth, institutions, roles, permissions, plans,
    loginHistory: loginAccounts.map((x) => ({ id: x.id, provider: x.provider, user: x.user.name, email: x.user.email, lastLoginAt: x.user.lastLoginAt })),
    aiModels: Array.from(models, ([model, values]) => ({ model, ...values })).sort((a, b) => b.tokens - a.tokens),
    alerts: [
      ...growth.operations.pendingReviews,
      ...growth.support.tickets.filter((x) => x.priority === "URGENT" && x.status !== "RESOLVED").map((x) => ({ title: x.subject, type: "Urgent support", href: "/admin/control/moderation" }))
    ]
  };
}
