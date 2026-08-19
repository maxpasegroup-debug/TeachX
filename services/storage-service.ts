import { prisma } from "@/lib/db";
import { getStorageConfig } from "@/lib/storage/config";

export async function getStorageDashboard(institutionId?: string | null) {
  const defaultLimit = getStorageConfig().defaultQuotaMb * 1024 * 1024;
  if (!institutionId) return { totalFiles: 0, usedBytes: 0, remainingBytes: defaultLimit, fileTypes: [], largeFiles: [], unusedFiles: [], duplicateFiles: [], pendingFiles: 0, quarantinedFiles: 0 };

  const [objects, pendingFiles, quarantinedFiles] = await Promise.all([
    prisma.storageObject.findMany({ where: { institutionId, status: "ACTIVE" }, include: { contentItem: { include: { analytics: true } } }, orderBy: { sizeBytes: "desc" } }),
    prisma.storageObject.count({ where: { institutionId, status: "PENDING", uploadExpiresAt: { gt: new Date() } } }),
    prisma.storageObject.count({ where: { institutionId, status: "QUARANTINED" } })
  ]);
  const usedBytes = objects.reduce((total, object) => total + Number(object.sizeBytes), 0);
  const storageLimitBytes = defaultLimit * Math.max(1, new Set(objects.map((object) => object.ownerId)).size);
  const byType = new Map<string, { type: string; count: number; sizeBytes: number }>();

  for (const object of objects) {
    const type = object.contentItem?.type ?? object.mimeType;
    const current = byType.get(type) ?? { type, count: 0, sizeBytes: 0 };
    current.count += 1;
    current.sizeBytes += Number(object.sizeBytes);
    byType.set(type, current);
  }

  const seen = new Map<string, number>();
  for (const object of objects) seen.set(object.checksumSha256, (seen.get(object.checksumSha256) ?? 0) + 1);
  const display = (object: (typeof objects)[number]) => ({ id: object.id, title: object.contentItem?.title ?? object.originalName, sizeBytes: Number(object.sizeBytes) });

  return {
    totalFiles: objects.length,
    usedBytes,
    remainingBytes: Math.max(storageLimitBytes - usedBytes, 0),
    fileTypes: Array.from(byType.values()),
    largeFiles: objects.slice(0, 8).map(display),
    unusedFiles: objects.filter((object) => !object.contentItem?.analytics || object.contentItem.analytics.views === 0).slice(0, 8).map(display),
    duplicateFiles: objects.filter((object) => (seen.get(object.checksumSha256) ?? 0) > 1).slice(0, 8).map(display),
    pendingFiles,
    quarantinedFiles
  };
}
