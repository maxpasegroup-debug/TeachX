"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { runAI } from "@/services/ai-service";
import { getAIStudioTool } from "@/services/ai-studio-service";
import { saveAIContentToTeacherLibrary } from "@/services/teacher-integration-service";
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
  if (!session?.user?.institutionId) return { error: "Complete workspace setup before using AI Studio." };

  const tool = getAIStudioTool(value(formData, "tool"));
  const config = getStudioToolConfig(tool.slug);
  if (!config) return { error: "This Studio tool is not configured." };
  const details = config.fields.map((field) => {
    const entries = formData.getAll(field.name).map(String).map((entry) => entry.trim()).filter(Boolean);
    return `${field.label}: ${entries.join(", ") || "Not specified"}`;
  });
  const classroomPreset = [
    `Output language: ${value(formData, "outputLanguage") || "English"}`,
    `Curriculum / board: ${value(formData, "curriculumBoard") || "Teacher's local curriculum"}`,
    `Sharing format: ${value(formData, "sharingFormat") || "Printable classroom handout"}`
  ];
  const prompt = [
    `Create a complete ${tool.title}.`,
    ...classroomPreset,
    ...details,
    "",
    "Required output:",
    ...config.outputInstructions.map((instruction) => `- ${instruction}`),
    "- Use clear teacher-ready markdown with no placeholders or unfinished sections.",
    "- Keep facts age-appropriate and do not invent personal or institutional information."
  ].join("\n");

  let result: Awaited<ReturnType<typeof runAI>>;
  try {
    result = await runAI({
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
  } catch (error) {
    return { error: error instanceof Error ? error.message : "We could not create that AI content. Please try again." };
  }

  revalidatePath("/teacher/ai-studio");
  return { text: result.text, conversationId: result.conversationId };
}

export async function generateTeacherAIChat(_: AIStudioGenerationState, formData: FormData): Promise<AIStudioGenerationState> {
  const session = await auth();
  if (!session?.user?.institutionId) return { error: "Complete workspace setup before using AI Studio." };

  const question = value(formData, "question");
  if (!question) return { error: "Write a question or teaching task first." };
  if (question.length > 6000) return { error: "Keep your request under 6,000 characters." };

  try {
    const result = await runAI({
      institutionId: session.user.institutionId,
      userId: session.user.id,
      scope: "TEACHER",
      feature: "teacher-ai-chat",
      prompt: [
        "You are TeachX AI, a practical co-worker for a teacher.",
        "Give a clear, age-appropriate, classroom-ready response. Do not invent student, institution, or personal data.",
        "Teacher request:",
        question
      ].join("\n\n"),
      context: { entryPoint: "teacher-ai-chat", question }
    });
    revalidatePath("/teacher/ai-studio");
    revalidatePath("/teacher/ai-studio/chat");
    revalidatePath("/teacher/ai-studio/history");
    return { text: result.text, conversationId: result.conversationId };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "We could not answer that request. Please try again." };
  }
}

export async function improveAIStudioContentAction(formData: FormData): Promise<AIStudioGenerationState> {
  const session = await auth();
  if (!session?.user?.institutionId) return { error: "Complete workspace setup before using AI Studio." };

  const id = value(formData, "conversationId");
  const content = value(formData, "content");
  const mode = value(formData, "mode") || "improve";
  if (!id || !content) return { error: "Generate content before improving it." };

  const conversation = await prisma.aIConversation.findFirst({ where: { id, userId: session.user.id, institutionId: session.user.institutionId, scope: "TEACHER" } });
  if (!conversation) return { error: "AI generation was not found." };

  const modeInstruction: Record<string, string> = {
    simplify: "Simplify this for a rural or first-time teacher. Use shorter sentences, clearer sections, and practical classroom steps.",
    language: `Translate or adapt this into ${value(formData, "outputLanguage") || "the requested language"} while preserving structure and teacher intent.`,
    share: "Make this easy to share with students or parents on WhatsApp. Keep it concise, structured, and ready to copy.",
    improve: "Improve clarity, formatting, classroom usability, and completeness without adding unsupported personal facts."
  };

  let result: Awaited<ReturnType<typeof runAI>>;
  try {
    result = await runAI({
      institutionId: session.user.institutionId,
      userId: session.user.id,
      scope: "TEACHER",
      feature: `improve-${mode}`,
      prompt: [
        modeInstruction[mode] ?? modeInstruction.improve,
        "",
        "Original teacher material:",
        content
      ].join("\n"),
      context: {
        sourceConversationId: id,
        improvementMode: mode
      }
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "We could not improve that content. Please try again." };
  }

  revalidatePath("/teacher/ai-studio");
  revalidatePath("/teacher/ai-studio/history");
  return { text: result.text, conversationId: result.conversationId };
}

export async function saveAIOutputToTeacherLibraryAction(formData: FormData) {
  const session = await auth();
  const id = value(formData, "conversationId");
  const content = value(formData, "content");
  const courseId = value(formData, "courseId");
  const saveKind = value(formData, "saveKind") || "resource";
  if (!session?.user.id || !session.user.institutionId || !id || !content || !courseId) return;

  const result = await saveAIContentToTeacherLibrary({
    userId: session.user.id,
    institutionId: session.user.institutionId,
    conversationId: id,
    courseId,
    title: value(formData, "title"),
    content,
    saveKind: saveKind === "lesson" ? "lesson" : "resource",
    metadata: {
      outputLanguage: value(formData, "outputLanguage") || "English",
      curriculumBoard: value(formData, "curriculumBoard") || "Teacher's local curriculum"
    }
  });

  revalidatePath("/teacher");
  revalidatePath("/teacher/workspace/lessons");
  revalidatePath("/teacher/workspace/resources");
  revalidatePath("/teacher/resources");
  return result;
}

export async function saveAIConversationContentAction(formData: FormData) {
  const session = await auth();
  const id = value(formData, "conversationId");
  const text = value(formData, "content");
  if (!session?.user.id || !id || !text) return;
  if (!session.user.institutionId) return;
  const existing = await prisma.aIConversation.findFirst({ where: { id, userId: session.user.id, institutionId: session.user.institutionId, scope: "TEACHER" } });
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
  if (!session?.user.id || !session.user.institutionId || !id) return;
  const source = await prisma.aIConversation.findFirst({ where: { id, userId: session.user.id, institutionId: session.user.institutionId, scope: "TEACHER" } });
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
  if (!session?.user.id || !session.user.institutionId || !id || !title) return;

  await prisma.aIConversation.updateMany({ where: { id, userId: session.user.id, institutionId: session.user.institutionId, scope: "TEACHER" }, data: { title } });
  revalidatePath("/teacher/ai-studio/history");
}

export async function deleteAIConversationAction(formData: FormData) {
  const session = await auth();
  const id = value(formData, "conversationId");
  if (!session?.user.id || !session.user.institutionId || !id) return;

  await prisma.aIConversation.deleteMany({ where: { id, userId: session.user.id, institutionId: session.user.institutionId, scope: "TEACHER" } });
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
