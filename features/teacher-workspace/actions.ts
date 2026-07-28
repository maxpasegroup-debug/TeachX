"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { universalSearch, type UniversalSearchResult } from "@/services/search-service";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function teacherSession() {
  const session = await auth();
  if (!session?.user.id || !session.user.institutionId) throw new Error("Teacher workspace access is required.");
  return session;
}

function refresh() {
  revalidatePath("/teacher");
  revalidatePath("/teacher/workspace", "layout");
}

export async function createTeacherContentAction(formData: FormData) {
  const session = await teacherSession();
  const courseId = value(formData, "courseId");
  const title = value(formData, "title");
  if (!courseId || !title) return;
  const course = await prisma.course.findFirst({ where: { id: courseId, institutionId: session.user.institutionId! } });
  if (!course) return;
  await prisma.contentItem.create({
    data: {
      institutionId: session.user.institutionId!,
      createdById: session.user.id,
      courseId,
      subjectId: value(formData, "subjectId") || undefined,
      title,
      description: value(formData, "description") || undefined,
      type: (value(formData, "type") || "NOTES") as "NOTES" | "DOCUMENT" | "WORKSHEET" | "QUESTION_PAPER" | "PDF" | "PPT" | "EXTERNAL_LINK" | "REFERENCE",
      externalUrl: value(formData, "externalUrl") || undefined,
      status: "DRAFT",
      versions: { create: { version: 1, title, externalUrl: value(formData, "externalUrl") || undefined, updatedById: session.user.id, changeNote: "Created in Teacher Workspace" } }
    }
  });
  refresh();
}

export async function updateTeacherContentAction(formData: FormData) {
  const session = await teacherSession();
  const id = value(formData, "id");
  const item = await prisma.contentItem.findFirst({ where: { id, createdById: session.user.id } });
  if (!item) return;
  const title = value(formData, "title") || item.title;
  const nextVersion = item.version + 1;
  await prisma.contentItem.update({
    where: { id },
    data: {
      title,
      description: value(formData, "description"),
      externalUrl: value(formData, "externalUrl") || undefined,
      version: nextVersion,
      versions: { create: { version: nextVersion, title, externalUrl: value(formData, "externalUrl") || undefined, updatedById: session.user.id, changeNote: "Edited in Teacher Workspace" } }
    }
  });
  refresh();
}

export async function archiveTeacherContentAction(formData: FormData) {
  const session = await teacherSession();
  await prisma.contentItem.updateMany({ where: { id: value(formData, "id"), createdById: session.user.id }, data: { status: "ARCHIVED" } });
  refresh();
}

export async function restoreTeacherContentAction(formData: FormData) {
  const session = await teacherSession();
  await prisma.contentItem.updateMany({ where: { id: value(formData, "id"), createdById: session.user.id }, data: { status: "DRAFT" } });
  refresh();
}

export async function duplicateTeacherContentAction(formData: FormData) {
  const session = await teacherSession();
  const source = await prisma.contentItem.findFirst({ where: { id: value(formData, "id"), createdById: session.user.id } });
  if (!source) return;
  await prisma.contentItem.create({
    data: {
      institutionId: source.institutionId, createdById: session.user.id, courseId: source.courseId,
      subjectId: source.subjectId, chapterId: source.chapterId, topicId: source.topicId, classroomId: source.classroomId,
      batchId: source.batchId, title: `${source.title} (Copy)`, description: source.description, type: source.type,
      fileUrl: source.fileUrl, externalUrl: source.externalUrl, storageKey: source.storageKey, mimeType: source.mimeType,
      sizeBytes: source.sizeBytes, durationSeconds: source.durationSeconds, visibility: source.visibility, status: "DRAFT",
      aiReadyNotes: source.aiReadyNotes === null ? Prisma.JsonNull : source.aiReadyNotes as Prisma.InputJsonValue,
      versions: { create: { version: 1, title: `${source.title} (Copy)`, fileUrl: source.fileUrl, externalUrl: source.externalUrl, storageKey: source.storageKey, sizeBytes: source.sizeBytes, updatedById: session.user.id, changeNote: `Duplicated from ${source.id}` } }
    }
  });
  refresh();
}

export async function deleteTeacherContentAction(formData: FormData) {
  const session = await teacherSession();
  await prisma.contentItem.deleteMany({ where: { id: value(formData, "id"), createdById: session.user.id } });
  refresh();
}

export async function toggleTeacherFavoriteAction(formData: FormData) {
  const session = await teacherSession();
  const entityId = value(formData, "entityId");
  const type = value(formData, "type");
  const existing = await prisma.favoriteItem.findUnique({ where: { userId_type_entityId: { userId: session.user.id, type, entityId } } });
  if (existing) await prisma.favoriteItem.delete({ where: { id: existing.id } });
  else await prisma.favoriteItem.create({ data: { userId: session.user.id, type, entityId, title: value(formData, "title"), link: value(formData, "link") || undefined } });
  refresh();
}

