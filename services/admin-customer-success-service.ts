import { prisma } from "@/lib/db";

const activeStatuses = ["OPEN", "IN_REVIEW"] as const;

export async function getAdminCustomerSuccessData(userId?: string) {
  const [institutions, tickets, communications, usage, subscriptions, preferences] = await Promise.all([
    prisma.institution.findMany({ include: { _count: { select: { users: true, courses: true } } }, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.supportTicket.findMany({ include: { institution: true, requester: true, assignedTo: true, replies: true }, orderBy: { updatedAt: "desc" }, take: 300 }),
    prisma.communication.findMany({ include: { institution: true, recipients: true, logs: true }, orderBy: { updatedAt: "desc" }, take: 160 }),
    prisma.aIUsage.groupBy({ by: ["institutionId"], _sum: { totalTokens: true }, _count: true }),
    prisma.userSubscription.findMany({ include: { institution: true, plan: true }, orderBy: { updatedAt: "desc" }, take: 300 }),
    userId ? prisma.userPreference.findUnique({ where: { userId_key: { userId, key: "adminx.customer-success.preferences" } } }) : Promise.resolve(null)
  ]);
  const usageByTenant = new Map(usage.map((row) => [row.institutionId, { requests: row._count, tokens: row._sum.totalTokens ?? 0 }]));
  const subscriptionByTenant = new Map<string, typeof subscriptions[number]>();
  subscriptions.forEach((row) => { if (row.institutionId && !subscriptionByTenant.has(row.institutionId)) subscriptionByTenant.set(row.institutionId, row); });
  const tenantRows = institutions.map((institution) => {
    const tenantTickets = tickets.filter((ticket) => ticket.institutionId === institution.id);
    const open = tenantTickets.filter((ticket) => activeStatuses.includes(ticket.status as (typeof activeStatuses)[number]));
    const urgent = open.filter((ticket) => ticket.priority === "URGENT" || ticket.priority === "HIGH");
    const usage = usageByTenant.get(institution.id) ?? { requests: 0, tokens: 0 };
    const subscription = subscriptionByTenant.get(institution.id);
    const onboarding = Math.min(100, (institution.email ? 25 : 0) + (institution._count.users ? 25 : 0) + (institution._count.courses ? 25 : 0) + (subscription ? 25 : 0));
    const health = Math.max(0, 100 - open.length * 10 - urgent.length * 10 - (!subscription ? 12 : 0));
    return { ...institution, tickets: tenantTickets, open: open.length, urgent: urgent.length, usage, subscription, onboarding, health };
  });
  const openTickets = tickets.filter((ticket) => activeStatuses.includes(ticket.status as (typeof activeStatuses)[number]));
  return {
    tenants: tenantRows, tickets, communications,
    metrics: { openTickets: openTickets.length, escalations: openTickets.filter((t) => t.priority === "URGENT").length, averageHealth: tenantRows.length ? Math.round(tenantRows.reduce((sum, item) => sum + item.health, 0) / tenantRows.length) : 0, onboardingAttention: tenantRows.filter((item) => item.onboarding < 75).length, atRisk: tenantRows.filter((item) => item.health < 70).length },
    preferences: preferences?.value ?? { compact: false, exportFormat: "csv" },
    readiness: { satisfaction: "Customer satisfaction and NPS events are not currently modeled.", sla: "SLA targets and escalation rules remain governed by the existing support workflow.", knowledge: "Documentation, tutorials, and release notes require a published knowledge-content source.", predictions: "Churn prediction and suggested replies require the existing AI service to expose supported customer-success capabilities." }
  };
}
