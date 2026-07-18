"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { runAI } from "@/services/ai-service";

export type StudentAIState = {
  text?: string;
  conversationId?: string;
  error?: string;
};

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function askStudentTutorAction(_: StudentAIState, formData: FormData): Promise<StudentAIState> {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in." };

  const prompt = value(formData, "prompt");
  if (!prompt) return { error: "Ask a learning question." };

  const mode = value(formData, "mode") || "Explain";
  const language = value(formData, "language") || "English";
  const level = value(formData, "level") || "Simple";

  const result = await runAI({
    institutionId: session.user.institutionId,
    userId: session.user.id,
    scope: "STUDENT",
    feature: `student_${mode.toLowerCase().replaceAll(" ", "_")}`,
    prompt: [
      `Learning mode: ${mode}`,
      `Preferred language: ${language}`,
      `Difficulty/level: ${level}`,
      `Student question: ${prompt}`,
      "Respond like a supportive learning coach. Do not solve harmful or unrelated requests. Use examples and steps where useful."
    ].join("\n"),
    context: { mode, language, level, product: "TeachX Student AI Tutor" }
  });

  revalidatePath("/student");
  revalidatePath("/student/ask-ai");
  return { text: result.text, conversationId: result.conversationId };
}

export async function favoriteStudentAIAction(formData: FormData) {
  const session = await auth();
  const entityId = value(formData, "entityId");
  const title = value(formData, "title") || "Saved AI answer";
  if (!session?.user.id || !entityId) return;

  await prisma.favoriteItem.upsert({
    where: { userId_type_entityId: { userId: session.user.id, type: "student-ai-bookmark", entityId } },
    update: { title, link: "/student/bookmarks" },
    create: { userId: session.user.id, type: "student-ai-bookmark", entityId, title, link: "/student/bookmarks" }
  });
  revalidatePath("/student/bookmarks");
}
