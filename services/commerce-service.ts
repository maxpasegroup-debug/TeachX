import type { CommerceAudience, CommerceOrderType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getPaymentConfig } from "@/lib/payments/config";
import { getResourceMetadata } from "@/services/learning-marketplace-service";

export const defaultSubscriptionPlans = [
  { key: "teacher-free", name: "Teacher Free", audience: "TEACHER" as const, price: 0, globalPrice: 0, aiMonthlyCredits: 100, marketplaceAccess: true, resourceLimit: 10, storageLimitMb: 250, featureFlags: { aiStudio: true, marketplace: true, exports: "basic", launchPlan: true } },
  { key: "teacher-rural-starter", name: "Rural Starter", audience: "TEACHER" as const, price: 149, globalPrice: 3, aiMonthlyCredits: 500, marketplaceAccess: true, resourceLimit: 40, storageLimitMb: 1024, featureFlags: { aiStudio: true, marketplace: true, exports: "standard", whatsappSharing: true, launchPlan: true } },
  { key: "teacher-plus", name: "Teacher Plus", audience: "TEACHER" as const, price: 299, globalPrice: 7, aiMonthlyCredits: 1500, marketplaceAccess: true, resourceLimit: 150, storageLimitMb: 3072, featureFlags: { aiStudio: true, marketplace: true, premiumResources: true, exports: "standard", launchPlan: true } },
  { key: "teacher-pro", name: "Teacher Pro", audience: "TEACHER" as const, price: 799, globalPrice: 15, aiMonthlyCredits: 5000, marketplaceAccess: true, resourceLimit: 500, storageLimitMb: 10240, featureFlags: { aiStudio: true, marketplace: true, premiumResources: true, analytics: true, exports: "advanced", launchPlan: true } },
  { key: "teacher-institution", name: "Institution", audience: "TEACHER" as const, price: 0, globalPrice: 0, aiMonthlyCredits: 25000, marketplaceAccess: true, resourceLimit: 5000, storageLimitMb: 102400, featureFlags: { placeholder: true, teams: true, adminControls: true, customPricing: true, launchPlan: true } },
  { key: "student-free", name: "Student Free", audience: "STUDENT" as const, price: 0, globalPrice: 0, aiMonthlyCredits: 80, marketplaceAccess: true, resourceLimit: 25, storageLimitMb: 250, featureFlags: { aiTutor: true, freeResources: true } },
  { key: "student-premium", name: "Student Premium", audience: "STUDENT" as const, price: 299, globalPrice: 7, aiMonthlyCredits: 1200, marketplaceAccess: true, resourceLimit: 250, storageLimitMb: 2048, featureFlags: { aiTutor: true, premiumResources: true, practice: true, downloads: "expanded" } }
];

export const teacherLaunchPricing = [
  {
    key: "teacher-free",
    name: "Free",
    audience: "New and exploring teachers",
    indiaPrice: "INR 0",
    globalPrice: "$0",
    description: "Create first classroom materials and test TeachX safely.",
    highlights: ["100 AI credits/month", "10 saved resources", "Basic export", "Teacher profile draft"]
  },
  {
    key: "teacher-rural-starter",
    name: "Rural Starter",
    audience: "Mobile-first and rural teachers",
    indiaPrice: "INR 149/mo",
    globalPrice: "$3/mo",
    description: "Low-cost plan for regular lesson, worksheet, and WhatsApp sharing use.",
    highlights: ["500 AI credits/month", "40 saved resources", "WhatsApp-ready output", "PDF/Word/handout export"]
  },
  {
    key: "teacher-plus",
    name: "Teacher Plus",
    audience: "Active tutors and school teachers",
    indiaPrice: "INR 299/mo",
    globalPrice: "$7/mo",
    description: "More AI creation and resource management for weekly teaching work.",
    highlights: ["1,500 AI credits/month", "150 saved resources", "Marketplace presence", "Standard exports"]
  },
  {
    key: "teacher-pro",
    name: "Teacher Pro",
    audience: "Professional creators and coaching teachers",
    indiaPrice: "INR 799/mo",
    globalPrice: "$15/mo",
    description: "Advanced capacity for creators who publish, sell, and track performance.",
    highlights: ["5,000 AI credits/month", "500 saved resources", "Advanced analytics", "Premium publishing tools"]
  },
  {
    key: "teacher-institution",
    name: "Institution",
    audience: "Schools, coaching centers, and teams",
    indiaPrice: "Custom",
    globalPrice: "Custom",
    description: "Team controls, larger limits, institution branding, and onboarding support.",
    highlights: ["25,000+ AI credits/month", "Teacher teams", "Admin controls", "Custom storage and support"]
  }
];

