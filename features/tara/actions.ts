"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { askTara } from "@/services/tara-service";

export async function askTaraAction(formData: FormData) {
  const session = await auth();
  const prompt = String(formData.get("prompt") ?? "").trim();
  if (!session?.user.id) return { error: "Sign in again to continue with TARA.", code: "AUTH_REQUIRED", recoveryHref: "/login" };
  if (!prompt || prompt.length > 6000) return { error: prompt ? "Keep your request under 6,000 characters." : "Write a question or task for TARA.", code: "INVALID_REQUEST" };
  try {
    return { result: await askTara({ userId: session.user.id, institutionId: session.user.institutionId, roles: session.user.roles, prompt, conversationId: String(formData.get("conversationId") ?? "") || undefined, location: String(formData.get("location") ?? "tara") }) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/credits are used|AI access is not active/.test(message)) return { error: message, code: "AI_ENTITLEMENT", recoveryHref: "/teacher/business/subscription" };
    if (/WORKSPACE_REQUIRED|CONVERSATION_FORBIDDEN|AI_CONVERSATION_FORBIDDEN/.test(message)) return { error: "TARA cannot use that workspace or conversation. Return to your current TeachX workspace and try again.", code: "PERMISSION_DENIED", recoveryHref: "/teacher" };
    if (/REQUEST_INVALID/.test(message)) return { error: "That request is not valid. Shorten it and try again.", code: "INVALID_REQUEST" };
    return { error: "TARA is temporarily unavailable. Your work was not changed. Please retry.", code: "AI_UNAVAILABLE" };
  }
}

export async function saveTaraSettingsAction(formData: FormData) {
  const session = await auth(); if (!session?.user.id) return;
  const choice = (key: string, allowed: string[], fallback: string) => { const candidate = String(formData.get(key) ?? fallback); return allowed.includes(candidate) ? candidate : fallback; };
  const value = { personality: choice("personality", ["calm", "supportive", "executive"], "calm"), language: choice("language", ["English", "Hindi", "Marathi", "Tamil"], "English"), memory: choice("memory", ["metadata", "minimal", "off"], "metadata"), notifications: choice("notifications", ["priority", "all", "off"], "priority") };
  await prisma.userPreference.upsert({ where: { userId_key: { userId: session.user.id, key: "tara.settings" } }, create: { userId: session.user.id, key: "tara.settings", value }, update: { value } });
  revalidatePath("/tara");
}
