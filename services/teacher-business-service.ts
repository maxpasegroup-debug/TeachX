import { prisma } from "@/lib/db";
import { ensureDefaultSubscriptionPlans, ensureWallet, getAICreditSummary, getActiveSubscription } from "@/services/commerce-service";
import { getResourceMetadata } from "@/services/learning-marketplace-service";

export const teacherBusinessModules = [
  "home", "profile", "portfolio", "publishing", "marketplace", "orders", "earnings", "wallet", "payouts", "analytics", "subscription", "downloads"
] as const;
export type TeacherBusinessModule = (typeof teacherBusinessModules)[number];

const teacherRoles = ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"];
const supportedCurrencies = new Set(["INR", "USD", "EUR", "GBP"]);

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function strings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export async function getTeacherBusinessData(userId?: string, institutionId?: string | null) {
  if (!userId || !institutionId) return null;
  const [user, institution] = await Promise.all([
    prisma.user.findFirst({
      where: { id: userId, institutionId, status: "ACTIVE", roles: { some: { role: { key: { in: teacherRoles } } } } },
      include: { profile: true, teacherProfile: true }
    }),
    prisma.institution.findUnique({ where: { id: institutionId }, select: { currency: true } })
  ]);
  if (!user || !institution) return null;

  const currency = supportedCurrencies.has(institution.currency.toUpperCase()) ? institution.currency.toUpperCase() : "INR";
  await ensureWallet(userId, institutionId, currency);
  const activitySince = new Date();
  activitySince.setDate(activitySince.getDate() - 90);
  const trendSince = new Date();
  trendSince.setDate(1); trendSince.setHours(0, 0, 0, 0); trendSince.setMonth(trendSince.getMonth() - 5);

  const [portfolio, resources, sales, purchases, ownDownloads, wallets, earningTransactions, credits, plans, subscription, invoices, profileViews, followers, activities] = await Promise.all([
    prisma.userPreference.findMany({ where: { userId, key: { startsWith: "teacher-portfolio:" } }, orderBy: { updatedAt: "desc" }, take: 100 }),
    prisma.contentItem.findMany({
      where: { createdById: userId, institutionId },
      include: {
        course: true, subject: true, analytics: true,
        versions: { orderBy: { version: "desc" }, take: 10 },
        reviews: { orderBy: { createdAt: "desc" }, take: 10 },
        marketplaceListing: {
          include: {
            reviews: { where: { status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 20 },
            _count: { select: { entitlements: true, wishlistItems: true } }
          }
        }
      },
      orderBy: { updatedAt: "desc" }, take: 100
    }),
    prisma.commerceOrderItem.findMany({
      where: { sellerId: userId, order: { institutionId } },
      include: { order: { select: { id: true, status: true, currency: true, createdAt: true, paidAt: true, buyer: { select: { name: true } } } }, resource: { include: { analytics: true } } },
      orderBy: { createdAt: "desc" }, take: 100
    }),
    prisma.commerceOrder.findMany({
      where: { buyerId: userId, institutionId },
      include: { items: { include: { resource: true, plan: true } }, invoices: true },
      orderBy: { createdAt: "desc" }, take: 50
    }),
    prisma.downloadHistory.findMany({ where: { userId, item: { institutionId } }, include: { item: { include: { course: true, subject: true } } }, orderBy: { downloadedAt: "desc" }, take: 50 }),
    prisma.wallet.findMany({
      where: { userId, institutionId },
      include: { transactions: { where: { institutionId }, orderBy: { createdAt: "desc" }, take: 100 } },
      orderBy: { currency: "asc" }
    }),
    prisma.walletTransaction.findMany({ where: { userId, institutionId, type: "EARNING", createdAt: { gte: trendSince } }, orderBy: { createdAt: "desc" }, take: 500 }),
    getAICreditSummary({ userId, institutionId, audience: "TEACHER" }),
    ensureDefaultSubscriptionPlans(institutionId),
    getActiveSubscription(userId, institutionId, "TEACHER"),
    prisma.commerceInvoice.findMany({ where: { buyerId: userId, institutionId }, include: { order: { select: { currency: true } } }, orderBy: { createdAt: "desc" }, take: 50 }),
    user.teacherProfile ? prisma.recentItem.count({ where: { type: "marketplace-teacher", entityId: user.teacherProfile.id } }) : Promise.resolve(0),
    user.teacherProfile ? prisma.favoriteItem.count({ where: { type: "marketplace-teacher", entityId: user.teacherProfile.id } }) : Promise.resolve(0),
    prisma.activity.findMany({ where: { actorId: userId, institutionId, createdAt: { gte: activitySince } }, orderBy: { createdAt: "desc" }, take: 50 })
  ]);

  const availability = record(user.teacherProfile?.availability);
  const completedProfileFields = [user.teacherProfile?.headline, user.teacherProfile?.bio, user.teacherProfile?.qualification, user.teacherProfile?.subjects.length, user.teacherProfile?.languages.length, user.teacherProfile?.experienceYears, user.profile?.avatarUrl].filter(Boolean).length;
  const profileCompletion = Math.round((completedProfileFields / 7) * 100);
  const paidSales = sales.filter((sale) => ["PAID", "FULFILLED"].includes(sale.order.status));
  const pendingSales = sales.filter((sale) => ["CREATED", "PENDING_PAYMENT"].includes(sale.order.status));
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const sumTransactions = (items: typeof earningTransactions) => items.reduce((sum, item) => sum + Number(item.amount), 0);
  const earningsByCurrency = wallets.map((wallet) => {
    const transactions = earningTransactions.filter((item) => item.walletId === wallet.id);
    return {
      currency: wallet.currency, available: Number(wallet.balance), pending: Number(wallet.pendingBalance),
      total: Number(wallet.lifetimeEarnings), completed: sumTransactions(transactions.filter((item) => !item.pending)),
      currentPeriod: sumTransactions(transactions.filter((item) => !item.pending && item.createdAt >= monthStart))
    };
  });
  const primaryWallet = wallets.find((wallet) => wallet.currency === currency) ?? wallets[0];
  const primaryEarnings = earningsByCurrency.find((item) => item.currency === primaryWallet?.currency) ?? { currency, available: 0, pending: 0, total: 0, completed: 0, currentPeriod: 0 };
  const monthlyTrend = Array.from({ length: 6 }, (_, offset) => {
    const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0); start.setMonth(start.getMonth() - (5 - offset));
    const end = new Date(start); end.setMonth(end.getMonth() + 1);
    return { label: start.toLocaleDateString("en", { month: "short" }), value: sumTransactions(earningTransactions.filter((item) => item.walletId === primaryWallet?.id && !item.pending && item.createdAt >= start && item.createdAt < end)) };
  });

  const mappedResources = resources.map((item) => {
    const metadata = getResourceMetadata(item);
    const rawMetadata = record(item.aiReadyNotes);
    const listing = item.marketplaceListing;
    const ratings = listing?.reviews.map((review) => review.rating) ?? [];
    return {
      id: item.id, title: item.title, description: item.description, type: item.type, status: item.status,
      course: item.course.name, subject: item.subject?.name, fileUrl: item.fileUrl ?? item.externalUrl,
      thumbnail: metadata.coverImage, category: metadata.category ?? item.type.replaceAll("_", " "), tags: metadata.tags ?? [],
      attachments: strings(rawMetadata.attachments), preview: typeof rawMetadata.preview === "string" ? rawMetadata.preview : "",
      version: item.version, versions: item.versions.map((version) => ({ version: version.version, title: version.title, note: version.changeNote, createdAt: version.createdAt.toISOString() })),
      views: item.analytics?.views ?? 0, downloads: item.analytics?.downloads ?? 0,
      listing: listing ? {
        id: listing.id, status: listing.status, price: Number(listing.price), previousPrice: listing.previousPrice === null ? null : Number(listing.previousPrice),
        currency: listing.currency, license: listing.license, purchaseEnabled: listing.purchaseEnabled,
        sales: listing._count.entitlements, saves: listing._count.wishlistItems,
        rating: ratings.length ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10 : null,
        reviews: listing.reviews.map((review) => ({ id: review.id, rating: review.rating, title: review.title, body: review.body, createdAt: review.createdAt.toISOString() }))
      } : null,
      workflowReviews: item.reviews.map((review) => ({ decision: review.decision, notes: review.notes, createdAt: review.createdAt.toISOString() })),
      updatedAt: item.updatedAt.toISOString()
    };
  });

  const publishedResources = mappedResources.filter((item) => item.status === "PUBLISHED");
  const marketplaceProducts = mappedResources.filter((item) => item.listing);
  return {
    generatedAt: new Date().toISOString(), currency,
    profile: {
      id: user.teacherProfile?.id, name: user.name, avatarUrl: user.profile?.avatarUrl, banner: user.teacherProfile?.coverUrl,
      bio: user.teacherProfile?.bio ?? user.profile?.bio, headline: user.teacherProfile?.headline,
      qualification: user.teacherProfile?.qualification, experienceYears: user.teacherProfile?.experienceYears,
      certifications: user.teacherProfile?.certificates ?? [], achievements: user.teacherProfile?.achievements ?? [],
      skills: strings(availability.skills), interests: strings(availability.interests), subjects: user.teacherProfile?.subjects ?? [],
      grades: user.teacherProfile?.classes ?? [], boards: user.teacherProfile?.boards ?? [], languages: user.teacherProfile?.languages ?? [],
      teachingMode: user.teacherProfile?.teachingMode, teachingStyle: user.teacherProfile?.teachingStyle,
      availability: String(availability.summary ?? ""), website: String(availability.website ?? ""),
      contactPreferences: String(availability.contactPreferences ?? ""), location: user.teacherProfile?.location,
      public: user.teacherProfile?.isMarketplaceListed ?? false, completion: profileCompletion
    },
    portfolio: portfolio.map((item) => {
      const entry = record(item.value);
      return { id: item.id, key: item.key, title: String(entry.title ?? ""), type: String(entry.type ?? "DOCUMENT"), description: String(entry.description ?? ""), url: String(entry.url ?? ""), thumbnail: String(entry.thumbnail ?? ""), public: Boolean(entry.public), updatedAt: item.updatedAt.toISOString() };
    }),
    resources: mappedResources,
    sales: sales.map((item) => ({
      id: item.id, orderId: item.order.id, product: item.title, customer: item.order.buyer.name,
      status: item.order.status, amount: Number(item.total), currency: item.order.currency,
      downloads: item.resource?.analytics?.downloads ?? 0, refundStatus: item.order.status === "REFUNDED" ? "Refunded" : item.order.status === "REFUND_PENDING" ? "Refund pending" : "Not refunded",
      paidAt: item.order.paidAt?.toISOString() ?? null, createdAt: item.createdAt.toISOString()
    })),
    purchases: purchases.map((order) => ({
      id: order.id, status: order.status, total: Number(order.total), currency: order.currency,
      items: order.items.map((item) => ({ title: item.title, resourceId: item.resourceId, fileUrl: item.resource?.fileUrl ?? item.resource?.externalUrl, type: item.itemType })), createdAt: order.createdAt.toISOString()
    })),
    downloads: ownDownloads.map((item) => ({ id: item.id, title: item.item.title, course: item.item.course.name, subject: item.item.subject?.name, fileUrl: item.item.fileUrl ?? item.item.externalUrl, downloadedAt: item.downloadedAt.toISOString() })),
    wallet: {
      currency: primaryWallet?.currency ?? currency, balance: Number(primaryWallet?.balance ?? 0), pending: Number(primaryWallet?.pendingBalance ?? 0),
      lifetimeEarnings: Number(primaryWallet?.lifetimeEarnings ?? 0), lifetimeSpending: Number(primaryWallet?.lifetimeSpending ?? 0),
      balances: wallets.map((wallet) => ({ currency: wallet.currency, balance: Number(wallet.balance), pending: Number(wallet.pendingBalance), lifetimeEarnings: Number(wallet.lifetimeEarnings) })),
      transactions: wallets.flatMap((wallet) => wallet.transactions.map((item) => ({ id: item.id, currency: wallet.currency, type: item.type, amount: Number(item.amount), pending: item.pending, description: item.description, orderId: item.orderId, createdAt: item.createdAt.toISOString() }))).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 100)
    },
    credits: { balance: credits.balance, allocation: credits.monthlyAllocation, used: credits.used, resetDate: credits.resetDate?.toISOString(), byFeature: credits.byFeature },
    earnings: {
      currency: primaryEarnings.currency, total: primaryEarnings.total, currentPeriod: primaryEarnings.currentPeriod,
      pending: primaryEarnings.pending, completed: primaryEarnings.completed, marketplace: primaryEarnings.completed,
      available: primaryEarnings.available, platformCommission: null as number | null, byCurrency: earningsByCurrency, trend: monthlyTrend
    },
    payouts: { supported: false, eligible: false, status: "NOT_CONFIGURED", history: [] as { id: string; amount: number; currency: string; status: string; createdAt: string }[], reason: "A verified payout provider and settlement request workflow are not configured for teacher wallets." },
    analytics: {
      profileViews, resourceViews: resources.reduce((sum, item) => sum + (item.analytics?.views ?? 0), 0),
      downloads: resources.reduce((sum, item) => sum + (item.analytics?.downloads ?? 0), 0), sales: paidSales.length, pendingOrders: pendingSales.length, followers,
      conversion: profileViews ? Math.round((paidSales.length / profileViews) * 1000) / 10 : null,
      timeline: activities.map((item) => ({ id: item.id, title: item.title, type: item.type, link: item.link, createdAt: item.createdAt.toISOString() }))
    },
    home: {
      profileCompletion, publishedResources: publishedResources.length, marketplaceProducts: marketplaceProducts.length,
      orders: sales.length, profileViews, resourceViews: resources.reduce((sum, item) => sum + (item.analytics?.views ?? 0), 0),
      recentActivity: activities.slice(0, 6).map((item) => ({ id: item.id, title: item.title, link: item.link, createdAt: item.createdAt.toISOString() }))
    },
    plans: plans.filter((plan) => plan.audience === "TEACHER" && plan.isActive).map((plan) => ({ id: plan.id, name: plan.name, price: Number(plan.price), currency: plan.currency, interval: plan.interval, credits: plan.aiMonthlyCredits, marketplaceAccess: plan.marketplaceAccess, resourceLimit: plan.resourceLimit, storageLimitMb: plan.storageLimitMb })),
    subscription: subscription ? { id: subscription.id, planId: subscription.planId, name: subscription.plan.name, status: subscription.status, renewsAt: subscription.currentPeriodEnd?.toISOString(), cancelAtPeriodEnd: subscription.cancelAtPeriodEnd, marketplaceAccess: subscription.plan.marketplaceAccess, resourceLimit: subscription.plan.resourceLimit, storageLimitMb: subscription.plan.storageLimitMb } : null,
    invoices: invoices.map((item) => ({ id: item.id, number: item.invoiceNumber, total: Number(item.total), currency: item.order?.currency ?? currency, status: item.status, createdAt: item.createdAt.toISOString() }))
  };
}