export const paymentProviders = [
  { key: "razorpay", name: "Razorpay", status: "Architecture ready", supports: ["UPI", "Cards", "Netbanking", "Wallets"] },
  { key: "stripe", name: "Stripe", status: "Architecture ready", supports: ["Cards", "International payments", "Invoices"] }
];

export type CommerceOrderWithItems = Prisma.CommerceOrderGetPayload<{
  include: { buyer: true; items: { include: { resource: true; seller: true; plan: true } }; invoices: true };
}>;

export async function ensureDefaultSubscriptionPlans(institutionId?: string | null) {
  const institution = institutionId ? await prisma.institution.findUnique({ where: { id: institutionId }, select: { currency: true } }) : null;
  const international = Boolean(institution && institution.currency.toUpperCase() !== "INR");
  for (const plan of defaultSubscriptionPlans) {
    const existing = await prisma.subscriptionPlan.findFirst({ where: { institutionId: institutionId ?? null, key: plan.key } });
    const data = {
      name: plan.name,
      price: international ? plan.globalPrice : plan.price,
      currency: international ? "USD" : "INR",
      aiMonthlyCredits: plan.aiMonthlyCredits,
      marketplaceAccess: plan.marketplaceAccess,
      resourceLimit: plan.resourceLimit,
      storageLimitMb: plan.storageLimitMb,
      featureFlags: plan.featureFlags,
      isActive: true
    };
    if (existing) {
      await prisma.subscriptionPlan.update({ where: { id: existing.id }, data });
    } else {
      await prisma.subscriptionPlan.create({
        data: {
          institutionId: institutionId ?? undefined,
          key: plan.key,
          audience: plan.audience,
          ...data
        }
      });
    }
  }

  return prisma.subscriptionPlan.findMany({
    where: { OR: [{ institutionId: institutionId ?? undefined }, { institutionId: null }] },
    orderBy: [{ audience: "asc" }, { price: "asc" }]
  });
}

export async function ensureWallet(userId: string, institutionId?: string | null, currency = "INR") {
  return prisma.wallet.upsert({
    where: { userId_currency: { userId, currency } },
    update: {},
    create: { userId, institutionId: institutionId ?? undefined, currency }
  });
}

export async function getActiveSubscription(userId?: string, institutionId?: string | null, audience?: CommerceAudience) {
  if (!userId || !institutionId) return null;
  const subscription = await prisma.userSubscription.findFirst({
    where: { userId, institutionId, status: "ACTIVE", ...(audience ? { plan: { audience } } : {}) },
    include: { plan: true },
    orderBy: { updatedAt: "desc" }
  });
  if (subscription) return subscription;

  const plans = await ensureDefaultSubscriptionPlans(institutionId);
  const freePlan = plans.find((plan) => plan.audience === audience && Number(plan.price) === 0) ?? plans.find((plan) => Number(plan.price) === 0);
  if (!freePlan) return null;

  return prisma.userSubscription.create({
    data: {
      userId,
      institutionId: institutionId ?? undefined,
      planId: freePlan.id,
      status: "ACTIVE",
      currentPeriodEnd: getNextResetDate()
    },
    include: { plan: true }
  });
}

export function getNextResetDate(from = new Date()) {
  return new Date(from.getFullYear(), from.getMonth() + 1, 1);
}

export async function getAICreditSummary(input: { userId?: string; institutionId?: string | null; audience?: CommerceAudience }) {
  if (!input.userId || !input.institutionId) {
    return { balance: 0, monthlyAllocation: 0, used: 0, remaining: 0, resetDate: getNextResetDate(), history: [], byFeature: [] };
  }

  const subscription = await getActiveSubscription(input.userId, input.institutionId, input.audience);
  const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [usage, byFeature, history, creditTransactions] = await Promise.all([
    prisma.aIUsage.aggregate({ where: { userId: input.userId, createdAt: { gte: start } }, _sum: { totalTokens: true }, _count: true }),
    prisma.aIUsage.groupBy({ by: ["feature"], where: { userId: input.userId, createdAt: { gte: start } }, _sum: { totalTokens: true }, _count: true }),
    prisma.aIUsage.findMany({ where: { userId: input.userId }, orderBy: { createdAt: "desc" }, take: 12 }),
    prisma.walletTransaction.findMany({ where: { userId: input.userId, pending: false, metadata: { path: ["creditType"], equals: "AI" } }, orderBy: { createdAt: "desc" }, take: 50 })
  ]);

  const monthlyAllocation = subscription?.plan.aiMonthlyCredits ?? 0;
  const packCredits = creditTransactions.reduce((total, item) => total + (["DEBIT", "SPENDING", "REFUND"].includes(item.type) ? -Number(item.amount) : Number(item.amount)), 0);
  const used = Math.ceil((usage._sum.totalTokens ?? 0) / 100);
  const balance = Math.max(0, monthlyAllocation + packCredits - used);

  return {
    balance,
    monthlyAllocation,
    used,
    remaining: balance,
    resetDate: subscription?.currentPeriodEnd ?? getNextResetDate(),
    history,
    byFeature: byFeature.map((item) => ({ feature: item.feature, credits: Math.ceil((item._sum.totalTokens ?? 0) / 100), generations: item._count }))
  };
}

