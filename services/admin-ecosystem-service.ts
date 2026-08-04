import { prisma } from "@/lib/db";

/** Read-only platform ecosystem evidence. Release and roadmap records are not invented
 * when the shared platform has no governed release-planning source. */
export async function getAdminEcosystemData(userId?: string) {
  const since = new Date(Date.now() - 30 * 86400000);
  const [institutions, usage, listings, reviews, tickets, audits, flags, preference, institutionTotal, teacherTotal, studentTotal, directorTotal, adminTotal, aiTotal, listingTotal, openTicketTotal] = await Promise.all([
    prisma.institution.findMany({ select: { id: true, name: true, createdAt: true, _count: { select: { users: true } } }, orderBy: { createdAt: "desc" }, take: 250 }),
    prisma.aIUsage.findMany({ where: { createdAt: { gte: since } }, select: { feature: true, totalTokens: true, costEstimate: true, createdAt: true }, take: 2000 }),
    prisma.marketplaceListing.findMany({ select: { id: true, status: true, price: true, createdAt: true, updatedAt: true, contentItem: { select: { title: true } }, _count: { select: { entitlements: true, reviews: true } } }, orderBy: { updatedAt: "desc" }, take: 300 }),
    prisma.marketplaceBuyerReview.findMany({ select: { rating: true, createdAt: true }, take: 1000 }),
    prisma.supportTicket.findMany({ select: { id: true, subject: true, status: true, priority: true, createdAt: true, institution: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.auditLog.findMany({ select: { action: true, entity: true, message: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 150 }),
    prisma.featureFlag.findMany({ select: { key: true, name: true, enabled: true, scope: true, updatedAt: true }, take: 200 }),
    userId ? prisma.userPreference.findUnique({ where: { userId_key: { userId, key: "adminx.ecosystem.preferences" } } }) : null,
    prisma.institution.count(),
    prisma.userRole.count({ where: { role: { key: { contains: "TEACHER" } } } }),
    prisma.userRole.count({ where: { role: { key: { contains: "STUDENT" } } } }),
    prisma.userRole.count({ where: { role: { key: { contains: "DIRECTOR" } } } }),
    prisma.userRole.count({ where: { role: { key: { contains: "ADMIN" } } } }),
    prisma.aIUsage.count({ where: { createdAt: { gte: since } } }),
    prisma.marketplaceListing.count({ where: { status: "ACTIVE" } }),
    prisma.supportTicket.count({ where: { status: { not: "CLOSED" } } }),
  ]);

  const averageRating = reviews.length ? reviews.reduce((sum, row) => sum + row.rating, 0) / reviews.length : null;
  const featureUsage = Object.values(usage.reduce<Record<string, { feature: string; requests: number; tokens: number; cost: number }>>((acc, row) => {
    const entry = acc[row.feature] ?? { feature: row.feature, requests: 0, tokens: 0, cost: 0 };
    entry.requests += 1; entry.tokens += row.totalTokens; entry.cost += Number(row.costEstimate); acc[row.feature] = entry; return acc;
  }, {})).sort((a, b) => b.requests - a.requests);
  return {
    institutions, listings, tickets, audits, flags, featureUsage, preference: preference?.value ?? { compact: false, format: "csv" },
    summary: { institutions: institutionTotal, teachers: teacherTotal, students: studentTotal, directors: directorTotal, admins: adminTotal, aiRequests: aiTotal, aiTokens: usage.reduce((sum, row) => sum + row.totalTokens, 0), publishedListings: listingTotal, averageRating, openTickets: openTicketTotal, enabledFlags: flags.filter((row) => row.enabled).length },
    readiness: {
      product: "Product versions, release ownership, roadmap items, sprints, release calendar, migration notes, and rollback history need a governed release-management source.",
      adoption: "Daily/monthly active-user, feature adoption, retention, and institution-level product attribution require governed product analytics events.",
      feedback: "Feature requests, roadmap votes, satisfaction surveys, and structured bug reports need a governed feedback source. Marketplace ratings are shown separately as the available review evidence.",
      forecast: "Growth, retention, and revenue forecasts are not calculated without an approved forecast model and historical KPI snapshots.",
      settings: "This view persists only personal display preferences. Release, feature visibility, announcement, and analytics rules remain governed by existing platform workflows."
    }
  };
}
