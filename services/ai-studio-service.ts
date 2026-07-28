import type { AIConversationScope } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getUserPreferences } from "@/services/preference-service";
import { studioToolConfigs } from "@/features/ai-studio/tool-config";

export type AIStudioTool = {
  slug: string;
  title: string;
  category: string;
  description: string;
};

export const aiStudioTools: AIStudioTool[] = studioToolConfigs.map(({ slug, title, category, description }) => ({ slug, title, category, description }));

export function getAIStudioTool(slug: string) {
  return aiStudioTools.find((tool) => tool.slug === slug) ?? aiStudioTools[0];
}

export async function getAIStudioHome(userId?: string, institutionId?: string | null) {
  const [preferences, conversations, usage, templates] = await Promise.all([
    getUserPreferences(userId),
    prisma.aIConversation.findMany({
      where: { userId, scope: "TEACHER" },
      orderBy: { updatedAt: "desc" },
      take: 8
    }),
    prisma.aIUsage.aggregate({
      where: { userId, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      _sum: { totalTokens: true, promptTokens: true, completionTokens: true },
      _count: true
    }),
    prisma.promptTemplate.findMany({
      where: { scope: "TEACHER", isActive: true, OR: [{ institutionId: institutionId ?? undefined }, { institutionId: null }] },
      orderBy: { createdAt: "desc" },
      take: 8
    })
  ]);

  const totalTokens = usage._sum.totalTokens ?? 0;
  return {
    preferences,
    conversations,
    templates,
    credits: {
      current: 1000,
      todayUsage: totalTokens,
      monthlyUsage: totalTokens,
      estimatedRemaining: Math.max(0, 1000 - Math.ceil(totalTokens / 100))
    },
    usage: {
      promptTokens: usage._sum.promptTokens ?? 0,
      completionTokens: usage._sum.completionTokens ?? 0,
      totalTokens,
      generationCount: usage._count,
      estimatedCost: Number(((totalTokens / 1000) * 0.002).toFixed(4))
    }
  };
}

export async function getAIHistory(userId?: string) {
  if (!userId) return [];
  return prisma.aIConversation.findMany({
    where: { userId, scope: "TEACHER" as AIConversationScope },
    include: { usages: true },
    orderBy: { updatedAt: "desc" },
    take: 50
  });
}

export async function getPromptLibrary(institutionId?: string | null) {
  return prisma.promptTemplate.findMany({
    where: { scope: "TEACHER", isActive: true, OR: [{ institutionId: institutionId ?? undefined }, { institutionId: null }] },
    orderBy: [{ institutionId: "desc" }, { updatedAt: "desc" }],
    take: 50
  });
}
