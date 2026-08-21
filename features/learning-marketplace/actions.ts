"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { userHasPermission } from "@/lib/rbac";
import { userOwnsResource } from "@/services/commerce-service";
import { createModuleNotification } from "@/services/notification-aggregation-service";
import { getLearningResource, getResourceMetadata, mapResourceTypeToContentType } from "@/services/learning-marketplace-service";
import { saveAIContentToTeacherLibrary } from "@/services/teacher-integration-service";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function list(formData: FormData, key: string) {
  return value(formData, key)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function requireTeacherSession() {
  const session = await auth();
  if (!session?.user.id || !session.user.institutionId) throw new Error("Sign in as a teacher to manage resources.");
  const teacherRoles = ["ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR", "ACADEMIC_HEAD"];
  const isTeacher = session.user.roles.some((role) => teacherRoles.includes(role));
  if (!isTeacher && !userHasPermission(session.user.roles, "content.manage")) throw new Error("You do not have access to publish resources.");
  const member = await prisma.user.findFirst({
    where: { id: session.user.id, institutionId: session.user.institutionId, status: "ACTIVE" },
    select: { id: true }
  });
  if (!member) throw new Error("You do not have access to publish resources.");
  return session;
}

function safeResourceUrl(raw: string, allowPrivateStorage = false) {
  if (!raw) return undefined;
  if (allowPrivateStorage && /^\/api\/storage\/objects\/[^/]+\/download$/.test(raw)) return raw;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

async function resolveCourseId(institutionId: string, courseId?: string) {
  if (courseId) {
    const course = await prisma.course.findFirst({ where: { id: courseId, institutionId }, select: { id: true } });
    return course?.id;
  }
  const course = await prisma.course.findFirst({ where: { institutionId }, orderBy: { createdAt: "asc" } });
  return course?.id;
}

function resourceMetadata(formData: FormData, source = "publisher") {
  return {
    marketplace: "learning",
    source,
    resourceType: value(formData, "resourceType") || "Study Notes",
    category: value(formData, "category") || value(formData, "resourceType") || "Study Notes",
    className: value(formData, "className") || undefined,
    board: value(formData, "board") || undefined,
    language: value(formData, "language") || "English",
    tags: list(formData, "tags"),
    pages: value(formData, "pages") || undefined,
    priceType: value(formData, "priceType") || "Free",
    coverImage: value(formData, "coverImage") || undefined,
    outputFormat: value(formData, "outputFormat") || "PDF",
    preview: value(formData, "preview") || value(formData, "description") || undefined,
    filePlaceholders: ["PDF", "DOCX", "PPT", "Image", "Video"]
  };
}

export async function publishLearningResourceAction(formData: FormData) {
  const session = await requireTeacherSession();
  const institutionId = session.user.institutionId!;
  const title = value(formData, "title");
  const courseId = await resolveCourseId(institutionId, value(formData, "courseId"));
  if (!title || !courseId) return;

  const requestedSubjectId = value(formData, "subjectId");
  const subject = requestedSubjectId
    ? await prisma.subject.findFirst({
        where: { id: requestedSubjectId, courseId, course: { institutionId } },
        select: { id: true }
      })
    : null;
  if (requestedSubjectId && !subject) return;

  const fileUrl = safeResourceUrl(value(formData, "fileUrl"), true);
  const externalUrl = safeResourceUrl(value(formData, "externalUrl"));
  if (fileUrl === null || externalUrl === null) return;

  const resourceType = value(formData, "resourceType") || "Study Notes";
  const status = value(formData, "intent") === "draft" ? "DRAFT" : "PUBLISHED";
  const visibility = status === "PUBLISHED" ? "PUBLIC" : "TEACHERS";

  const resource = await prisma.contentItem.create({
    data: {
      institutionId: session.user.institutionId!,
      createdById: session.user.id,
      courseId,
      subjectId: subject?.id,
      title,
      description: value(formData, "description") || undefined,
      type: mapResourceTypeToContentType(resourceType),
      fileUrl,
      externalUrl,
      status,
      visibility,
      publishedAt: status === "PUBLISHED" ? new Date() : undefined,
      aiReadyNotes: resourceMetadata(formData),
      versions: {
        create: {
          version: 1,
          title,
          fileUrl,
          externalUrl,
          updatedById: session.user.id,
          changeNote: status === "PUBLISHED" ? "Published to learning marketplace" : "Saved as marketplace draft"
        }
      },
      analytics: { create: {} },
      externalContent: externalUrl ? { create: { url: externalUrl, provider: "External" } } : undefined
    }
  });

  if (status === "PUBLISHED") {
    await createModuleNotification({ institutionId, type: "CONTENT", title: "Resource published", body: resource.title, link: `/resources/${resource.id}` });
  }

  revalidatePath("/teacher/workspace/resources");
  revalidatePath("/teacher/resources");
  revalidatePath("/resources");
}

export async function updateResourceStatusAction(formData: FormData) {
  const session = await requireTeacherSession();
  const institutionId = session.user.institutionId!;
  const resourceId = value(formData, "resourceId");
  const intent = value(formData, "intent");
  if (!resourceId) return;

  const data =
    intent === "archive"
      ? { status: "ARCHIVED" as const, visibility: "TEACHERS" as const }
      : intent === "publish"
        ? { status: "PUBLISHED" as const, visibility: "PUBLIC" as const, publishedAt: new Date() }
        : { status: "DRAFT" as const, visibility: "TEACHERS" as const };

  await prisma.contentItem.updateMany({ where: { id: resourceId, createdById: session.user.id, institutionId }, data });
  revalidatePath("/teacher/workspace/resources");
  revalidatePath("/teacher/resources");
  revalidatePath("/resources");
}

export async function duplicateLearningResourceAction(formData: FormData) {
  const session = await requireTeacherSession();
  const institutionId = session.user.institutionId!;
  const resourceId = value(formData, "resourceId");
  const item = await prisma.contentItem.findFirst({ where: { id: resourceId, createdById: session.user.id, institutionId } });
  if (!item) return;

  await prisma.contentItem.create({
    data: {
      institutionId: item.institutionId,
      createdById: session.user.id,
      courseId: item.courseId,
      subjectId: item.subjectId,
      title: `${item.title} Copy`,
      description: item.description,
      type: item.type,
      fileUrl: item.fileUrl,
      externalUrl: item.externalUrl,
      status: "DRAFT",
      visibility: "TEACHERS",
      aiReadyNotes: item.aiReadyNotes ?? undefined,
      versions: { create: { version: 1, title: `${item.title} Copy`, fileUrl: item.fileUrl, externalUrl: item.externalUrl, updatedById: session.user.id, changeNote: "Duplicated from marketplace resource" } },
      analytics: { create: {} }
    }
  });

  revalidatePath("/teacher/workspace/resources");
  revalidatePath("/teacher/resources");
}

export async function deleteLearningResourceAction(formData: FormData) {
  const session = await requireTeacherSession();
  const institutionId = session.user.institutionId!;
  const resourceId = value(formData, "resourceId");
  if (!resourceId) return;
  await prisma.contentItem.deleteMany({ where: { id: resourceId, createdById: session.user.id, institutionId, status: { not: "PUBLISHED" } } });
  revalidatePath("/teacher/workspace/resources");
  revalidatePath("/teacher/resources");
}

export async function bookmarkLearningResourceAction(formData: FormData) {
  const session = await auth();
  const resourceId = value(formData, "resourceId");
  const resource = resourceId ? await getLearningResource(resourceId) : null;
  if (!session?.user.id || !resource) return;

  await prisma.favoriteItem.upsert({
    where: { userId_type_entityId: { userId: session.user.id, type: "learning-resource", entityId: resource.id } },
    update: { title: resource.title, link: `/resources/${resource.id}` },
    create: { userId: session.user.id, type: "learning-resource", entityId: resource.id, title: resource.title, link: `/resources/${resource.id}` }
  });

  if (resource.createdById && resource.createdById !== session.user.id) {
    await prisma.notification.create({ data: { userId: resource.createdById, institutionId: resource.institutionId, title: "Resource bookmarked", body: `${session.user.name ?? "A student"} saved ${resource.title}.`, link: "/teacher/workspace/resources" } });
  }

  revalidatePath(`/resources/${resource.id}`);
  revalidatePath("/student/resources");
}

export async function wishlistLearningResourceAction(formData: FormData) {
  const session = await auth();
  const resourceId = value(formData, "resourceId");
  const resource = resourceId ? await getLearningResource(resourceId) : null;
  if (!session?.user.id || !resource) return;

  await prisma.favoriteItem.upsert({
    where: { userId_type_entityId: { userId: session.user.id, type: "learning-resource-wishlist", entityId: resource.id } },
    update: { title: resource.title, link: `/resources/${resource.id}` },
    create: { userId: session.user.id, type: "learning-resource-wishlist", entityId: resource.id, title: resource.title, link: `/resources/${resource.id}` }
  });

  revalidatePath("/student/resources");
}

export async function downloadLearningResourceAction(formData: FormData) {
  const session = await auth();
  const resourceId = value(formData, "resourceId");
  const resource = resourceId ? await getLearningResource(resourceId) : null;
  if (!session?.user.id || !resource) return;
  const metadata = getResourceMetadata(resource);
  if (metadata.priceType === "Premium" && !(await userOwnsResource(session.user.id, resource.id))) return;
  const destination = safeResourceUrl(resource.fileUrl ?? "", true) ?? safeResourceUrl(resource.externalUrl ?? "");
  if (!destination) return;

  await prisma.downloadHistory.create({ data: { itemId: resource.id, userId: session.user.id } });
  await prisma.contentAnalytics.upsert({
    where: { itemId: resource.id },
    update: { downloads: { increment: 1 } },
    create: { itemId: resource.id, downloads: 1 }
  });

  if (resource.createdById && resource.createdById !== session.user.id) {
    await prisma.notification.create({ data: { userId: resource.createdById, institutionId: resource.institutionId, title: "Resource downloaded", body: `${session.user.name ?? "A student"} downloaded ${resource.title}.`, link: "/teacher/workspace/resources" } });
  }

  revalidatePath(`/resources/${resource.id}`);
  revalidatePath("/student/resources");
  redirect(destination);
}

export async function saveAIConversationAsResourceAction(formData: FormData) {
  const session = await requireTeacherSession();
  const institutionId = session.user.institutionId!;
  const conversationId = value(formData, "conversationId");
  const courseId = await resolveCourseId(institutionId, value(formData, "courseId"));
  if (!conversationId || !courseId) return;
  await saveAIContentToTeacherLibrary({
    userId: session.user.id,
    institutionId,
    conversationId,
    courseId,
    title: value(formData, "title"),
    contentType: mapResourceTypeToContentType(value(formData, "resourceType")),
    saveKind: "resource",
    metadata: resourceMetadata(formData, "ai-studio")
  });

  revalidatePath("/teacher/workspace/resources");
  revalidatePath("/teacher/resources");
}
