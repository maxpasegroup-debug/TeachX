import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { runAI } from "@/services/ai-service";
import type { RoleKey } from "@/lib/constants/roles";

export type TaraPersona = "Teacher guide" | "Student tutor" | "Director advisor" | "Platform director" | "Campus assistant" | "Parent companion";

export function resolveTaraPersona(roles: RoleKey[]): TaraPersona {
  if (roles.includes("STUDENT")) return "Student tutor";
  if (roles.includes("PARENT")) return "Parent companion";
  if (roles.includes("DIRECTOR")) return "Director advisor";
  if (roles.includes("ADMIN")) return "Platform director";
  if (roles.includes("RECEPTION")) return "Campus assistant";
  return "Teacher guide";
}

const scopeFor = (persona: TaraPersona) => persona === "Student tutor" ? "STUDENT" : persona === "Director advisor" ? "DIRECTOR" : "TEACHER" as const;

export async function getTaraData(input: { userId: string; institutionId?: string | null; roles: RoleKey[] }) {
  const persona = resolveTaraPersona(input.roles);
  const where = { userId: input.userId, institutionId: input.institutionId ?? undefined };
  const [conversations, usage, preferences, notifications, templates] = await Promise.all([
    prisma.aIConversation.findMany({ where: { userId: input.userId }, select: { id: true, title: true, scope: true, model: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 12 }),
    prisma.aIUsage.findMany({ where, select: { id: true, feature: true, model: true, totalTokens: true, costEstimate: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 120 }),
    prisma.userPreference.findMany({ where: { userId: input.userId, key: { startsWith: "tara." } }, orderBy: { updatedAt: "desc" } }),
    prisma.notification.findMany({ where: { OR: [{ userId: input.userId }, { userId: null, institutionId: input.institutionId ?? undefined }] }, select: { id: true, title: true, body: true, status: true, link: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.promptTemplate.findMany({ where: { isActive: true, OR: [{ institutionId: input.institutionId ?? undefined }, { institutionId: null }] }, select: { id: true, key: true, name: true, scope: true, model: true }, orderBy: { updatedAt: "desc" }, take: 8 })
  ]);
  const tokens = usage.reduce((total, item) => total + item.totalTokens, 0);
  const cost = usage.reduce((total, item) => total + Number(item.costEstimate), 0);
  const setting = preferences.find((item) => item.key === "tara.settings")?.value as { personality?: string; language?: string; memory?: string; notifications?: string } | undefined;
  return { persona, scope: scopeFor(persona), conversations, usage, preferences, notifications, templates, setting, analytics: { requests: usage.length, tokens, cost, successRate: usage.length ? 100 : 0 }, handoffs: [
    { title: "Open your product workspace", detail: "Continue in the workflow where the underlying record and permissions live.", href: persona === "Student tutor" ? "/student/ai" : persona === "Director advisor" ? "/director/ai" : "/teacher/ai-studio/chat" },
    { title: "Review notifications", detail: "TARA can identify attention items; notifications remain governed by existing notification workflows.", href: "/cloud" },
    { title: "Search institution knowledge", detail: "Use existing search results and approve the next step in its source workspace.", href: "/cloud" }
  ] };
}

export async function askTara(input: { userId: string; institutionId?: string | null; roles: RoleKey[]; prompt: string }) {
  const persona = resolveTaraPersona(input.roles);
  const memory = await prisma.aIConversation.findMany({ where: { userId: input.userId }, select: { title: true, scope: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 5 });
  return runAI({ institutionId: input.institutionId, userId: input.userId, scope: scopeFor(persona), feature: "tara-unified-companion", prompt: `You are TARA, the ${persona} for EduX. Respond with concise, practical advice. You do not execute actions; offer governed handoffs to the correct product workflow. User request: ${input.prompt}`, context: { persona, memory: memory.map((item) => ({ title: item.title, scope: item.scope, updatedAt: item.updatedAt.toISOString() })) } as Prisma.InputJsonValue });
}
