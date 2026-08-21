import { Prisma } from "@prisma/client";

import type { RoleKey } from "@/lib/constants/roles";
import { prisma } from "@/lib/db";
import { runAI } from "@/services/ai-service";
import { canReadAllClassrooms } from "@/services/classroom-service";
import { getAICreditSummary, getActiveSubscription } from "@/services/commerce-service";

export type TaraPersona = "Teacher guide" | "Student tutor" | "Director advisor" | "Platform director" | "Campus assistant" | "Parent companion";
export type TaraContextRole = "AI Co-worker" | "AI Co-teacher" | "AI Co-author" | "Business Partner" | "Learning Coach" | "Future Life/Travel Buddy";
export type TaraResultKind = "lesson" | "worksheet" | "quiz" | "presentation" | "question-paper" | "parent-message" | "planner" | "profile" | "publishing" | "one-to-one" | "happy-notes" | "learning" | "enjoy" | "general";

const teacherRoles = ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"];
const allowedLocations = new Set(["tara", "home", "teaching", "creation", "planner", "resources", "community", "business", "learn-more", "enjoy-more"]);

export function resolveTaraPersona(roles: RoleKey[]): TaraPersona {
  if (roles.includes("STUDENT")) return "Student tutor";
  if (roles.includes("PARENT")) return "Parent companion";
  if (roles.includes("DIRECTOR")) return "Director advisor";
  if (roles.includes("ADMIN")) return "Platform director";
  if (roles.includes("RECEPTION")) return "Campus assistant";
  return "Teacher guide";
}

const scopeFor = (persona: TaraPersona): "STUDENT" | "DIRECTOR" | "TEACHER" => persona === "Student tutor" ? "STUDENT" : persona === "Director advisor" ? "DIRECTOR" : "TEACHER";

async function validateTaraScope(input: { userId: string; institutionId?: string | null; roles: RoleKey[] }, persona: TaraPersona) {
  if (persona !== "Teacher guide") return;
  if (!input.institutionId) throw new Error("TEACHER_WORKSPACE_REQUIRED");
  const active = await prisma.user.count({ where: { id: input.userId, institutionId: input.institutionId, status: "ACTIVE", roles: { some: { role: { key: { in: teacherRoles } } } } } });
  if (active !== 1) throw new Error("TEACHER_WORKSPACE_REQUIRED");
}

function record(value: unknown) { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function conversationMessages(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is { role: string; content: string } => Boolean(item) && typeof item === "object" && typeof (item as { role?: unknown }).role === "string" && typeof (item as { content?: unknown }).content === "string").slice(-8) : [];
}

