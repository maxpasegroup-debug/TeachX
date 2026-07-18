import { prisma } from "@/lib/db";

export async function getContentAnalytics(institutionId?: string | null) {
  if (!institutionId) return { totals: { views: 0, downloads: 0, watchTimeSeconds: 0, bookmarks: 0 }, mostViewed: [], leastViewed: [] };

  const analytics = await prisma.contentAnalytics.findMany({
    where: { item: { institutionId } },
    include: { item: { include: { course: true, subject: true } } },
    orderBy: { views: "desc" }
  });

  return {
    totals: {
      views: analytics.reduce((total, row) => total + row.views, 0),
      downloads: analytics.reduce((total, row) => total + row.downloads, 0),
      watchTimeSeconds: analytics.reduce((total, row) => total + row.watchTimeSeconds, 0),
      bookmarks: analytics.reduce((total, row) => total + row.bookmarks, 0)
    },
    mostViewed: analytics.slice(0, 8),
    leastViewed: [...analytics].reverse().slice(0, 8)
  };
}

export async function recordContentView(itemId: string, userId?: string) {
  await prisma.contentAnalytics.upsert({
    where: { itemId },
    update: { views: { increment: 1 }, lastViewedAt: new Date() },
    create: { itemId, views: 1, lastViewedAt: new Date() }
  });

  if (userId) {
    await prisma.watchHistory.upsert({
      where: { itemId_userId: { itemId, userId } },
      update: { watchTimeSeconds: { increment: 0 } },
      create: { itemId, userId }
    });
  }
}
