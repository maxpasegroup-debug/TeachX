"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { askTara } from "@/services/tara-service";

export async function askTaraAction(formData: FormData) {
  const session = await auth(); const prompt = String(formData.get("prompt") ?? "").trim();
  if (!session?.user.id || !prompt) return { error: "Write a question for TARA." };
  try { return { result: await askTara({ userId: session.user.id, institutionId: session.user.institutionId, roles: session.user.roles, prompt }) }; } catch { return { error: "TARA could not reach the shared AI service. Please retry." }; }
}

export async function saveTaraSettingsAction(formData: FormData) {
  const session = await auth(); if (!session?.user.id) return;
  const value = { personality: String(formData.get("personality") ?? "calm"), language: String(formData.get("language") ?? "English"), memory: String(formData.get("memory") ?? "metadata"), notifications: String(formData.get("notifications") ?? "priority") };
  await prisma.userPreference.upsert({ where: { userId_key: { userId: session.user.id, key: "tara.settings" } }, create: { userId: session.user.id, key: "tara.settings", value }, update: { value } });
  revalidatePath("/tara");
}
