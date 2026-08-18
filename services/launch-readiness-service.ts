import { prisma } from "@/lib/db";
import { getRuntimeCheck } from "@/lib/env";

type LaunchCheck = {
  area: string;
  status: "ready" | "attention" | "blocked";
  score: number;
  message: string;
};

function status(score: number): LaunchCheck["status"] {
  if (score >= 85) return "ready";
  if (score >= 60) return "attention";
  return "blocked";
}

function check(area: string, score: number, message: string): LaunchCheck {
  return { area, score, message, status: status(score) };
}

export async function getLaunchReadiness(institutionId?: string | null) {
  const runtime = getRuntimeCheck();
  const scope = institutionId ? { institutionId } : {};

  const [
    teachers,
    teacherProfiles,
    aiUsage,
    resources,
    plans,
    pendingPaidOrders,
    urgentTickets,
    feedbackTickets,
    activeSubscriptions
  ] = await Promise.all([
    prisma.user.count({ where: { ...scope, userType: "teacher" } }),
    prisma.teacherProfile.findMany({ where: { user: scope }, select: { headline: true, bio: true, subjects: true, qualification: true, experienceYears: true, languages: true, teachingMode: true } }),
    prisma.aIUsage.count({ where: scope }),
    prisma.contentItem.count({ where: scope }),
    prisma.subscriptionPlan.count({ where: { OR: [{ institutionId: institutionId ?? null }, { institutionId: null }], audience: "TEACHER", isActive: true } }),
    prisma.commerceOrder.count({ where: { ...scope, type: "SUBSCRIPTION_PURCHASE", status: "PENDING_PAYMENT" } }),
    prisma.supportTicket.count({ where: { ...scope, status: { in: ["OPEN", "IN_REVIEW"] }, priority: { in: ["HIGH", "URGENT"] } } }),
    prisma.supportTicket.count({ where: { ...scope, type: { in: ["FEEDBACK", "BUG"] } } }),
    prisma.userSubscription.count({ where: { ...scope, status: "ACTIVE", plan: { audience: "TEACHER" } } })
  ]);

  const profileReady = teacherProfiles.filter((profile) => {
    const checks = [profile.headline, profile.bio, profile.subjects.length, profile.qualification, profile.experienceYears, profile.languages.length, profile.teachingMode];
    return checks.filter(Boolean).length >= 5;
  }).length;

  const profileScore = teachers ? Math.round((profileReady / teachers) * 100) : 70;
  const aiScore = teachers ? Math.min(100, Math.round((aiUsage / Math.max(1, teachers)) * 100)) : runtime.optional.openAI ? 80 : 45;
  const resourceScore = teachers ? Math.min(100, Math.round((resources / Math.max(1, teachers)) * 100)) : 65;
  const pricingScore = plans >= 4 ? 100 : plans >= 2 ? 70 : 35;
  const supportScore = urgentTickets ? Math.max(35, 100 - urgentTickets * 15) : 95;
  const billingScore = pendingPaidOrders > 25 ? 65 : activeSubscriptions || pendingPaidOrders || plans ? 90 : 75;
  const runtimeScore = runtime.ok ? (runtime.optional.openAI ? 100 : 82) : 45;

  const checks = [
    check("Runtime configuration", runtimeScore, runtime.ok ? "Required production variables are present." : `Missing: ${runtime.missing.join(", ")}`),
    check("Teacher onboarding", profileScore, `${profileReady}/${teachers || 0} teacher profiles look launch-ready.`),
    check("AI activation", aiScore, runtime.optional.openAI ? `${aiUsage} AI usage records found.` : "OpenAI key is not configured, so AI launch depends on environment setup."),
    check("Resource readiness", resourceScore, `${resources} teacher-owned resources are available.`),
    check("Pricing and plans", pricingScore, `${plans} active teacher plans are configured.`),
    check("Billing operations", billingScore, `${pendingPaidOrders} paid checkout order(s) are waiting for payment completion.`),
    check("Support operations", supportScore, `${urgentTickets} high-priority open support item(s), ${feedbackTickets} feedback/bug item(s) captured.`)
  ];

  const score = Math.round(checks.reduce((total, item) => total + item.score, 0) / checks.length);

  return {
    generatedAt: new Date().toISOString(),
    score,
    status: status(score),
    checks,
    metrics: {
      teachers,
      profileReady,
      aiUsage,
      resources,
      plans,
      pendingPaidOrders,
      urgentTickets,
      feedbackTickets,
      activeSubscriptions
    },
    nextActions: checks
      .filter((item) => item.status !== "ready")
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)
      .map((item) => `Improve ${item.area.toLowerCase()}: ${item.message}`)
  };
}
