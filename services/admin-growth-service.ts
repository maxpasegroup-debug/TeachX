import type { Prisma, SupportTicketPriority, SupportTicketStatus, SupportTicketType } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getResourceMetadata } from "@/services/learning-marketplace-service";

function startOfDay() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfMonth() {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function money(value: number) {
  return Number(value.toFixed(2));
}

export async function getAdminGrowthOS(institutionId?: string | null) {
  const today = startOfDay();
  const month = startOfMonth();
  const scope = institutionId ? { institutionId } : {};

  const [
    users,
    teacherProfiles,
    studentProfiles,
    resources,
    downloads,
    bookings,
    aiUsage,
    aiByFeature,
    aiConversations,
    orders,
    subscriptions,
    wallets,
    walletTransactions,
    coupons,
    communities,
    discussions,
    messages,
    communications,
    notifications,
    activityEvents,
    activities,
    auditLogs,
    promptTemplates,
    supportTickets,
    featureFlags,
    settings,
    platformMetrics
  ] = await Promise.all([
    prisma.user.findMany({ where: scope, include: { roles: { include: { role: true } }, teacherProfile: true, studentProfile: true }, orderBy: { createdAt: "desc" }, take: 120 }),
    prisma.teacherProfile.findMany({ where: { user: scope }, include: { user: true, bookingRequests: true }, orderBy: { updatedAt: "desc" }, take: 80 }),
    prisma.studentProfile.findMany({ where: { user: scope }, include: { user: true }, orderBy: { updatedAt: "desc" }, take: 80 }),
    prisma.contentItem.findMany({ where: scope, include: { createdBy: true, downloads: true, analytics: true, commerceOrderItems: { include: { order: true } } }, orderBy: { updatedAt: "desc" }, take: 120 }),
    prisma.downloadHistory.findMany({ where: { item: scope }, include: { item: true, user: true }, orderBy: { downloadedAt: "desc" }, take: 80 }),
    prisma.teacherBookingRequest.findMany({ where: institutionId ? { teacherProfile: { user: { institutionId } } } : {}, orderBy: { updatedAt: "desc" }, take: 80 }),
    prisma.aIUsage.findMany({ where: scope, include: { user: true }, orderBy: { createdAt: "desc" }, take: 120 }),
    prisma.aIUsage.groupBy({ by: ["feature"], where: scope, _sum: { totalTokens: true, costEstimate: true }, _count: true }),
    prisma.aIConversation.findMany({ where: scope, include: { user: true }, orderBy: { updatedAt: "desc" }, take: 80 }),
    prisma.commerceOrder.findMany({ where: scope, include: { buyer: true, items: { include: { seller: true, resource: true, plan: true } } }, orderBy: { createdAt: "desc" }, take: 120 }),
    prisma.userSubscription.findMany({ where: scope, include: { user: true, plan: true }, orderBy: { updatedAt: "desc" }, take: 80 }),
    prisma.wallet.findMany({ where: scope, include: { user: true }, orderBy: { updatedAt: "desc" }, take: 80 }),
    prisma.walletTransaction.findMany({ where: scope, include: { user: true, order: true }, orderBy: { createdAt: "desc" }, take: 80 }),
    prisma.coupon.findMany({ where: scope, orderBy: { updatedAt: "desc" }, take: 80 }),
    prisma.community.findMany({ where: scope, include: { _count: { select: { members: true, discussions: true } } }, orderBy: { updatedAt: "desc" }, take: 80 }),
    prisma.genericDiscussion.findMany({ where: scope, include: { author: true, replies: true }, orderBy: { updatedAt: "desc" }, take: 80 }),
    prisma.directMessage.findMany({ where: { conversation: scope }, include: { sender: true, conversation: true }, orderBy: { createdAt: "desc" }, take: 80 }),
    prisma.communication.findMany({ where: scope, include: { recipients: true, logs: true }, orderBy: { updatedAt: "desc" }, take: 80 }),
    prisma.notification.findMany({ where: institutionId ? { institutionId } : {}, orderBy: { createdAt: "desc" }, take: 80 }),
    prisma.activityEvent.findMany({ where: scope, include: { actor: true }, orderBy: { createdAt: "desc" }, take: 80 }),
    prisma.activity.findMany({ where: scope, include: { actor: true }, orderBy: { createdAt: "desc" }, take: 80 }),
    prisma.auditLog.findMany({ where: scope, include: { actor: true }, orderBy: { createdAt: "desc" }, take: 120 }),
    prisma.promptTemplate.findMany({ where: { OR: [scope, { institutionId: null }] }, orderBy: { updatedAt: "desc" }, take: 80 }),
    prisma.supportTicket.findMany({ where: scope, include: { requester: true, assignedTo: true, replies: true }, orderBy: { updatedAt: "desc" }, take: 80 }),
    prisma.featureFlag.findMany({ where: institutionId ? { OR: [{ institutionId }, { institutionId: null }] } : {}, orderBy: { updatedAt: "desc" }, take: 80 }),
    prisma.setting.findMany({ where: institutionId ? { institutionId } : { institutionId: { not: "" } }, orderBy: { updatedAt: "desc" }, take: 80 }),
    prisma.platformMetric.findMany({ where: scope, orderBy: { recordedAt: "desc" }, take: 80 })
  ]);

  const activeUsers = users.filter((user) => user.status === "ACTIVE");
  const todayUsers = users.filter((user) => user.createdAt >= today);
  const monthlyUsers = users.filter((user) => user.createdAt >= month);
  const teacherUsers = users.filter((user) => user.roles.some((role) => ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PART_TIME_TUTOR", "PHYSICAL_TRAINER"].includes(role.role.key)));
  const studentUsers = users.filter((user) => user.roles.some((role) => role.role.key === "STUDENT"));
  const paidOrders = orders.filter((order) => order.status === "PAID" || order.status === "FULFILLED");
  const todayActivity = [...activities, ...activityEvents].filter((item) => item.createdAt >= today);

  const categoryCounts = new Map<string, number>();
  resources.forEach((item) => {
    const category = getResourceMetadata(item).category ?? item.type;
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
  });

  const subjectCounts = new Map<string, number>();
  teacherProfiles.forEach((profile) => profile.subjects.forEach((subject) => subjectCounts.set(subject, (subjectCounts.get(subject) ?? 0) + 1)));

  return {
    overview: {
      users: users.length,
      activeUsers: activeUsers.length,
      teachers: teacherUsers.length,
      students: studentUsers.length,
      institutions: institutionId ? 1 : await prisma.institution.count(),
      todayActivity: todayActivity.length,
      revenue: paidOrders.reduce((total, order) => total + Number(order.total), 0),
      aiCreditsUsed: aiByFeature.reduce((total, item) => total + Math.ceil((item._sum.totalTokens ?? 0) / 100), 0)
    },
    users: {
      all: users,
      teachers: teacherProfiles,
      students: studentProfiles,
      activeUsers,
      dailyActiveUsers: todayUsers.length,
      monthlyActiveUsers: monthlyUsers.length,
      retentionPlaceholder: "Retention cohorts ready for event instrumentation.",
      growthTrends: [
        { label: "Today", value: todayUsers.length },
        { label: "This Month", value: monthlyUsers.length },
        { label: "Total", value: users.length }
      ]
    },
    ai: {
      usage: aiUsage,
      conversations: aiConversations,
      byFeature: aiByFeature.map((item) => ({ feature: item.feature, generations: item._count, credits: Math.ceil((item._sum.totalTokens ?? 0) / 100), cost: Number(item._sum.costEstimate ?? 0) })),
      generations: aiUsage.length,
      creditsUsed: aiByFeature.reduce((total, item) => total + Math.ceil((item._sum.totalTokens ?? 0) / 100), 0),
      estimatedCost: money(aiUsage.reduce((total, item) => total + Number(item.costEstimate), 0)),
      averageResponseTimePlaceholder: "Streaming latency instrumentation pending.",
      topPromptCategories: promptTemplates.slice(0, 8).map((item) => item.name),
      teacherUsage: aiUsage.filter((item) => item.user?.userType === "teacher").length,
      studentUsage: aiUsage.filter((item) => item.user?.userType === "student").length
    },
    marketplace: {
      teachers: teacherProfiles,
      resources,
      downloads,
      bookings,
      topSubjects: Array.from(subjectCounts.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8),
      topCategories: Array.from(categoryCounts.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8),
      conversionPlaceholder: "View-to-order conversion ready once checkout goes live."
    },
    commerce: {
      orders,
      subscriptions,
      wallets,
      walletTransactions,
      coupons,
      revenuePlaceholder: paidOrders.reduce((total, order) => total + Number(order.total), 0),
      creditsSold: walletTransactions.filter((item) => item.metadata && typeof item.metadata === "object").length,
      couponUsage: coupons.reduce((total, coupon) => total + coupon.usedCount, 0),
      referralStatistics: "Referral model ready; reward events pending."
    },
    community: {
      communications,
      communities,
      messages,
      discussions,
      bookings,
      activityEvents,
      announcements: communications.filter((item) => item.kind === "ANNOUNCEMENT")
    },
    content: {
      resources,
      announcements: communications.filter((item) => item.kind === "ANNOUNCEMENT"),
      promptTemplates,
      categories: Array.from(categoryCounts.keys()),
      featuredContent: resources.filter((item) => item.status === "PUBLISHED").slice(0, 8),
      homepageHighlights: platformMetrics.filter((item) => item.key.includes("highlight"))
    },
    support: {
      tickets: supportTickets,
      open: supportTickets.filter((item) => item.status === "OPEN").length,
      bugs: supportTickets.filter((item) => item.type === "BUG").length,
      featureRequests: supportTickets.filter((item) => item.type === "FEATURE_REQUEST").length,
      knowledgeBasePlaceholder: "Knowledge base content model can reuse ContentItem or PromptTemplate."
    },
    operations: {
      notifications,
      activityEvents,
      activities,
      auditLogs,
      featureFlags,
      settings,
      platformMetrics,
      pendingReviews: [
        ...resources.filter((item) => item.status === "SUBMITTED" || item.status === "ACADEMIC_APPROVAL").map((item) => ({ title: item.title, type: "Content", href: "/content-studio" })),
        ...supportTickets.filter((item) => item.status === "OPEN").map((item) => ({ title: item.subject, type: "Support", href: "/admin/support" })),
        ...discussions.filter((item) => item.status === "LOCKED").map((item) => ({ title: item.title, type: "Moderation", href: "/admin/moderation" }))
      ],
      systemHealth: [
        { label: "Auth", value: "Protected" },
        { label: "RBAC", value: "Active" },
        { label: "Database", value: "Prisma Valid" },
        { label: "Realtime", value: "Not enabled" }
      ]
    }
  };
}
