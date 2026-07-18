import { prisma } from "@/lib/db";

export type MarketplaceTeacher = Awaited<ReturnType<typeof getMarketplaceTeachers>>[number];

export async function getMarketplaceTeachers(input?: { query?: string; subject?: string; mode?: string; language?: string; board?: string; className?: string; location?: string }) {
  const contains = input?.query ? { contains: input.query, mode: "insensitive" as const } : undefined;

  return prisma.teacherProfile.findMany({
    where: {
      isMarketplaceListed: true,
      ...(contains ? { OR: [{ user: { name: contains } }, { headline: contains }, { bio: contains }, { location: contains }] } : {}),
      ...(input?.subject ? { subjects: { has: input.subject } } : {}),
      ...(input?.mode ? { teachingMode: input.mode } : {}),
      ...(input?.language ? { languages: { has: input.language } } : {}),
      ...(input?.board ? { boards: { has: input.board } } : {}),
      ...(input?.className ? { classes: { has: input.className } } : {}),
      ...(input?.location ? { location: { contains: input.location, mode: "insensitive" } } : {})
    },
    include: {
      user: { include: { profile: true } },
      bookingRequests: true
    },
    orderBy: { updatedAt: "desc" },
    take: 48
  });
}

export async function getMarketplaceTeacher(id: string) {
  return prisma.teacherProfile.findUnique({
    where: { id },
    include: {
      user: { include: { profile: true } },
      bookingRequests: { orderBy: { createdAt: "desc" }, take: 10 }
    }
  });
}

export async function getTeacherMarketplaceDashboard(userId?: string) {
  if (!userId) return { profile: null, requests: [], savedByStudents: 0, profileViews: 0 };

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId },
    include: { user: { include: { profile: true } }, bookingRequests: { orderBy: { createdAt: "desc" } } }
  });

  if (!profile) return { profile: null, requests: [], savedByStudents: 0, profileViews: 0 };

  const [savedByStudents, profileViews] = await Promise.all([
    prisma.favoriteItem.count({ where: { type: "marketplace-teacher", entityId: profile.id } }),
    prisma.recentItem.count({ where: { type: "marketplace-teacher", entityId: profile.id } })
  ]);

  return { profile, requests: profile.bookingRequests, savedByStudents, profileViews };
}

export async function getStudentMarketplaceDashboard(userId?: string) {
  if (!userId) return { savedTeachers: [], recentTeachers: [], requests: [] };

  const [savedTeachers, recentTeachers, requests] = await Promise.all([
    prisma.favoriteItem.findMany({ where: { userId, type: "marketplace-teacher" }, orderBy: { createdAt: "desc" }, take: 12 }),
    prisma.recentItem.findMany({ where: { userId, type: "marketplace-teacher" }, orderBy: { viewedAt: "desc" }, take: 12 }),
    prisma.teacherBookingRequest.findMany({ where: { studentId: userId }, orderBy: { createdAt: "desc" }, take: 12 })
  ]);

  return { savedTeachers, recentTeachers, requests };
}

export async function getMarketplaceFacets() {
  const teachers = await prisma.teacherProfile.findMany({
    where: { isMarketplaceListed: true },
    select: { subjects: true, boards: true, languages: true, classes: true, teachingMode: true, location: true }
  });

  const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean))).sort();

  return {
    subjects: unique(teachers.flatMap((item) => item.subjects)),
    boards: unique(teachers.flatMap((item) => item.boards)),
    languages: unique(teachers.flatMap((item) => item.languages)),
    classes: unique(teachers.flatMap((item) => item.classes)),
    modes: unique(teachers.map((item) => item.teachingMode ?? "")),
    locations: unique(teachers.map((item) => item.location ?? ""))
  };
}