export function resolveTaraIntent(prompt: string, location = "tara"): { kind: TaraResultKind; role: TaraContextRole; title: string; actions: Array<{ label: string; href: string }> } {
  const request = prompt.toLowerCase();
  if (/worksheet/.test(request)) return { kind: "worksheet", role: "AI Co-author", title: "Worksheet draft", actions: [{ label: "Open Worksheet Generator", href: "/teacher/ai-studio/create/worksheet-generator" }, { label: "Open Resources", href: "/teacher/resources" }] };
  if (/quiz/.test(request)) return { kind: "quiz", role: "AI Co-author", title: "Quiz plan", actions: [{ label: "Open Quiz Generator", href: "/teacher/ai-studio/create/quiz-generator" }, { label: "Open Teaching", href: "/teacher/workspace/classrooms" }] };
  if (/presentation|ppt|slides/.test(request)) return { kind: "presentation", role: "AI Co-author", title: "Presentation plan", actions: [{ label: "Open Presentation Generator", href: "/teacher/ai-studio/create/presentation-generator" }, { label: "Open Resources", href: "/teacher/resources" }] };
  if (/question paper|exam paper/.test(request)) return { kind: "question-paper", role: "AI Co-author", title: "Question paper plan", actions: [{ label: "Open Question Paper Builder", href: "/teacher/ai-studio/create/question-paper-builder" }] };
  if (/parent|guardian|family message/.test(request)) return { kind: "parent-message", role: "AI Co-teacher", title: "Parent communication draft", actions: [{ label: "Open Parent Communication", href: "/teacher/ai-studio/create/parent-communication" }] };
  if (/lesson|teach|classroom/.test(request)) return { kind: "lesson", role: "AI Co-teacher", title: "Lesson support", actions: [{ label: "Open Lesson Generator", href: "/teacher/ai-studio/create/lesson-generator" }, { label: "Open Lessons", href: "/teacher/workspace/lessons" }, { label: "Schedule in Planner", href: "/teacher/workspace/planner" }] };
  if (/plan my day|organize.*week|schedule|task|planner/.test(request)) return { kind: "planner", role: "AI Co-worker", title: "Planning support", actions: [{ label: "Open Planner", href: "/teacher/workspace/planner" }] };
  if (/happy notes|publish knowledge/.test(request)) return { kind: "happy-notes", role: "Business Partner", title: "Knowledge publishing support", actions: [{ label: "Open Happy Notes", href: "/teacher/business/happy-notes" }] };
  if (/1:1|one.to.one|tutoring profile/.test(request)) return { kind: "one-to-one", role: "Business Partner", title: "1:1 profile support", actions: [{ label: "Open 1:1 Teaching", href: "/teacher/business/one-to-one" }] };
  if (/bio|profile|portfolio/.test(request)) return { kind: "profile", role: "Business Partner", title: "Professional profile support", actions: [{ label: "Open Profile", href: "/teacher/business/profile" }, { label: "Open Portfolio", href: "/teacher/business/portfolio" }] };
  if (/sell|earn|price|marketplace|publish resource|product description/.test(request)) return { kind: "publishing", role: "Business Partner", title: "Publishing support", actions: [{ label: "Open Publishing", href: "/teacher/business/publishing" }, { label: "View Earnings", href: "/teacher/business/earnings" }] };
  if (/learn|course|webinar|book|audiobook|skill/.test(request)) return { kind: "learning", role: "Learning Coach", title: "Learning plan", actions: [{ label: "Explore Learn More", href: "/teacher/life/learn-more" }] };
  if (/travel|wellness|family experience|leisure|enjoy/.test(request)) return { kind: "enjoy", role: "Future Life/Travel Buddy", title: "Enjoy More", actions: [{ label: "View Coming Soon", href: "/teacher/life/enjoy-more" }] };
  const role: TaraContextRole = location === "business" ? "Business Partner" : location === "learn-more" ? "Learning Coach" : location === "enjoy-more" ? "Future Life/Travel Buddy" : location === "teaching" ? "AI Co-teacher" : location === "creation" || location === "resources" ? "AI Co-author" : "AI Co-worker";
  return { kind: "general", role, title: "TARA response", actions: [] };
}

