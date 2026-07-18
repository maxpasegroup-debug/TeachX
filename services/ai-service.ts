import type { AIConversationScope, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { universalSearch } from "@/services/search-service";
import { runOpenAICompletion } from "@/services/openai-service";

const systemPrompts: Record<AIConversationScope, string> = {
  TEACHER: "You help Indian teachers prepare clear lessons, assignments, homework, exams and announcements. Use simple English.",
  STUDENT: "You help students understand lessons calmly. Explain step by step and recommend what to learn next.",
  ADMISSIONS: "You help admission teams summarize leads, prioritize follow-ups and understand conversion risk.",
  DIRECTOR: "You help institute directors understand daily operations, revenue, academics, staff and risk.",
  FINANCE: "You help accounts teams understand fee collection, outstanding dues and cash flow risk.",
  SEARCH: "You convert natural language into useful education platform search intent.",
  SYSTEM: "You are the AI assistant for an Education Operating System."
};

export async function getPromptTemplate(institutionId: string | null | undefined, key: string, scope: AIConversationScope) {
  const template = await prisma.promptTemplate.findFirst({ where: { key, scope, OR: [{ institutionId: institutionId ?? undefined }, { institutionId: null }], isActive: true }, orderBy: { institutionId: "desc" } });
  return template ?? { systemPrompt: systemPrompts[scope], userPrompt: "{{prompt}}", model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini" };
}

export async function buildAIContext(input: { institutionId?: string | null; userId?: string; scope: AIConversationScope; prompt: string }) {
  if (input.scope === "SEARCH" && input.institutionId) {
    const results = await universalSearch(input.institutionId, input.prompt);
    return { searchResults: results.slice(0, 10) };
  }

  return {
    institutionId: input.institutionId,
    userId: input.userId,
    scope: input.scope
  };
}

export async function runAI(input: { institutionId?: string | null; userId?: string; scope: AIConversationScope; feature: string; prompt: string; context?: Prisma.InputJsonValue }) {
  const template = await getPromptTemplate(input.institutionId, input.feature, input.scope);
  const context = input.context ?? await buildAIContext(input);
  const finalPrompt = `${template.userPrompt.replace("{{prompt}}", input.prompt)}\n\nContext:\n${JSON.stringify(context)}`;
  const result = await runOpenAICompletion({ system: template.systemPrompt, prompt: finalPrompt, model: template.model ?? undefined });

  const conversation = await prisma.aIConversation.create({
    data: {
      institutionId: input.institutionId ?? undefined,
      userId: input.userId,
      scope: input.scope,
      title: input.feature,
      model: result.model,
      context,
      messages: [
        { role: "user", content: input.prompt },
        { role: "assistant", content: result.text }
      ]
    }
  });

  await prisma.aIUsage.create({
    data: {
      institutionId: input.institutionId ?? undefined,
      userId: input.userId,
      conversationId: conversation.id,
      feature: input.feature,
      model: result.model,
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
      totalTokens: result.usage.totalTokens
    }
  });

  return { text: result.text, conversationId: conversation.id, usage: result.usage };
}

export async function globalAISearch(institutionId: string, prompt: string) {
  const results = await universalSearch(institutionId, prompt);
  return {
    answer: results.length ? `I found ${results.length} matching items.` : "No matching records found yet.",
    results
  };
}