export async function getWalletSummary(userId?: string, institutionId?: string | null) {
  if (!userId) return { wallet: null, transactions: [], currentBalance: 0, pendingBalance: 0, lifetimeEarnings: 0, lifetimeSpending: 0 };

  const wallet = await ensureWallet(userId, institutionId);
  const transactions = await prisma.walletTransaction.findMany({ where: { walletId: wallet.id }, include: { order: true }, orderBy: { createdAt: "desc" }, take: 30 });

  return {
    wallet,
    transactions,
    currentBalance: Number(wallet.balance),
    pendingBalance: Number(wallet.pendingBalance),
    lifetimeEarnings: Number(wallet.lifetimeEarnings),
    lifetimeSpending: Number(wallet.lifetimeSpending)
  };
}

export async function userOwnsResource(userId: string | undefined, resourceId: string) {
  if (!userId) return false;
  const owned = await prisma.commerceOrderItem.findFirst({
    where: {
      resourceId,
      order: { buyerId: userId, status: { in: ["PAID", "FULFILLED"] } }
    },
    select: { id: true }
  });
  return Boolean(owned);
}

export async function createCommerceOrder(input: {
  buyerId: string;
  institutionId?: string | null;
  type: CommerceOrderType;
  title: string;
  itemType: "RESOURCE" | "SUBSCRIPTION" | "AI_CREDITS" | "BOOKING";
  amount: number;
  currency?: string;
  resourceId?: string;
  sellerId?: string | null;
  planId?: string;
  bookingRequestId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.commerceOrder.create({
    data: {
      buyerId: input.buyerId,
      institutionId: input.institutionId ?? undefined,
      type: input.type,
      status: input.amount > 0 ? "PENDING_PAYMENT" : "FULFILLED",
      subtotal: input.amount,
      total: input.amount,
      currency: input.currency || "INR",
      metadata: input.metadata,
      items: {
        create: {
          itemType: input.itemType,
          title: input.title,
          unitPrice: input.amount,
          total: input.amount,
          resourceId: input.resourceId,
          sellerId: input.sellerId ?? undefined,
          planId: input.planId,
          bookingRequestId: input.bookingRequestId,
          metadata: input.metadata
        }
      }
    },
    include: { items: true }
  });
}

export async function getTeacherCommerceDashboard(userId?: string, institutionId?: string | null) {
  if (!userId) return { wallet: await getWalletSummary(), credits: await getAICreditSummary({}), sales: [], topResources: [], topCategories: [], stats: { estimatedEarnings: 0, downloads: 0, sales: 0, pendingRevenue: 0 } };

  const [wallet, credits, sales, resources] = await Promise.all([
    getWalletSummary(userId, institutionId),
    getAICreditSummary({ userId, institutionId, audience: "TEACHER" }),
    prisma.commerceOrderItem.findMany({
      where: { sellerId: userId },
      include: { order: true, resource: { include: { downloads: true, analytics: true } } },
      orderBy: { createdAt: "desc" },
      take: 30
    }),
    prisma.contentItem.findMany({
      where: { createdById: userId },
      include: { downloads: true, analytics: true },
      orderBy: { updatedAt: "desc" },
      take: 30
    })
  ]);

  const paidSales = sales.filter((item) => item.order.status === "PAID" || item.order.status === "FULFILLED");
  const pendingSales = sales.filter((item) => item.order.status === "PENDING_PAYMENT" || item.order.status === "CREATED");
  const categories = new Map<string, number>();
  resources.forEach((item) => categories.set(getResourceMetadata(item).category ?? item.type, (categories.get(getResourceMetadata(item).category ?? item.type) ?? 0) + item.downloads.length));

  return {
    wallet,
    credits,
    sales,
    topResources: resources.sort((a, b) => b.downloads.length - a.downloads.length).slice(0, 6),
    topCategories: Array.from(categories.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6),
    stats: {
      estimatedEarnings: paidSales.reduce((total, item) => total + Number(item.total), 0),
      downloads: resources.reduce((total, item) => total + item.downloads.length, 0),
      sales: paidSales.length,
      pendingRevenue: pendingSales.reduce((total, item) => total + Number(item.total), 0)
    }
  };
}

export async function getStudentCommerceDashboard(userId?: string, institutionId?: string | null) {
  if (!userId) return { wallet: await getWalletSummary(), credits: await getAICreditSummary({}), orders: [], ownedResources: [], subscriptions: [], invoices: [] };

  const [wallet, credits, orders, subscriptions, invoices] = await Promise.all([
    getWalletSummary(userId, institutionId),
    getAICreditSummary({ userId, institutionId, audience: "STUDENT" }),
    prisma.commerceOrder.findMany({ where: { buyerId: userId }, include: { items: { include: { resource: true, plan: true } }, invoices: true }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.userSubscription.findMany({ where: { userId }, include: { plan: true }, orderBy: { updatedAt: "desc" }, take: 10 }),
    prisma.commerceInvoice.findMany({ where: { buyerId: userId }, orderBy: { createdAt: "desc" }, take: 10 })
  ]);

  const ownedResources = orders.flatMap((order) => order.items.filter((item) => item.resource && (order.status === "PAID" || order.status === "FULFILLED")));
  return { wallet, credits, orders, ownedResources, subscriptions, invoices };
}

export async function getAdminCommerceDashboard(institutionId?: string | null) {
  const paymentConfig = getPaymentConfig();
  const [plans, orders, wallets, transactions, coupons, aiUsage, subscriptions, invoices] = await Promise.all([
    ensureDefaultSubscriptionPlans(institutionId),
    prisma.commerceOrder.findMany({ where: { institutionId: institutionId ?? undefined }, include: { buyer: true, items: { include: { seller: true, resource: true, plan: true } }, invoices: true }, orderBy: { createdAt: "desc" }, take: 60 }),
    prisma.wallet.findMany({ where: { institutionId: institutionId ?? undefined }, include: { user: true }, orderBy: { updatedAt: "desc" }, take: 60 }),
    prisma.walletTransaction.findMany({ where: { institutionId: institutionId ?? undefined }, include: { user: true, order: true }, orderBy: { createdAt: "desc" }, take: 60 }),
    prisma.coupon.findMany({ where: { institutionId: institutionId ?? undefined }, orderBy: { createdAt: "desc" }, take: 60 }),
    prisma.aIUsage.groupBy({ by: ["feature"], where: { institutionId: institutionId ?? undefined }, _sum: { totalTokens: true, costEstimate: true }, _count: true }),
    prisma.userSubscription.findMany({ where: { institutionId: institutionId ?? undefined }, include: { user: true, plan: true }, orderBy: { updatedAt: "desc" }, take: 60 }),
    prisma.commerceInvoice.findMany({ where: { institutionId: institutionId ?? undefined }, include: { buyer: true, order: true }, orderBy: { createdAt: "desc" }, take: 60 })
  ]);

  const paidOrders = orders.filter((order) => order.status === "PAID" || order.status === "FULFILLED");
  const totalsByCurrency = (source: typeof orders) => Array.from(source.reduce((totals, order) => {
    totals.set(order.currency, (totals.get(order.currency) ?? 0) + Number(order.total));
    return totals;
  }, new Map<string, number>())).map(([currency, total]) => ({ currency, total }));
  return {
    plans,
    orders,
    wallets,
    transactions,
    coupons,
    aiUsage,
    subscriptions,
    invoices,
    providers: paymentProviders.map((provider) => ({
      ...provider,
      status: (provider.key === "stripe" ? paymentConfig.stripe : paymentConfig.razorpay) ? "Configured" : "Not configured"
    })),
    stats: {
      revenue: paidOrders.reduce((total, order) => total + Number(order.total), 0),
      pending: orders.filter((order) => order.status === "PENDING_PAYMENT").reduce((total, order) => total + Number(order.total), 0),
      revenueByCurrency: totalsByCurrency(paidOrders),
      pendingByCurrency: totalsByCurrency(orders.filter((order) => order.status === "PENDING_PAYMENT")),
      orders: orders.length,
      activeSubscriptions: subscriptions.filter((item) => item.status === "ACTIVE").length,
      wallets: wallets.length,
      aiCreditsUsed: aiUsage.reduce((total, item) => total + Math.ceil((item._sum.totalTokens ?? 0) / 100), 0)
    }
  };
}
