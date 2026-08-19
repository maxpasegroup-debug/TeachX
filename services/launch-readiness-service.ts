import { prisma } from "@/lib/db";
import { getRuntimeCheck } from "@/lib/env";
import { getPaymentConfig } from "@/lib/payments/config";
import { getEmailConfig } from "@/lib/email/config";
import { getStorageConfig } from "@/lib/storage/config";
import { getResilienceConfig } from "@/lib/resilience/config";
import { getGlobalizationConfig } from "@/lib/globalization/config";
import { getPerformanceConfig } from "@/lib/performance/config";
import { getPrivacyConfig } from "@/lib/privacy/config";

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
  const payments = getPaymentConfig();
  const email = getEmailConfig();
  const storage = getStorageConfig();
  const resilience = getResilienceConfig();
  const globalization = getGlobalizationConfig();
  const performanceConfig = getPerformanceConfig();
  const privacyConfig = getPrivacyConfig();
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
    activeSubscriptions,
    failedPaymentEvents,
    failedEmails,
    activeStorageObjects,
    unhealthyStorageObjects
  ] = await Promise.all([
    prisma.user.count({ where: { ...scope, userType: "teacher" } }),
    prisma.teacherProfile.findMany({ where: { user: scope }, select: { headline: true, bio: true, subjects: true, qualification: true, experienceYears: true, languages: true, teachingMode: true } }),
    prisma.aIUsage.count({ where: scope }),
    prisma.contentItem.count({ where: scope }),
    prisma.subscriptionPlan.count({ where: { OR: [{ institutionId: institutionId ?? null }, { institutionId: null }], audience: "TEACHER", isActive: true } }),
    prisma.commerceOrder.count({ where: { ...scope, type: "SUBSCRIPTION_PURCHASE", status: "PENDING_PAYMENT" } }),
    prisma.supportTicket.count({ where: { ...scope, status: { in: ["OPEN", "IN_REVIEW"] }, priority: { in: ["HIGH", "URGENT"] } } }),
    prisma.supportTicket.count({ where: { ...scope, type: { in: ["FEEDBACK", "BUG"] } } }),
    prisma.userSubscription.count({ where: { ...scope, status: "ACTIVE", plan: { audience: "TEACHER" } } }),
    prisma.commercePaymentEvent.count({ where: { ...scope, status: "FAILED", receivedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    prisma.transactionalEmail.count({ where: { ...scope, status: { in: ["BOUNCED", "COMPLAINED", "SUPPRESSED", "FAILED"] }, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    prisma.storageObject.count({ where: { ...scope, status: "ACTIVE" } }),
    prisma.storageObject.count({ where: { ...scope, OR: [{ status: "QUARANTINED" }, { status: "PENDING", uploadExpiresAt: { lte: new Date() } }] } })
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
  const billingScore = !payments.live ? 35 : failedPaymentEvents ? Math.max(45, 85 - failedPaymentEvents * 10) : pendingPaidOrders > 25 ? 75 : 100;
  const runtimeScore = runtime.ok ? (runtime.optional.openAI ? 100 : 82) : 45;
  const emailScore = !email.live ? 35 : failedEmails ? Math.max(45, 90 - failedEmails * 10) : 100;
  const storageScore = !storage.live ? 30 : unhealthyStorageObjects ? Math.max(40, 90 - unhealthyStorageObjects * 10) : activeStorageObjects ? 100 : 85;
  const resilienceScore = resilience.live ? 100 : Object.values(resilience.controls).filter(Boolean).length * 20 + (resilience.evidenceFresh ? 20 : 0);
  const globalizationScore = globalization.live ? 100 : Object.values(globalization.controls).filter(Boolean).length * 20 + (globalization.evidenceFresh ? 20 : 0);
  const performanceScore = performanceConfig.live ? 100 : Object.values(performanceConfig.controls).filter(Boolean).length * 20 + (performanceConfig.evidenceFresh ? 20 : 0);
  const privacyScore = privacyConfig.live ? 100 : Object.values(privacyConfig.controls).filter(Boolean).length * 15 + (privacyConfig.evidenceFresh ? 20 : 0);

  const checks = [
    check("Runtime configuration", runtimeScore, runtime.ok ? "Required production variables are present." : `Missing: ${runtime.missing.join(", ")}`),
    check("Teacher onboarding", profileScore, `${profileReady}/${teachers || 0} teacher profiles look launch-ready.`),
    check("AI activation", aiScore, runtime.optional.openAI ? `${aiUsage} AI usage records found.` : "OpenAI key is not configured, so AI launch depends on environment setup."),
    check("Resource readiness", resourceScore, `${resources} teacher-owned resources are available.`),
    check("Pricing and plans", pricingScore, `${plans} active teacher plans are configured.`),
    check("Billing operations", billingScore, payments.live ? `${pendingPaidOrders} order(s) pending; ${failedPaymentEvents} failed payment event(s) in 24 hours.` : "Payment providers or tax, refund, and reconciliation controls are incomplete."),
    check("Transactional email", emailScore, email.live ? `${failedEmails} failed, bounced, suppressed, or complained email(s) in 24 hours.` : "Verified-domain transactional email delivery is incomplete."),
    check("Private file storage", storageScore, storage.live ? `${activeStorageObjects} verified file(s); ${unhealthyStorageObjects} stale or quarantined object(s).` : "Private object storage controls are incomplete."),
    check("Low-connectivity resilience", resilienceScore, resilience.live ? "Real-device PWA, offline draft, and resumable upload evidence is current." : "Real-device low-bandwidth and resumable upload evidence is incomplete or stale."),
    check("Globalization and accessibility", globalizationScore, globalization.live ? "Locale, RTL, keyboard, motion, contrast, and WCAG evidence is current." : "Global locale and accessibility production evidence is incomplete or stale."),
    check("Global scale and performance", performanceScore, performanceConfig.live ? `Production load, cache, and database evidence is current with a ${performanceConfig.budgets.p95LatencyMs}ms p95 budget.` : "Production capacity, latency, cache, or database-pool evidence is incomplete or stale."),
    check("Global privacy operations", privacyScore, privacyConfig.live ? `Rights, consent, retention, vendor, transfer, and cookie evidence is current for policy ${privacyConfig.policyVersion}.` : "Privacy program controls or evidence are incomplete or stale."),
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
      activeSubscriptions,
      failedPaymentEvents,
      failedEmails,
      activeStorageObjects,
      unhealthyStorageObjects
    },
    nextActions: checks
      .filter((item) => item.status !== "ready")
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)
      .map((item) => `Improve ${item.area.toLowerCase()}: ${item.message}`)
  };
}
