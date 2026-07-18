"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { runAI } from "@/services/ai-service";
import { getAIStudioTool } from "@/services/ai-studio-service";
import { prisma } from "@/lib/db";

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
  const prompt = [
    `Create: ${tool.title}`,
    `Class: ${value(formData, "className")}`,
    `Subject: ${value(formData, "subject")}`,
    `Board: ${value(formData, "board")}`,
    `Language: ${value(formData, "language")}`,
    `Chapter: ${value(formData, "chapter")}`,
    `Topic: ${value(formData, "topic")}`,
    `Difficulty: ${value(formData, "difficulty")}`,
    `Learning Objective: ${value(formData, "learningObjective")}`,
    `Duration: ${value(formData, "duration")}`,
    `Output Format: ${value(formData, "outputFormat")}`,
    "Use a clean teacher-ready structure. Avoid unsafe or irrelevant content. Ask for clarification only if absolutely necessary."
  ].join("\n");

  const result = await runAI({
    institutionId: session.user.institutionId,
    userId: session.user.id,
    scope: "TEACHER",
    feature: tool.slug,
    prompt,
    context: {
      tool: tool.title,
      className: value(formData, "className"),
      subject: value(formData, "subject"),
      outputFormat: value(formData, "outputFormat")
    }
  });

  revalidatePath("/teacher/ai-studio");
  return { text: result.text, conversationId: result.conversationId };
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
