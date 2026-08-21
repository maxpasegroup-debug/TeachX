import type { AIConversationScope } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getUserPreferences } from "@/services/preference-service";
import { getAICreditSummary } from "@/services/commerce-service";
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
  if (!userId || !institutionId) {
    return {
      preferences: null,
      conversations: [],
      templates: [],
      credits: { current: 0, used: 0, allocation: 0, todayUsage: 0, monthlyUsage: 0, estimatedRemaining: 0 },
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, generationCount: 0, estimatedCost: 0 }
    };
  }

  const [preferences, conversations, usage, templates, credits] = await Promise.all([
    getUserPreferences(userId),
    prisma.aIConversation.findMany({
      where: { userId, institutionId, scope: "TEACHER" },
      orderBy: { updatedAt: "desc" },
      take: 8
    }),
    prisma.aIUsage.aggregate({
      where: { userId, institutionId, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      _sum: { totalTokens: true, promptTokens: true, completionTokens: true },
      _count: true
    }),
    prisma.promptTemplate.findMany({
      where: { scope: "TEACHER", isActive: true, OR: [{ institutionId }, { institutionId: null }] },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    getAICreditSummary({ userId, institutionId, audience: "TEACHER" })
  ]);

  const totalTokens = usage._sum.totalTokens ?? 0;
  return {
    preferences,
    conversations,
    templates,
    credits: {
      current: credits.balance,
      used: credits.used,
      allocation: credits.monthlyAllocation,
      todayUsage: totalTokens,
      monthlyUsage: totalTokens,
      estimatedRemaining: credits.remaining
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

export async function getAIHistory(userId?: string, institutionId?: string | null) {
  if (!userId || !institutionId) return [];
  return prisma.aIConversation.findMany({
    where: { userId, institutionId, scope: "TEACHER" as AIConversationScope },
    include: { usages: true },
    orderBy: { updatedAt: "desc" },
    take: 50
  });
}

export async function getPromptLibrary(institutionId?: string | null) {
  if (!institutionId) return [];
  return prisma.promptTemplate.findMany({
    where: { scope: "TEACHER", isActive: true, OR: [{ institutionId }, { institutionId: null }] },
    orderBy: [{ institutionId: "desc" }, { updatedAt: "desc" }],
    take: 50
  });
}
