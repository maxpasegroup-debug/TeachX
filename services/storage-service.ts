import { prisma } from "@/lib/db";

const storageLimitBytes = 100 * 1024 * 1024 * 1024;

export async function getStorageDashboard(institutionId?: string | null) {
  if (!institutionId) return { totalFiles: 0, usedBytes: 0, remainingBytes: storageLimitBytes, fileTypes: [], largeFiles: [], unusedFiles: [], duplicateFiles: [] };

  const items = await prisma.contentItem.findMany({ where: { institutionId }, include: { analytics: true }, orderBy: { sizeBytes: "desc" } });
  const usedBytes = items.reduce((total, item) => total + item.sizeBytes, 0);
  const byType = new Map<string, { type: string; count: number; sizeBytes: number }>();

  for (const item of items) {
    const current = byType.get(item.type) ?? { type: item.type, count: 0, sizeBytes: 0 };
    current.count += 1;
    current.sizeBytes += item.sizeBytes;
    byType.set(item.type, current);
  }

  const seen = new Map<string, number>();
  for (const item of items) {
    const key = `${item.title}:${item.sizeBytes}`;
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }

  return {
    totalFiles: items.length,
    usedBytes,
    remainingBytes: Math.max(storageLimitBytes - usedBytes, 0),
    fileTypes: Array.from(byType.values()),
    largeFiles: items.slice(0, 8),
    unusedFiles: items.filter((item) => !item.analytics || item.analytics.views === 0).slice(0, 8),
    duplicateFiles: items.filter((item) => (seen.get(`${item.title}:${item.sizeBytes}`) ?? 0) > 1).slice(0, 8)
  };
}
