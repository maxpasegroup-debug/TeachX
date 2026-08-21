import { prisma } from "@/lib/db";
import { getActiveSubscription } from "@/services/commerce-service";
import { getUserPreferences } from "@/services/preference-service";

export const teacherLifePillars = ["save-time", "earn-more", "learn-more", "enjoy-more"] as const;
export type TeacherLifePillar = (typeof teacherLifePillars)[number];

const teacherRoles = ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"];

function metadata(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export async function getTeacherLifeData(userId?: string, institutionId?: string | null) {
  if (!userId || !institutionId) return null;
  const teacher = await prisma.user.findFirst({
    where: { id: userId, institutionId, status: "ACTIVE", roles: { some: { role: { key: { in: teacherRoles } } } } },
    select: { id: true, name: true, teacherProfile: { select: { id: true, isMarketplaceListed: true, onboardingStep: true } } }
  });
  if (!teacher) return null;

  const now = new Date();
  const historyStart = new Date(now); historyStart.setMonth(historyStart.getMonth() - 6);
  const futureEnd = new Date(now); futureEnd.setFullYear(futureEnd.getFullYear() + 1);
  const [learningItems, webinars, subscription, preferences] = await Promise.all([
    prisma.contentItem.findMany({
      where: {
        institutionId,
        status: "PUBLISHED",
        visibility: { in: ["PUBLIC", "TEACHERS"] },
        OR: [
          { aiReadyNotes: { path: ["teacherLearningType"], equals: "AI_SKILLS" } },
          { aiReadyNotes: { path: ["teacherLearningType"], equals: "PROFESSIONAL_DEVELOPMENT" } },
          { aiReadyNotes: { path: ["teacherLearningType"], equals: "AUDIOBOOK" } },
          { aiReadyNotes: { path: ["teacherLearningType"], equals: "BOOK" } },
          { aiReadyNotes: { path: ["teacherLearningType"], equals: "VIDEO_COURSE" } },
          { aiReadyNotes: { path: ["teacherLearningType"], equals: "RECORDED_WEBINAR" } }
        ]
      },
      select: { id: true, title: true, description: true, type: true, externalUrl: true, fileUrl: true, aiReadyNotes: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 60
    }),
    prisma.plannerEvent.findMany({
      where: {
        institutionId,
        createdById: null,
        status: { notIn: ["CANCELLED", "ARCHIVED"] },
        startsAt: { gte: historyStart, lte: futureEnd },
        OR: [
          { title: { contains: "webinar", mode: "insensitive" } },
          { description: { contains: "webinar", mode: "insensitive" } }
        ]
      },
      select: { id: true, title: true, description: true, startsAt: true, endsAt: true, location: true },
      orderBy: { startsAt: "asc" },
      take: 30
    }),
    getActiveSubscription(userId, institutionId, "TEACHER"),
    getUserPreferences(userId)
  ]);

  return {
    teacher: {
      name: teacher.name,
      profileId: teacher.teacherProfile?.id ?? null,
      oneToOneActive: teacher.teacherProfile?.onboardingStep === "one-to-one-active" && Boolean(teacher.teacherProfile?.isMarketplaceListed)
    },
    subscription: subscription ? { name: subscription.plan.name, active: subscription.status === "ACTIVE" } : null,
    recentItems: preferences.recentItems
      .filter((item) => Boolean(item.link?.startsWith("/teacher") || item.link?.startsWith("/tara")))
      .slice(0, 4)
      .map((item) => ({ id: item.id, title: item.title, type: item.type, href: item.link! })),
    learning: learningItems.map((item) => {
      const details = metadata(item.aiReadyNotes);
      const access = details.teacherLearningAccess === "PREMIUM" ? "PREMIUM" : details.teacherLearningAccess === "FREE" ? "FREE" : "PUBLISHER_DEFINED";
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        kind: String(details.teacherLearningType ?? "PROFESSIONAL_DEVELOPMENT"),
        category: typeof details.category === "string" ? details.category : null,
        author: typeof details.author === "string" ? details.author : null,
        access,
        previewAvailable: Boolean(item.externalUrl || item.fileUrl),
        href: `/resources/${item.id}`,
        updatedAt: item.updatedAt.toISOString()
      };
    }),
    webinars: webinars.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      startsAt: item.startsAt.toISOString(),
      endsAt: item.endsAt.toISOString(),
      location: item.location,
      state: item.startsAt > now ? "UPCOMING" : "RECORDED_SESSION_PENDING"
    }))
  };
}
