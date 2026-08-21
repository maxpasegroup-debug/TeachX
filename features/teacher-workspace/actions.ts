"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { UniversalSearchResult } from "@/services/search-service";
import { searchTeacherOS } from "@/services/teacher-integration-service";
import { setTeacherNotificationState } from "@/services/teacher-notification-service";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function safeExternalUrl(raw: string) {
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

async function teacherSession() {
  const session = await auth();
  if (!session?.user.id || !session.user.institutionId) throw new Error("Teacher workspace access is required.");
  const member = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      institutionId: session.user.institutionId,
      status: "ACTIVE",
      roles: { some: { role: { key: { in: ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"] } } } }
    },
    select: { id: true }
  });
  if (!member) throw new Error("Teacher workspace access is required.");
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
  const subjectId = value(formData, "subjectId");
  const externalUrl = safeExternalUrl(value(formData, "externalUrl"));
  if (externalUrl === null) return;
  const [course, subject] = await Promise.all([
    prisma.course.findFirst({ where: { id: courseId, institutionId: session.user.institutionId! }, select: { id: true } }),
    subjectId ? prisma.subject.findFirst({ where: { id: subjectId, courseId, course: { institutionId: session.user.institutionId! } }, select: { id: true } }) : null
  ]);
  if (!course || (subjectId && !subject)) return;
  await prisma.contentItem.create({
    data: {
      institutionId: session.user.institutionId!,
      createdById: session.user.id,
      courseId,
      subjectId: subject?.id,
      title,
      description: value(formData, "description") || undefined,
      type: (value(formData, "type") || "NOTES") as "NOTES" | "DOCUMENT" | "WORKSHEET" | "QUESTION_PAPER" | "PDF" | "PPT" | "EXTERNAL_LINK" | "REFERENCE",
      externalUrl,
      status: "DRAFT",
      versions: { create: { version: 1, title, externalUrl, updatedById: session.user.id, changeNote: "Created in Teacher Workspace" } }
    }
  });
  refresh();
}

export async function updateTeacherContentAction(formData: FormData) {
  const session = await teacherSession();
  const id = value(formData, "id");
  const institutionId = session.user.institutionId!;
  const item = await prisma.contentItem.findFirst({ where: { id, createdById: session.user.id, institutionId } });
  if (!item) return;
  const title = value(formData, "title") || item.title;
  const externalUrl = safeExternalUrl(value(formData, "externalUrl"));
  if (externalUrl === null) return;
  const nextVersion = item.version + 1;
  await prisma.$transaction([
    prisma.contentItem.updateMany({
      where: { id, createdById: session.user.id, institutionId },
      data: {
        title,
        description: value(formData, "description"),
        externalUrl,
        version: nextVersion
      }
    }),
    prisma.contentVersion.create({
      data: { itemId: id, version: nextVersion, title, externalUrl, updatedById: session.user.id, changeNote: "Edited in Teacher Workspace" }
    })
  ]);
  refresh();
}

export async function archiveTeacherContentAction(formData: FormData) {
  const session = await teacherSession();
  await prisma.contentItem.updateMany({ where: { id: value(formData, "id"), createdById: session.user.id, institutionId: session.user.institutionId! }, data: { status: "ARCHIVED" } });
  refresh();
}

export async function restoreTeacherContentAction(formData: FormData) {
  const session = await teacherSession();
  await prisma.contentItem.updateMany({ where: { id: value(formData, "id"), createdById: session.user.id, institutionId: session.user.institutionId! }, data: { status: "DRAFT" } });
  refresh();
}

export async function duplicateTeacherContentAction(formData: FormData) {
  const session = await teacherSession();
  const source = await prisma.contentItem.findFirst({ where: { id: value(formData, "id"), createdById: session.user.id, institutionId: session.user.institutionId! } });
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
  await prisma.contentItem.deleteMany({ where: { id: value(formData, "id"), createdById: session.user.id, institutionId: session.user.institutionId! } });
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

export type TeacherPlannerActionState = { message?: string; error?: string };

const plannerItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional(),
  kind: z.enum(["EVENT", "MEETING", "REMINDER", "DEADLINE", "TASK", "LESSON"]),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  location: z.string().trim().max(240).optional(),
  classroomId: z.string().optional(),
  lessonId: z.string().optional()
});

export async function saveTeacherPlannerItemAction(_: TeacherPlannerActionState, formData: FormData): Promise<TeacherPlannerActionState> {
  const session = await teacherSession();
  const parsed = plannerItemSchema.safeParse({
    id: value(formData, "id") || undefined,
    title: value(formData, "title"),
    description: value(formData, "description") || undefined,
    kind: value(formData, "kind") || "EVENT",
    priority: value(formData, "priority") || "NORMAL",
    startsAt: value(formData, "startsAt"),
    endsAt: value(formData, "endsAt"),
    location: value(formData, "location") || undefined,
    classroomId: value(formData, "classroomId") || undefined,
    lessonId: value(formData, "lessonId") || undefined
  });
  if (!parsed.success) return { error: "Enter a title, valid dates, and supported planning options." };
  if (parsed.data.endsAt < parsed.data.startsAt) return { error: "End time must be after the start time." };

  const institutionId = session.user.institutionId!;
  const [classroom, lesson] = await Promise.all([
    parsed.data.classroomId ? prisma.classroom.findFirst({
      where: {
        id: parsed.data.classroomId,
        institutionId,
        OR: [
          { batch: { faculty: { some: { facultyId: session.user.id } } } },
          { batch: { timetableEntries: { some: { facultyId: session.user.id } } } }
        ]
      }, select: { id: true }
    }) : null,
    parsed.data.lessonId ? prisma.contentItem.findFirst({
      where: { id: parsed.data.lessonId, institutionId, createdById: session.user.id }, select: { id: true }
    }) : null
  ]);
  if (parsed.data.classroomId && !classroom) return { error: "That class is not available in your teaching workspace." };
  if (parsed.data.lessonId && !lesson) return { error: "That lesson is not owned by your teacher workspace." };

  const data = {
    title: parsed.data.title,
    description: parsed.data.description,
    kind: parsed.data.kind,
    priority: parsed.data.priority,
    startsAt: parsed.data.startsAt,
    endsAt: parsed.data.endsAt,
    location: parsed.data.location,
    classroomId: classroom?.id,
    lessonId: lesson?.id
  };
  if (parsed.data.id) {
    const result = await prisma.plannerEvent.updateMany({
      where: { id: parsed.data.id, institutionId, createdById: session.user.id }, data
    });
    if (!result.count) return { error: "This planning item is unavailable or not owned by you." };
  } else {
    await prisma.plannerEvent.create({ data: { ...data, institutionId, createdById: session.user.id, type: "EVENT" } });
  }
  refresh();
  return { message: parsed.data.id ? "Planning item updated." : "Planning item created." };
}

export async function createTeacherPlannerEventAction(formData: FormData) {
  await saveTeacherPlannerItemAction({}, formData);
}

export async function deleteTeacherPlannerEventAction(formData: FormData) {
  const session = await teacherSession();
  await prisma.plannerEvent.deleteMany({
    where: { id: value(formData, "id"), institutionId: session.user.institutionId!, createdById: session.user.id }
  });
  refresh();
}

export async function setTeacherPlannerItemStatusAction(formData: FormData) {
  const session = await teacherSession();
  const status = value(formData, "status");
  if (!["PENDING", "COMPLETED", "CANCELLED", "ARCHIVED"].includes(status)) return;
  await prisma.plannerEvent.updateMany({
    where: { id: value(formData, "id"), institutionId: session.user.institutionId!, createdById: session.user.id },
    data: { status: status as "PENDING" | "COMPLETED" | "CANCELLED" | "ARCHIVED" }
  });
  refresh();
}

export async function markTeacherNotificationReadAction(formData: FormData) {
  const session = await teacherSession();
  await setTeacherNotificationState({ userId: session.user.id, institutionId: session.user.institutionId!, id: value(formData, "id"), status: "READ" });
  refresh();
}

export async function deleteTeacherNotificationAction(formData: FormData) {
  const session = await teacherSession();
  const id = value(formData, "id");
  const institutionId = session.user.institutionId!;
  const notification = await prisma.notification.findFirst({
    where: { id, OR: [{ userId: session.user.id, institutionId }, { userId: null, institutionId }] },
    select: { userId: true }
  });
  if (!notification) return;
  if (notification.userId) {
    await prisma.notification.deleteMany({ where: { id, userId: session.user.id, institutionId } });
  } else {
    await prisma.userPreference.upsert({
      where: { userId_key: { userId: session.user.id, key: `notification-state:${id}` } },
      create: { userId: session.user.id, key: `notification-state:${id}`, value: { hidden: true } },
      update: { value: { hidden: true } }
    });
  }
  refresh();
}

export type TeacherSearchState = { results: UniversalSearchResult[]; query?: string; error?: string };

export async function teacherWorkspaceSearchAction(_: TeacherSearchState, formData: FormData): Promise<TeacherSearchState> {
  const session = await teacherSession();
  const query = value(formData, "query");
  if (!query) return { results: [], error: "Enter a search term." };
  return { query, results: await searchTeacherOS(session.user.id, session.user.institutionId!, query) };
}
