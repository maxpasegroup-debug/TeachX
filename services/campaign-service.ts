import { prisma } from "@/lib/db";

export async function getCampaignSetup(institutionId?: string | null) {
  if (!institutionId) return { sources: [], campaigns: [] };

  const [sources, campaigns] = await Promise.all([
    prisma.campaignSource.findMany({ where: { institutionId }, orderBy: { name: "asc" } }),
    prisma.campaign.findMany({ where: { institutionId }, include: { source: true }, orderBy: { createdAt: "desc" } })
  ]);

  return { sources, campaigns };
}
