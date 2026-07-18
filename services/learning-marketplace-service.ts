import type { ContentItemType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export const learningResourceTypes = [
  "Lesson Plans",
  "Worksheets",
  "Question Papers",
  "Question Banks",
  "Answer Keys",
  "Study Notes",
  "Revision Notes",
  "Flashcards",
  "Mind Maps",
  "Exam Blueprints",
  "Assignments",
  "Projects",
  "Rubrics",
  "Presentations",
  "Certificates",
  "Lesson Summaries",
  "Teaching Templates",
  "AI Prompt Templates",
  "Recorded Course"
] as const;

export type LearningResourceFilters = {
  query?: string;
  category?: string;
  subject?: string;
  className?: string;
  board?: string;
  language?: string;
  priceType?: string;
  teacher?: string;
  sort?: string;
  institutionId?: string | null;
};

export type LearningResource = Prisma.ContentItemGetPayload<{
  include: {
    course: true;
    subject: true;
    createdBy: { include: { profile: true; teacherProfile: true } };
    analytics: true;
    downloads: true;
  };
}>;

type ResourceMetadata = {
  marketplace?: string;
  resourceType?: string;
  category?: string;
  className?: string;
  board?: string;
  language?: string;
  tags?: string[];
  pages?: string;
  priceType?: string;
  coverImage?: string;
  outputFormat?: string;
  preview?: string;
  filePlaceholders?: string[];
  source?: string;
};

export function getResourceMetadata(item: { aiReadyNotes: Prisma.JsonValue | null }): ResourceMetadata {
  if (!item.aiReadyNotes || typeof item.aiReadyNotes !== "object" || Array.isArray(item.aiReadyNotes)) return {};
  return item.aiReadyNotes as ResourceMetadata;
}

export function mapResourceTypeToContentType(resourceType?: string): ContentItemType {
  const normalized = (resourceType ?? "").toLowerCase();
  if (normalized.includes("worksheet")) return "WORKSHEET";
  if (normalized.includes("question paper")) return "QUESTION_PAPER";
  if (normalized.includes("answer key")) return "ANSWER_KEY";
  if (normalized.includes("presentation")) return "PPT";
  if (normalized.includes("note") || normalized.includes("summary")) return "NOTES";
  if (normalized.includes("recorded")) return "VIDEO";
  return "DOCUMENT";
}

function matchesMetadata(item: LearningResource, filters: LearningResourceFilters) {
  const metadata = getResourceMetadata(item);
  const checks = [
    [filters.category, metadata.category],
    [filters.className, metadata.className],
    [filters.board, metadata.board],
    [filters.language, metadata.language],
    [filters.priceType, metadata.priceType],
    [filters.subject, item.subject?.name ?? item.course.name],
    [filters.teacher, item.createdBy?.name ?? ""]
  ];

  return checks.every(([filter, value]) => !filter || value?.toLowerCase().includes(filter.toLowerCase()));
}

export async function getLearningResources(filters: LearningResourceFilters = {}) {
  const contains = filters.query ? { contains: filters.query, mode: "insensitive" as const } : undefined;

  const resources = await prisma.contentItem.findMany({
    where: {
      ...(filters.institutionId ? { institutionId: filters.institutionId } : {}),
      status: "PUBLISHED",
      visibility: "PUBLIC",
      ...(contains
        ? {
            OR: [
              { title: contains },
              { description: contains },
              { course: { name: contains } },
              { subject: { name: contains } },
              { createdBy: { name: contains } }
            ]
          }
        : {})
    },
    include: {
      course: true,
      subject: true,
      createdBy: { include: { profile: true, teacherProfile: true } },
      analytics: true,
      downloads: true
    },
    orderBy: filters.sort === "oldest" ? { createdAt: "asc" } : { updatedAt: "desc" },
    take: 96
  });

  const filtered = resources.filter((item) => matchesMetadata(item, filters));
  if (filters.sort === "popular") return filtered.sort((a, b) => (b.analytics?.views ?? 0) - (a.analytics?.views ?? 0));
  if (filters.sort === "downloads") return filtered.sort((a, b) => b.downloads.length - a.downloads.length);
  return filtered;
}

export async function getLearningMarketplaceHome(userId?: string, institutionId?: string | null) {
  const resources = await getLearningResources({ institutionId });
  const recentItems = userId
    ? await prisma.recentItem.findMany({ where: { userId, type: "learning-resource" }, orderBy: { viewedAt: "desc" }, take: 8 })
    : [];

  return {
    featured: resources.slice(0, 6),
    trending: [...resources].sort((a, b) => (b.analytics?.views ?? 0) - (a.analytics?.views ?? 0)).slice(0, 6),
    mostDownloaded: [...resources].sort((a, b) => b.downloads.length - a.downloads.length).slice(0, 6),
    newest: resources.slice(0, 6),
    free: resources.filter((item) => getResourceMetadata(item).priceType !== "Premium").slice(0, 6),
    premium: resources.filter((item) => getResourceMetadata(item).priceType === "Premium").slice(0, 6),
    recommended: resources.slice(0, 8),
    recentlyViewed: recentItems,
    categories: Array.from(new Set(resources.map((item) => getResourceMetadata(item).category).filter(Boolean) as string[])).sort()
  };
}

export async function getLearningResource(id: string) {
  return prisma.contentItem.findFirst({
    where: { id, status: "PUBLISHED", visibility: "PUBLIC" },
    include: {
      course: true,
      subject: true,
      createdBy: { include: { profile: true, teacherProfile: true } },
      analytics: true,
      downloads: true
    }
  });
}

export async function getRelatedLearningResources(resource: LearningResource) {
  const metadata = getResourceMetadata(resource);
  return getLearningResources({
    institutionId: resource.institutionId,
    category: metadata.category,
    subject: resource.subject?.name ?? resource.course.name
  }).then((items) => items.filter((item) => item.id !== resource.id).slice(0, 4));
}

export async function trackLearningResourceView(item: LearningResource, userId?: string) {
  await prisma.contentAnalytics.upsert({
    where: { itemId: item.id },
    update: { views: { increment: 1 }, lastViewedAt: new Date() },
    create: { itemId: item.id, views: 1, lastViewedAt: new Date() }
  });

  if (!userId) return;
  await prisma.recentItem.upsert({
    where: { userId_type_entityId: { userId, type: "learning-resource", entityId: item.id } },
    update: { title: item.title, link: `/resources/${item.id}`, viewedAt: new Date(), metadata: { teacher: item.createdBy?.name, category: getResourceMetadata(item).category } },
    create: { userId, type: "learning-resource", entityId: item.id, title: item.title, link: `/resources/${item.id}`, metadata: { teacher: item.createdBy?.name, category: getResourceMetadata(item).category } }
  });
}

export async function getLearningMarketplaceFacets(institutionId?: string | null) {
  const resources = await getLearningResources({ institutionId });
  const unique = (items: string[]) => Array.from(new Set(items.filter(Boolean))).sort();

  return {
    categories: unique(resources.map((item) => getResourceMetadata(item).category ?? "")),
    subjects: unique(resources.flatMap((item) => [item.subject?.name ?? "", item.course.name])),
    classes: unique(resources.map((item) => getResourceMetadata(item).className ?? "")),
    boards: unique(resources.map((item) => getResourceMetadata(item).board ?? "")),
    languages: unique(resources.map((item) => getResourceMetadata(item).language ?? "")),
    teachers: unique(resources.map((item) => item.createdBy?.name ?? "")),
    priceTypes: ["Free", "Premium"]
  };
}

export async function getTeacherResourceLibrary(userId?: string, institutionId?: string | null) {
  if (!userId || !institutionId) return { resources: [], courses: [], subjects: [], stats: { published: 0, drafts: 0, archived: 0, downloads: 0, bookmarks: 0, views: 0 }, aiGenerations: [] };

  const [resources, courses, subjects, aiGenerations] = await Promise.all([
    prisma.contentItem.findMany({
      where: { institutionId, createdById: userId },
      include: { course: true, subject: true, createdBy: { include: { profile: true, teacherProfile: true } }, analytics: true, downloads: true },
      orderBy: { updatedAt: "desc" },
      take: 80
    }),
    prisma.course.findMany({ where: { institutionId }, orderBy: { name: "asc" }, take: 100 }),
    prisma.subject.findMany({ where: { course: { institutionId } }, orderBy: [{ courseId: "asc" }, { order: "asc" }], take: 100 }),
    prisma.aIConversation.findMany({ where: { userId, scope: "TEACHER" }, orderBy: { updatedAt: "desc" }, take: 12 })
  ]);

  const ids = resources.map((item) => item.id);
  const bookmarks = ids.length ? await prisma.favoriteItem.count({ where: { type: "learning-resource", entityId: { in: ids } } }) : 0;

  return {
    resources,
    courses,
    subjects,
    aiGenerations,
    stats: {
      published: resources.filter((item) => item.status === "PUBLISHED").length,
      drafts: resources.filter((item) => item.status === "DRAFT").length,
      archived: resources.filter((item) => item.status === "ARCHIVED").length,
      downloads: resources.reduce((total, item) => total + item.downloads.length, 0),
      bookmarks,
      views: resources.reduce((total, item) => total + (item.analytics?.views ?? 0), 0)
    }
  };
}

export async function getStudentResourceDashboard(userId?: string, institutionId?: string | null) {
  if (!userId) return { savedResources: [], wishlist: [], downloads: [], recent: [], recommended: [] };

  const [savedResources, wishlist, downloads, recent, recommended] = await Promise.all([
    prisma.favoriteItem.findMany({ where: { userId, type: "learning-resource" }, orderBy: { createdAt: "desc" }, take: 16 }),
    prisma.favoriteItem.findMany({ where: { userId, type: "learning-resource-wishlist" }, orderBy: { createdAt: "desc" }, take: 16 }),
    prisma.downloadHistory.findMany({ where: { userId }, include: { item: true }, orderBy: { downloadedAt: "desc" }, take: 16 }),
    prisma.recentItem.findMany({ where: { userId, type: "learning-resource" }, orderBy: { viewedAt: "desc" }, take: 16 }),
    getLearningResources({ institutionId }).then((items) => items.slice(0, 8))
  ]);

  return { savedResources, wishlist, downloads, recent, recommended };
}