export async function saveTeacherNoteAction(formData: FormData) {
  const session = await teacherSession();
  const id = value(formData, "id");
  const key = id ? value(formData, "key") : `teacher-note:${crypto.randomUUID()}`;
  const note = {
    title: value(formData, "title") || "Untitled note",
    content: value(formData, "content"),
    kind: value(formData, "kind") || "PERSONAL",
    pinned: value(formData, "pinned") === "true",
    archived: value(formData, "archived") === "true"
  };
  if (id) await prisma.userPreference.updateMany({ where: { id, userId: session.user.id, key: { startsWith: "teacher-note:" } }, data: { value: note } });
  else await prisma.userPreference.create({ data: { userId: session.user.id, key, value: note } });
  refresh();
}

export async function setTeacherNoteStateAction(formData: FormData) {
  const session = await teacherSession();
  const note = await prisma.userPreference.findFirst({ where: { id: value(formData, "id"), userId: session.user.id, key: { startsWith: "teacher-note:" } } });
  if (!note) return;
  const current = note.value && typeof note.value === "object" && !Array.isArray(note.value) ? note.value as Record<string, unknown> : {};
  const field = value(formData, "field");
  if (!["pinned", "archived"].includes(field)) return;
  await prisma.userPreference.update({ where: { id: note.id }, data: { value: { ...current, [field]: value(formData, "enabled") === "true" } as Prisma.InputJsonValue } });
  refresh();
}

export async function deleteTeacherNoteAction(formData: FormData) {
  const session = await teacherSession();
  await prisma.userPreference.deleteMany({ where: { id: value(formData, "id"), userId: session.user.id, key: { startsWith: "teacher-note:" } } });
  refresh();
}

export async function createTeacherPlannerEventAction(formData: FormData) {
  const session = await teacherSession();
  const startsAt = new Date(value(formData, "startsAt"));
  const endsAt = new Date(value(formData, "endsAt"));
  if (!value(formData, "title") || Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) return;
  await prisma.plannerEvent.create({
    data: {
      institutionId: session.user.institutionId!, title: value(formData, "title"),
      description: value(formData, "description") || undefined,
      type: (["EVENT", "HOLIDAY", "SPECIAL_HOLIDAY"].includes(value(formData, "type")) ? value(formData, "type") : "EVENT") as "EVENT" | "HOLIDAY" | "SPECIAL_HOLIDAY",
      startsAt, endsAt
    }
  });
  refresh();
}

export async function deleteTeacherPlannerEventAction(formData: FormData) {
  const session = await teacherSession();
  await prisma.plannerEvent.deleteMany({ where: { id: value(formData, "id"), institutionId: session.user.institutionId! } });
  refresh();
}

export async function markTeacherNotificationReadAction(formData: FormData) {
  const session = await teacherSession();
  await prisma.notification.updateMany({ where: { id: value(formData, "id"), userId: session.user.id }, data: { status: "READ", readAt: new Date() } });
  refresh();
}

export async function deleteTeacherNotificationAction(formData: FormData) {
  const session = await teacherSession();
  await prisma.notification.deleteMany({ where: { id: value(formData, "id"), userId: session.user.id } });
  refresh();
}

export type TeacherSearchState = { results: UniversalSearchResult[]; query?: string; error?: string };

export async function teacherWorkspaceSearchAction(_: TeacherSearchState, formData: FormData): Promise<TeacherSearchState> {
  const session = await teacherSession();
  const query = value(formData, "query");
  if (!query) return { results: [], error: "Enter a search term." };
  const contains = { contains: query, mode: "insensitive" as const };
  const [platform, ai, notes] = await Promise.all([
    universalSearch(session.user.institutionId!, query, session.user.id),
    prisma.aIConversation.findMany({ where: { userId: session.user.id, scope: "TEACHER", title: contains }, take: 10 }),
    prisma.userPreference.findMany({ where: { userId: session.user.id, key: { startsWith: "teacher-note:" } }, take: 100 })
  ]);
  const noteResults = notes.filter((note) => JSON.stringify(note.value).toLowerCase().includes(query.toLowerCase())).slice(0, 10);
  return {
    query,
    results: [
      ...ai.map((item) => ({ type: "AI Output", title: item.title, subtitle: "Saved AI generation", href: "/teacher/workspace/saved-ai" })),
      ...noteResults.map((item) => {
        const note = item.value as { title?: string; kind?: string };
        return { type: "Note", title: note.title ?? "Untitled note", subtitle: note.kind ?? "Personal", href: "/teacher/workspace/notes" };
      }),
      ...platform.filter((item) => !["Student", "Teacher", "Support Ticket", "Audit Log", "Feature Flag", "Order"].includes(item.type))
    ]
  };
}
