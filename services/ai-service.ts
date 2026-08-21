import { Prisma, type AIConversationScope } from "@prisma/client";

import { prisma } from "@/lib/db";
import { universalSearch } from "@/services/search-service";
import { runOpenAICompletion } from "@/services/openai-service";
import { getAICreditSummary } from "@/services/commerce-service";

const systemPrompts: Record<AIConversationScope, string> = {
  TEACHER: "You help teachers worldwide prepare clear lessons, assignments, homework, exams and communication. Follow the requested language and local teaching context.",
  STUDENT: "You help students understand lessons calmly. Explain step by step and recommend what to learn next.",
  ADMISSIONS: "You help admission teams summarize leads, prioritize follow-ups and understand conversion risk.",
  DIRECTOR: "You help institute directors understand daily operations, revenue, academics, staff and risk.",
  FINANCE: "You help accounts teams understand fee collection, outstanding dues and cash flow risk.",
  SEARCH: "You convert natural language into useful education platform search intent.",
  SYSTEM: "You are the AI assistant for an Education Operating System."
};

export async function getPromptTemplate(institutionId: string | null | undefined, key: string, scope: AIConversationScope) {
  const institutionScope = institutionId ? [{ institutionId }, { institutionId: null }] : [{ institutionId: null }];
  const template = await prisma.promptTemplate.findFirst({ where: { key, scope, OR: institutionScope, isActive: true }, orderBy: { institutionId: "desc" } });
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

export async function runAI(input: { institutionId?: string | null; userId?: string; scope: AIConversationScope; feature: string; prompt: string; context?: Prisma.InputJsonValue; conversationId?: string; title?: string; messagePrompt?: string }) {
  if (input.scope === "TEACHER") {
    if (!input.userId || !input.institutionId) {
      throw new Error("Complete workspace setup before using AI Studio.");
    }
    const credits = await getAICreditSummary({ userId: input.userId, institutionId: input.institutionId, audience: "TEACHER" });
    if (credits.balance <= 0) {
      throw new Error(credits.monthlyAllocation > 0 ? "Your AI credits are used. Upgrade or wait for the next reset." : "AI access is not active for this workspace. Choose a plan to continue.");
    }
  }
  const template = await getPromptTemplate(input.institutionId, input.feature, input.scope);
  const context = input.context ?? await buildAIContext(input);
  const existing = input.conversationId ? await prisma.aIConversation.findFirst({ where: { id: input.conversationId, userId: input.userId, institutionId: input.institutionId ?? null, scope: input.scope } }) : null;
  if (input.conversationId && !existing) throw new Error("AI_CONVERSATION_FORBIDDEN");
  const finalPrompt = `${template.userPrompt.replace("{{prompt}}", input.prompt)}\n\nContext:\n${JSON.stringify(context)}`;
  const result = await runOpenAICompletion({ system: template.systemPrompt, prompt: finalPrompt, model: template.model ?? undefined });

  const conversation = await prisma.$transaction(async (tx) => {
    const current = existing ? await tx.aIConversation.findUniqueOrThrow({ where: { id: existing.id } }) : null;
    const previousMessages = current && Array.isArray(current.messages) ? current.messages : [];
    const nextMessages = [...previousMessages, { role: "user", content: input.messagePrompt ?? input.prompt }, { role: "assistant", content: result.text }] as Prisma.InputJsonValue;
    const saved = current ? await tx.aIConversation.update({ where: { id: current.id }, data: { messages: nextMessages, context, model: result.model } }) : await tx.aIConversation.create({ data: {
        institutionId: input.institutionId ?? undefined,
        userId: input.userId,
        scope: input.scope,
        title: input.title?.slice(0, 120) || input.feature,
        model: result.model,
        context,
        messages: nextMessages
      } });
    await tx.aIUsage.create({ data: { institutionId: input.institutionId ?? undefined, userId: input.userId, conversationId: saved.id, feature: input.feature, model: result.model, promptTokens: result.usage.promptTokens, completionTokens: result.usage.completionTokens, totalTokens: result.usage.totalTokens } });
    return saved;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  return { text: result.text, conversationId: conversation.id, usage: result.usage };
}

export async function globalAISearch(institutionId: string, prompt: string) {
  const results = await universalSearch(institutionId, prompt);
  return {
    answer: results.length ? `I found ${results.length} matching items.` : "No matching records found yet.",
    results
  };
}
