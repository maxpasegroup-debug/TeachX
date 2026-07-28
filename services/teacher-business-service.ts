import { prisma } from "@/lib/db";
import { ensureDefaultSubscriptionPlans, getAICreditSummary, getActiveSubscription, getWalletSummary } from "@/services/commerce-service";
import { getResourceMetadata } from "@/services/learning-marketplace-service";

export const teacherBusinessModules = [
  "profile", "portfolio", "publishing", "marketplace", "earnings", "orders", "downloads", "analytics", "wallet", "subscription"
] as const;
export type TeacherBusinessModule = (typeof teacherBusinessModules)[number];

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export async function getTeacherBusinessData(userId?: string, institutionId?: string | null) {
  if (!userId) return null;
  const [user, portfolio, resources, sales, purchases, downloads, wallet, credits, plans, subscription, invoices, profileViews, followers, activities, courses, subjects] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, include: { profile: true, teacherProfile: true } }),
    prisma.userPreference.findMany({ where: { userId, key: { startsWith: "teacher-portfolio:" } }, orderBy: { updatedAt: "desc" } }),
    prisma.contentItem.findMany({ where: { createdById: userId }, include: { course: true, subject: true, analytics: true, downloads: true, versions: { orderBy: { version: "desc" } }, reviews: { orderBy: { createdAt: "desc" } } }, orderBy: { updatedAt: "desc" }, take: 150 }),
    prisma.commerceOrderItem.findMany({ where: { sellerId: userId }, include: { order: { include: { buyer: true, invoices: true } }, resource: true }, orderBy: { createdAt: "desc" }, take: 150 }),
    prisma.commerceOrder.findMany({ where: { buyerId: userId }, include: { items: { include: { resource: true, plan: true } }, invoices: true }, orderBy: { createdAt: "desc" }, take: 150 }),
    prisma.downloadHistory.findMany({ where: { userId }, include: { item: { include: { course: true, subject: true } } }, orderBy: { downloadedAt: "desc" }, take: 150 }),
    getWalletSummary(userId, institutionId),
    getAICreditSummary({ userId, institutionId, audience: "TEACHER" }),
    ensureDefaultSubscriptionPlans(institutionId),
    getActiveSubscription(userId, institutionId, "TEACHER"),
    prisma.commerceInvoice.findMany({ where: { buyerId: userId }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.teacherProfile.findUnique({ where: { userId } }).then((profile) => profile ? prisma.recentItem.count({ where: { type: "marketplace-teacher", entityId: profile.id } }) : 0),
    prisma.teacherProfile.findUnique({ where: { userId } }).then((profile) => profile ? prisma.favoriteItem.count({ where: { type: "marketplace-teacher", entityId: profile.id } }) : 0),
    prisma.activity.findMany({ where: { actorId: userId }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.course.findMany({ where: { institutionId: institutionId ?? undefined }, orderBy: { name: "asc" } }),
    prisma.subject.findMany({ where: { course: { institutionId: institutionId ?? undefined } }, include: { course: true }, orderBy: { name: "asc" } })
  ]);
  if (!user) return null;
  const availability = record(user.teacherProfile?.availability);
  const paidSales = sales.filter((sale) => ["PAID", "FULFILLED"].includes(sale.order.status));
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
  const revenue = (items: typeof paidSales) => items.reduce((sum, item) => sum + Number(item.total), 0);
  const monthly = paidSales.filter((item) => item.createdAt >= monthStart);
  const daily = paidSales.filter((item) => item.createdAt >= dayStart);
  const monthlyTrend = Array.from({ length: 6 }, (_, offset) => {
    const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0); start.setMonth(start.getMonth() - (5 - offset));
    const end = new Date(start); end.setMonth(end.getMonth() + 1);
    return { label: start.toLocaleDateString("en", { month: "short" }), value: revenue(paidSales.filter((item) => item.createdAt >= start && item.createdAt < end)) };
  });

  return {
    profile: {
      id: user.teacherProfile?.id, name: user.name, email: user.email, avatarUrl: user.profile?.avatarUrl,
      banner: user.teacherProfile?.coverUrl, bio: user.teacherProfile?.bio ?? user.profile?.bio,
      headline: user.teacherProfile?.headline, qualification: user.teacherProfile?.qualification,
      experienceYears: user.teacherProfile?.experienceYears, certifications: user.teacherProfile?.certificates ?? [],
      skills: Array.isArray(availability.skills) ? availability.skills.map(String) : [],
      subjects: user.teacherProfile?.subjects ?? [], grades: user.teacherProfile?.classes ?? [],
      languages: user.teacherProfile?.languages ?? [], teachingMode: user.teacherProfile?.teachingMode,
      availability: String(availability.summary ?? ""), socialLinks: record(availability.socialLinks),
      website: String(availability.website ?? ""), contactPreferences: String(availability.contactPreferences ?? ""),
      location: user.teacherProfile?.location, public: user.teacherProfile?.isMarketplaceListed ?? false
    },
    portfolio: portfolio.map((item) => {
      const entry = record(item.value);
      return {
        id: item.id, key: item.key, title: String(entry.title ?? ""), type: String(entry.type ?? "DOCUMENT"),
        description: String(entry.description ?? ""), url: String(entry.url ?? ""), thumbnail: String(entry.thumbnail ?? ""),
        public: Boolean(entry.public), updatedAt: item.updatedAt.toISOString()
      };
    }),
    resources: resources.map((item) => {
      const metadata = getResourceMetadata(item);
      const rawMetadata = record(item.aiReadyNotes);
      return {
        id: item.id, title: item.title, description: item.description, type: item.type, status: item.status,
        course: item.course.name, subject: item.subject?.name, fileUrl: item.fileUrl ?? item.externalUrl,
        thumbnail: metadata.coverImage, category: metadata.category ?? item.type.replaceAll("_", " "),
        tags: metadata.tags ?? [], priceType: metadata.priceType ?? "Free", price: Number(rawMetadata.price ?? 0),
        attachments: Array.isArray(rawMetadata.attachments) ? rawMetadata.attachments as string[] : [],
        version: item.version, versions: item.versions.map((version) => ({ version: version.version, title: version.title, note: version.changeNote, createdAt: version.createdAt.toISOString() })),
        views: item.analytics?.views ?? 0, downloads: item.downloads.length,
        rating: Number(rawMetadata.rating ?? 0), reviewCount: Number(rawMetadata.reviewCount ?? 0),
        workflowReviews: item.reviews.map((review) => ({ decision: review.decision, notes: review.notes, createdAt: review.createdAt.toISOString() })),
        updatedAt: item.updatedAt.toISOString()
      };
    }),
    sales: sales.map((item) => ({
      id: item.id, orderId: item.orderId, product: item.title, customer: item.order.buyer.name,
      email: item.order.buyer.email, status: item.order.status, amount: Number(item.total), currency: item.order.currency,
      downloads: item.resourceId ? downloads.filter((download) => download.itemId === item.resourceId).length : 0,
      refundStatus: item.order.status === "REFUNDED" ? "Refunded" : "Not refunded", createdAt: item.createdAt.toISOString()
    })),
    purchases: purchases.map((order) => ({
      id: order.id, status: order.status, total: Number(order.total), currency: order.currency,
      items: order.items.map((item) => ({ title: item.title, resourceId: item.resourceId, fileUrl: item.resource?.fileUrl ?? item.resource?.externalUrl, type: item.itemType })),
      createdAt: order.createdAt.toISOString()
    })),
    downloads: downloads.map((item) => ({ id: item.id, title: item.item.title, course: item.item.course.name, subject: item.item.subject?.name, fileUrl: item.item.fileUrl ?? item.item.externalUrl, downloadedAt: item.downloadedAt.toISOString() })),
    wallet: {
      balance: wallet.currentBalance, pending: wallet.pendingBalance, lifetimeEarnings: wallet.lifetimeEarnings, lifetimeSpending: wallet.lifetimeSpending,
      transactions: wallet.transactions.map((item) => ({ id: item.id, type: item.type, amount: Number(item.amount), pending: item.pending, description: item.description, createdAt: item.createdAt.toISOString() }))
    },
    credits: { balance: credits.balance, allocation: credits.monthlyAllocation, used: credits.used, resetDate: credits.resetDate?.toISOString(), byFeature: credits.byFeature },
    earnings: {
      total: revenue(paidSales), monthly: revenue(monthly), daily: revenue(daily),
      product: revenue(paidSales.filter((item) => item.itemType === "RESOURCE")),
      aiCredits: revenue(paidSales.filter((item) => item.itemType === "AI_CREDITS")),
      subscription: revenue(paidSales.filter((item) => item.itemType === "SUBSCRIPTION")),
      pending: revenue(sales.filter((item) => ["CREATED", "PENDING_PAYMENT"].includes(item.order.status))),
      withdrawable: wallet.currentBalance, trend: monthlyTrend
    },
    analytics: {
      profileViews, resourceViews: resources.reduce((sum, item) => sum + (item.analytics?.views ?? 0), 0),
      downloads: resources.reduce((sum, item) => sum + item.downloads.length, 0), sales: paidSales.length, followers,
      engagement: profileViews ? Math.round(((followers + resources.reduce((sum, item) => sum + item.downloads.length, 0)) / profileViews) * 100) : 0,
      aiUsage: credits.used, timeline: activities.map((item) => ({ id: item.id, title: item.title, type: item.type, createdAt: item.createdAt.toISOString() }))
    },
    plans: plans.filter((plan) => plan.audience === "TEACHER").map((plan) => ({ id: plan.id, name: plan.name, price: Number(plan.price), currency: plan.currency, interval: plan.interval, credits: plan.aiMonthlyCredits, resourceLimit: plan.resourceLimit, storageLimitMb: plan.storageLimitMb })),
    subscription: subscription ? { id: subscription.id, planId: subscription.planId, name: subscription.plan.name, status: subscription.status, renewsAt: subscription.currentPeriodEnd?.toISOString(), cancelAtPeriodEnd: subscription.cancelAtPeriodEnd, resourceLimit: subscription.plan.resourceLimit, storageLimitMb: subscription.plan.storageLimitMb } : null,
    invoices: invoices.map((item) => ({ id: item.id, number: item.invoiceNumber, total: Number(item.total), status: item.status, createdAt: item.createdAt.toISOString() })),
    courses: courses.map((item) => ({ id: item.id, name: item.name })),
    subjects: subjects.map((item) => ({ id: item.id, name: item.name, course: item.course.name }))
  };
}
