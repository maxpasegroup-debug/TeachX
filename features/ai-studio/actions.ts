"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { runAI } from "@/services/ai-service";
import { getAIStudioTool } from "@/services/ai-studio-service";
import { prisma } from "@/lib/db";
import { getStudioToolConfig } from "@/features/ai-studio/tool-config";

export type AIStudioGenerationState = {
  text?: string;
  conversationId?: string;
  error?: string;
};

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function generateAIStudioContent(_: AIStudioGenerationState, formData: FormData): Promise<AIStudioGenerationState> {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in." };

  const tool = getAIStudioTool(value(formData, "tool"));
  const config = getStudioToolConfig(tool.slug);
  if (!config) return { error: "This Studio tool is not configured." };
  const details = config.fields.map((field) => {
    const entries = formData.getAll(field.name).map(String).map((entry) => entry.trim()).filter(Boolean);
    return `${field.label}: ${entries.join(", ") || "Not specified"}`;
  });
  const prompt = [
    `Create a complete ${tool.title}.`,
    ...details,
    "",
    "Required output:",
    ...config.outputInstructions.map((instruction) => `- ${instruction}`),
    "- Use clear teacher-ready markdown with no placeholders or unfinished sections.",
    "- Keep facts age-appropriate and do not invent personal or institutional information."
  ].join("\n");

  const result = await runAI({
    institutionId: session.user.institutionId,
    userId: session.user.id,
    scope: "TEACHER",
    feature: tool.slug,
    prompt,
    context: {
      tool: tool.title,
      toolSlug: tool.slug,
      fields: Object.fromEntries(config.fields.map((field) => [field.name, formData.getAll(field.name).map(String)]))
    }
  });

  revalidatePath("/teacher/ai-studio");
  return { text: result.text, conversationId: result.conversationId };
}

export async function saveAIConversationContentAction(formData: FormData) {
  const session = await auth();
  const id = value(formData, "conversationId");
  const text = value(formData, "content");
  if (!session?.user.id || !id || !text) return;
  const existing = await prisma.aIConversation.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return;
  const messages: unknown[] = Array.isArray(existing.messages) ? existing.messages : [];
  const currentAssistant = [...messages].reverse().find((message) => message && typeof message === "object" && (message as { role?: string }).role === "assistant") as { content?: string } | undefined;
  const existingContext = (existing.context && typeof existing.context === "object" && !Array.isArray(existing.context)) ? existing.context as Record<string, unknown> : {};
  const versions = Array.isArray(existingContext.versions) ? existingContext.versions : [];
  const nextMessages = messages.map((message: unknown, index: number) =>
    index === messages.length - 1 && message && typeof message === "object"
      ? { ...(message as Record<string, unknown>), content: text }
      : message
  );
  await prisma.aIConversation.update({
    where: { id },
    data: {
      messages: nextMessages as Prisma.InputJsonValue,
      context: {
        ...existingContext,
        versions: currentAssistant?.content ? [...versions, { version: Number(existingContext.version ?? 1), content: currentAssistant.content, savedAt: existing.updatedAt.toISOString() }] : versions,
        version: Number(existingContext.version ?? 1) + 1,
        savedAt: new Date().toISOString()
      }
    }
  });
  revalidatePath("/teacher/ai-studio");
  revalidatePath("/teacher/ai-studio/history");
}

export async function duplicateAIConversationAction(formData: FormData) {
  const session = await auth();
  const id = value(formData, "conversationId");
  if (!session?.user.id || !id) return;
  const source = await prisma.aIConversation.findFirst({ where: { id, userId: session.user.id } });
  if (!source) return;
  await prisma.aIConversation.create({
    data: {
      institutionId: source.institutionId,
      userId: session.user.id,
      scope: source.scope,
      title: `${source.title} (Copy)`,
      messages: source.messages as Prisma.InputJsonValue,
      context: {
        ...((source.context && typeof source.context === "object" && !Array.isArray(source.context)) ? source.context as Record<string, unknown> : {}),
        duplicatedFrom: source.id,
        version: 1
      },
      model: source.model
    }
  });
  revalidatePath("/teacher/ai-studio");
  revalidatePath("/teacher/ai-studio/history");
}

export async function renameAIConversationAction(formData: FormData) {
  const session = await auth();
  const id = value(formData, "conversationId");
  const title = value(formData, "title");
  if (!session?.user.id || !id || !title) return;

  await prisma.aIConversation.updateMany({ where: { id, userId: session.user.id }, data: { title } });
  revalidatePath("/teacher/ai-studio/history");
}

export async function deleteAIConversationAction(formData: FormData) {
  const session = await auth();
  const id = value(formData, "conversationId");
  if (!session?.user.id || !id) return;

  await prisma.aIConversation.deleteMany({ where: { id, userId: session.user.id } });
  revalidatePath("/teacher/ai-studio/history");
}

export async function favoriteAIItemAction(formData: FormData) {
  const session = await auth();
  const entityId = value(formData, "entityId");
  const title = value(formData, "title");
  const type = value(formData, "type") || "ai-generation";
  if (!session?.user.id || !entityId || !title) return;

  await prisma.favoriteItem.upsert({
    where: { userId_type_entityId: { userId: session.user.id, type, entityId } },
    update: { title, link: "/teacher/ai-studio/history" },
    create: { userId: session.user.id, type, entityId, title, link: "/teacher/ai-studio/history" }
  });
  revalidatePath("/teacher/ai-studio");
}

export async function unfavoriteAIItemAction(formData: FormData) {
  const session = await auth();
  const entityId = value(formData, "entityId");
  const type = value(formData, "type") || "ai-generation";
  if (!session?.user.id || !entityId) return;
  await prisma.favoriteItem.deleteMany({ where: { userId: session.user.id, entityId, type } });
  revalidatePath("/teacher/ai-studio");
  revalidatePath("/teacher/ai-studio/history");
}
