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

const scopeFor = (persona: TaraPersona): "STUDENT" | "DIRECTOR" | "TEACHER" => persona === "Student tutor" ? "STUDENT" : persona === "Director advisor" ? "DIRECTOR" : "TEACHER";
const teacherRoles = ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"];

async function validateTaraScope(input: { userId: string; institutionId?: string | null; roles: RoleKey[] }, persona: TaraPersona) {
  if (persona !== "Teacher guide") return;
  if (!input.institutionId) throw new Error("TEACHER_WORKSPACE_REQUIRED");
  const active = await prisma.user.count({ where: { id: input.userId, institutionId: input.institutionId, status: "ACTIVE", roles: { some: { role: { key: { in: teacherRoles } } } } } });
  if (active !== 1) throw new Error("TEACHER_WORKSPACE_REQUIRED");
}

export async function getTaraData(input: { userId: string; institutionId?: string | null; roles: RoleKey[] }) {
  const persona = resolveTaraPersona(input.roles);
  await validateTaraScope(input, persona);
  const where = { userId: input.userId, institutionId: input.institutionId ?? null };
  const notificationWhere = input.institutionId
    ? { OR: [{ userId: input.userId, institutionId: input.institutionId }, { userId: null, institutionId: input.institutionId }] }
    : { userId: input.userId, institutionId: null };
  const templateWhere = input.institutionId
    ? { isActive: true, scope: scopeFor(persona), OR: [{ institutionId: input.institutionId }, { institutionId: null }] }
    : { isActive: true, scope: scopeFor(persona), institutionId: null };
  const [conversations, usage, preferences, notifications, templates] = await Promise.all([
    prisma.aIConversation.findMany({ where: { ...where, scope: scopeFor(persona) }, select: { id: true, title: true, scope: true, model: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 12 }),
    prisma.aIUsage.findMany({ where, select: { id: true, feature: true, model: true, totalTokens: true, costEstimate: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 120 }),
    prisma.userPreference.findMany({ where: { userId: input.userId, key: { startsWith: "tara." } }, orderBy: { updatedAt: "desc" } }),
    prisma.notification.findMany({ where: notificationWhere, select: { id: true, title: true, body: true, status: true, link: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.promptTemplate.findMany({ where: templateWhere, select: { id: true, key: true, name: true, scope: true, model: true }, orderBy: { updatedAt: "desc" }, take: 8 })
  ]);
  const tokens = usage.reduce((total, item) => total + item.totalTokens, 0);
  const cost = usage.reduce((total, item) => total + Number(item.costEstimate), 0);
  const setting = preferences.find((item) => item.key === "tara.settings")?.value as { personality?: string; language?: string; memory?: string; notifications?: string } | undefined;
  return { persona, scope: scopeFor(persona), conversations, usage, preferences, notifications, templates, setting, analytics: { requests: usage.length, tokens, cost, successRate: usage.length ? 100 : 0 }, handoffs: [
    { title: "Open your product workspace", detail: "Continue in the workflow where the underlying record and permissions live.", href: persona === "Student tutor" ? "/student/ai" : persona === "Director advisor" ? "/director/ai" : "/teacher/ai-studio/chat" },
    { title: "Review notifications", detail: "TARA can identify attention items; notifications remain governed by existing notification workflows.", href: persona === "Teacher guide" ? "/teacher/workspace/notifications" : "/cloud" },
    { title: "Search institution knowledge", detail: "Use authorized search results and continue in the source workspace.", href: persona === "Teacher guide" ? "/teacher/workspace/search" : "/cloud" }
  ] };
}

export async function askTara(input: { userId: string; institutionId?: string | null; roles: RoleKey[]; prompt: string }) {
  const persona = resolveTaraPersona(input.roles);
  await validateTaraScope(input, persona);
  const institutionId = input.institutionId ?? null;
  const [memory, teacherProfile, resources, planning, preferences] = await Promise.all([
    prisma.aIConversation.findMany({ where: { userId: input.userId, institutionId, scope: scopeFor(persona) }, select: { title: true, scope: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 5 }),
    persona === "Teacher guide" ? prisma.teacherProfile.findFirst({ where: { userId: input.userId, user: { institutionId: input.institutionId! } }, select: { subjects: true, classes: true, languages: true, teachingMode: true } }) : null,
    persona === "Teacher guide" ? prisma.contentItem.findMany({ where: { createdById: input.userId, institutionId: input.institutionId! }, select: { title: true, type: true, status: true }, orderBy: { updatedAt: "desc" }, take: 8 }) : [],
    persona === "Teacher guide" ? prisma.activity.findMany({ where: { actorId: input.userId, institutionId: input.institutionId!, entity: { in: ["TeacherPlanner", "TeacherTask"] } }, select: { title: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 8 }) : [],
    prisma.userPreference.findMany({ where: { userId: input.userId, key: { in: ["tara.settings", "teacher.settings.teaching", "teacher.settings.ai"] } }, select: { key: true, value: true }, take: 3 })
  ]);
  const request = input.prompt.toLowerCase();
  const contextualRole = /sell|earn|price|business|market/.test(request) ? "Business Partner" : /learn|course|webinar|book|skill/.test(request) ? "Learning Coach" : /resource|write|create|publish/.test(request) ? "AI Co-author" : /lesson|class|student|teach|assessment/.test(request) ? "AI Co-teacher" : /travel|wellness|family|leisure|enjoy/.test(request) ? "Future Life Buddy" : "AI Co-worker";
  return runAI({ institutionId: input.institutionId, userId: input.userId, scope: scopeFor(persona), feature: "tara-unified-companion", prompt: `You are TARA, one unified TeachX intelligence layer acting contextually as the teacher's ${contextualRole}. Respond with concise, practical advice. Never claim to execute an action. Offer only governed handoffs to existing TeachX workflows. User request: ${input.prompt}`, context: { persona, contextualRole, teacherProfile, resources, planning, preferences, memory: memory.map((item) => ({ title: item.title, scope: item.scope, updatedAt: item.updatedAt.toISOString() })) } as Prisma.InputJsonValue });
}