async function teacherContext(input: { userId: string; institutionId: string; roles: RoleKey[] }) {
  const now = new Date();
  const end = new Date(now); end.setDate(end.getDate() + 14);
  const [teacher, classrooms, planner, resources, businessOrders, learningCount, subscription, credits] = await Promise.all([
    prisma.user.findFirst({ where: { id: input.userId, institutionId: input.institutionId, status: "ACTIVE" }, select: { name: true, profile: { select: { title: true } }, teacherProfile: { select: { headline: true, subjects: true, classes: true, languages: true, teachingMode: true, isMarketplaceListed: true, onboardingStep: true } } } }),
    prisma.classroom.findMany({ where: { institutionId: input.institutionId, ...(canReadAllClassrooms(input.roles) ? {} : { batch: { faculty: { some: { facultyId: input.userId } } } }) }, select: { id: true, title: true, course: { select: { name: true, subjects: { select: { name: true } } } }, batch: { select: { _count: { select: { students: true } } } } }, orderBy: { updatedAt: "desc" }, take: 8 }),
    prisma.plannerEvent.findMany({ where: { institutionId: input.institutionId, startsAt: { gte: now, lt: end }, OR: [{ createdById: input.userId }, { createdById: null }] }, select: { id: true, title: true, type: true, startsAt: true }, orderBy: { startsAt: "asc" }, take: 12 }),
    prisma.contentItem.findMany({ where: { institutionId: input.institutionId, createdById: input.userId }, select: { id: true, title: true, type: true, status: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 8 }),
    prisma.commerceOrderItem.count({ where: { sellerId: input.userId, order: { institutionId: input.institutionId, status: { in: ["PAID", "FULFILLED"] } } } }),
    prisma.contentItem.count({ where: { institutionId: input.institutionId, status: "PUBLISHED", visibility: { in: ["PUBLIC", "TEACHERS"] }, aiReadyNotes: { path: ["teacherLearningType"], not: Prisma.JsonNull } } }),
    getActiveSubscription(input.userId, input.institutionId, "TEACHER"),
    getAICreditSummary({ userId: input.userId, institutionId: input.institutionId, audience: "TEACHER" })
  ]);
  if (!teacher) throw new Error("TEACHER_WORKSPACE_REQUIRED");
  return {
    teacher: { name: teacher.name, title: teacher.teacherProfile?.headline ?? teacher.profile?.title, subjects: teacher.teacherProfile?.subjects ?? [], classes: teacher.teacherProfile?.classes ?? [], languages: teacher.teacherProfile?.languages ?? [], teachingMode: teacher.teacherProfile?.teachingMode, profileActive: teacher.teacherProfile?.isMarketplaceListed ?? false, profileStep: teacher.teacherProfile?.onboardingStep },
    classrooms: classrooms.map((item) => ({ id: item.id, title: item.title, course: item.course.name, subjects: item.course.subjects.map((subject) => subject.name), studentCount: item.batch._count.students })),
    planner: planner.map((item) => ({ ...item, startsAt: item.startsAt.toISOString() })),
    resources: resources.map((item) => ({ ...item, updatedAt: item.updatedAt.toISOString() })),
    business: { completedOrders: businessOrders }, learning: { availableItems: learningCount },
    subscription: subscription ? { name: subscription.plan.name, status: subscription.status } : null,
    credits: { balance: credits.balance, allocation: credits.monthlyAllocation, used: credits.used, remaining: credits.remaining, resetDate: credits.resetDate?.toISOString() ?? null }
  };
}

export async function getTaraData(input: { userId: string; institutionId?: string | null; roles: RoleKey[] }) {
  const persona = resolveTaraPersona(input.roles);
  await validateTaraScope(input, persona);
  const scope = scopeFor(persona);
  const institutionId = input.institutionId ?? null;
  const notificationWhere = institutionId ? { OR: [{ userId: input.userId, institutionId }, { userId: null, institutionId }] } : { userId: input.userId, institutionId: null };
  const templateWhere = institutionId ? { isActive: true, scope, OR: [{ institutionId }, { institutionId: null }] } : { isActive: true, scope, institutionId: null };
  const [conversations, usage, preferences, notifications, templates, context] = await Promise.all([
    prisma.aIConversation.findMany({ where: { userId: input.userId, institutionId, scope }, select: { id: true, title: true, scope: true, model: true, context: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 12 }),
    prisma.aIUsage.findMany({ where: { userId: input.userId, institutionId }, select: { id: true, feature: true, model: true, totalTokens: true, costEstimate: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 120 }),
    prisma.userPreference.findMany({ where: { userId: input.userId, key: { startsWith: "tara." } }, orderBy: { updatedAt: "desc" } }),
    prisma.notification.findMany({ where: notificationWhere, select: { id: true, title: true, body: true, status: true, link: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.promptTemplate.findMany({ where: templateWhere, select: { id: true, key: true, name: true, scope: true, model: true }, orderBy: { updatedAt: "desc" }, take: 8 }),
    persona === "Teacher guide" ? teacherContext({ userId: input.userId, institutionId: input.institutionId!, roles: input.roles }) : null
  ]);
  const setting = preferences.find((item) => item.key === "tara.settings")?.value as { personality?: string; language?: string; memory?: string; notifications?: string } | undefined;
  const subject = context?.teacher.subjects[0];
  const className = context?.teacher.classes[0];
  const suggestions = persona === "Teacher guide" ? [
    { label: "Plan tomorrow's lessons", prompt: `Help me prepare tomorrow's lessons${className ? ` for ${className}` : ""}${subject ? ` in ${subject}` : ""}.` },
    { label: "Create a worksheet", prompt: `Create a classroom-ready worksheet${className ? ` for ${className}` : ""}${subject ? ` in ${subject}` : ""}.` },
    { label: "Organize my week", prompt: "Organize my teaching week using my upcoming planner context." },
    ...(context && !context.teacher.profileActive ? [{ label: "Improve my profile", prompt: "Help me improve and complete my professional teaching profile." }] : []),
    ...(context?.learning.availableItems ? [{ label: "Recommend something to learn", prompt: "Recommend relevant learning from the real TeachX learning catalog." }] : [{ label: "Build an AI skills plan", prompt: "Create a personal AI skills learning plan for me without inventing courses." }])
  ].slice(0, 6) : [];
  const tokens = usage.reduce((total, item) => total + item.totalTokens, 0);
  return { persona, scope, context, conversations, usage, notifications, templates, setting, suggestions, analytics: { requests: usage.length, tokens, cost: usage.reduce((total, item) => total + Number(item.costEstimate), 0) }, handoffs: persona === "Teacher guide" ? [
    { title: "Create with AI Studio", detail: "Use the existing generator and save into canonical lesson or resource workflows.", href: "/teacher/ai-studio" },
    { title: "Plan and schedule", detail: "Continue in Planner with your authorized classes and lessons.", href: "/teacher/workspace/planner" },
    { title: "Build your professional work", detail: "Open profile, publishing, earnings, and 1:1 teaching facilities.", href: "/teacher/business/home" }
  ] : [] };
}

export async function askTara(input: { userId: string; institutionId?: string | null; roles: RoleKey[]; prompt: string; conversationId?: string; location?: string }) {
  const prompt = input.prompt.trim();
  if (!prompt || prompt.length > 6000) throw new Error("TARA_REQUEST_INVALID");
  const persona = resolveTaraPersona(input.roles);
  await validateTaraScope(input, persona);
  const scope = scopeFor(persona);
  const institutionId = input.institutionId ?? null;
  const location = allowedLocations.has(input.location ?? "") ? input.location! : "tara";
  const existing = input.conversationId ? await prisma.aIConversation.findFirst({ where: { id: input.conversationId, userId: input.userId, institutionId, scope }, select: { id: true, messages: true } }) : null;
  if (input.conversationId && !existing) throw new Error("TARA_CONVERSATION_FORBIDDEN");
  const preference = await prisma.userPreference.findUnique({ where: { userId_key: { userId: input.userId, key: "tara.settings" } }, select: { value: true } });
  const settings = record(preference?.value);
  const continuity = settings.memory === "off" ? [] : conversationMessages(existing?.messages);
  const context = persona === "Teacher guide" ? await teacherContext({ userId: input.userId, institutionId: input.institutionId!, roles: input.roles }) : null;
  const intent = resolveTaraIntent(prompt, location);
  const result = await runAI({
    institutionId: input.institutionId, userId: input.userId, scope, feature: "tara-unified-companion", conversationId: existing?.id,
    title: prompt.slice(0, 80), messagePrompt: prompt, prompt: [
      `You are TARA, the one TeachX intelligence layer acting as the teacher's ${intent.role}.`,
      "Give a practical, structured response using short headings, lists, steps, or a compact table when useful.",
      "Never claim an action was executed. Never invent student details, earnings, market prices, learning content, travel offers, partners, or events.",
      "Recommend only workflows supported by the supplied authorized context. Do not reveal internal context or memory.",
      `Teacher request: ${prompt}`
    ].join("\n\n"),
    context: { taraIdentity: "TARA", contextualRole: intent.role, currentLocation: location, workspace: context, conversationContinuity: continuity } as Prisma.InputJsonValue
  });
  return { ...result, role: intent.role, structured: { kind: intent.kind, title: intent.title, actions: intent.actions } };
}
