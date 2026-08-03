import { prisma } from "@/lib/db";

const DAY = 86_400_000;

export async function getAdminTenantOperatingSystem(userId?: string) {
  const now = new Date();
  const soon = new Date(now.getTime() + 30 * DAY);
  const [institutions, subscriptions, plans, orders, invoices, usage, tickets, preference] = await Promise.all([
    prisma.institution.findMany({
      include: { _count: { select: { users: true, courses: true } } },
      orderBy: { createdAt: "desc" }, take: 200
    }),
    prisma.userSubscription.findMany({ include: { plan: true, user: true, institution: true }, orderBy: { updatedAt: "desc" }, take: 300 }),
    prisma.subscriptionPlan.findMany({ include: { _count: { select: { subscriptions: true } } }, orderBy: { price: "asc" } }),
    prisma.commerceOrder.findMany({ where: { status: { in: ["PAID", "FULFILLED"] } }, include: { institution: true }, orderBy: { createdAt: "desc" }, take: 300 }),
    prisma.commerceInvoice.findMany({ include: { institution: true, buyer: true }, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.aIUsage.groupBy({ by: ["institutionId"], _sum: { totalTokens: true }, _count: true }),
    prisma.supportTicket.groupBy({ by: ["institutionId", "status"], _count: true }),
    userId ? prisma.userPreference.findUnique({ where: { userId_key: { userId, key: "adminx.tenant.preferences" } } }) : Promise.resolve(null)
  ]);

  const subscriptionByInstitution = new Map<string, typeof subscriptions[number]>();
  subscriptions.forEach((item) => { if (item.institutionId && !subscriptionByInstitution.has(item.institutionId)) subscriptionByInstitution.set(item.institutionId, item); });
  const usageByInstitution = new Map(usage.map((item) => [item.institutionId, { requests: item._count, tokens: item._sum.totalTokens ?? 0 }]));
  const openSupport = new Map<string, number>();
  tickets.forEach((item) => { if (item.institutionId && ["OPEN", "IN_REVIEW"].includes(item.status)) openSupport.set(item.institutionId, (openSupport.get(item.institutionId) ?? 0) + item._count); });
  const tenantRows = institutions.map((institution) => {
    const subscription = subscriptionByInstitution.get(institution.id);
    const support = openSupport.get(institution.id) ?? 0;
    const active = subscription?.status === "ACTIVE";
    const trial = subscription?.status === "TRIALING";
    const expiring = Boolean(subscription?.currentPeriodEnd && subscription.currentPeriodEnd <= soon && subscription.currentPeriodEnd >= now);
    const health = Math.max(0, 100 - support * 12 - (subscription?.status === "PAST_DUE" ? 30 : 0) - (!subscription ? 15 : 0));
    return { ...institution, subscription, support, usage: usageByInstitution.get(institution.id) ?? { requests: 0, tokens: 0 }, active, trial, expiring, health };
  });
  const paidRevenue = orders.reduce((total, order) => total + Number(order.total), 0);
  return {
    tenants: tenantRows,
    plans,
    subscriptions,
    invoices,
    reports: { paidRevenue, orderCount: orders.length, renewalSoon: tenantRows.filter((x) => x.expiring).length },
    metrics: {
      active: tenantRows.filter((x) => x.active).length,
      trial: tenantRows.filter((x) => x.trial).length,
      expired: tenantRows.filter((x) => x.subscription?.status === "EXPIRED").length,
      suspended: tenantRows.filter((x) => x.subscription?.status === "PAST_DUE").length,
      onboarding: tenantRows.filter((x) => !x.subscription || x._count.users < 2).length,
      averageHealth: tenantRows.length ? Math.round(tenantRows.reduce((sum, x) => sum + x.health, 0) / tenantRows.length) : 0
    },
    preferences: preference?.value ?? { compact: false, exportFormat: "json" },
    readiness: {
      lifecycle: "Lifecycle phases beyond the existing subscription states need a dedicated tenant-lifecycle model.",
      storage: "Per-tenant storage, bandwidth, API usage, domains, and branding completion need telemetry sources.",
      billing: "Institution-level billing is represented only where existing subscriptions and Commerce invoices are linked to an institution."
    }
  };
}
