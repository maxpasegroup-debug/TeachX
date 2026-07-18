"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { userHasPermission } from "@/lib/rbac";
import { userOwnsResource } from "@/services/commerce-service";
import { createModuleNotification } from "@/services/notification-aggregation-service";
import { getLearningResource, getResourceMetadata, mapResourceTypeToContentType } from "@/services/learning-marketplace-service";

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
  return session;
}

async function resolveCourseId(institutionId: string, courseId?: string) {
  if (courseId) return courseId;
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

  const resourceType = value(formData, "resourceType") || "Study Notes";
  const status = value(formData, "intent") === "draft" ? "DRAFT" : "PUBLISHED";
  const visibility = status === "PUBLISHED" ? "PUBLIC" : "TEACHERS";

  const resource = await prisma.contentItem.create({
    data: {
      institutionId: session.user.institutionId!,
      createdById: session.user.id,
      courseId,
      subjectId: value(formData, "subjectId") || undefined,
      title,
      description: value(formData, "description") || undefined,
      type: mapResourceTypeToContentType(resourceType),
      fileUrl: value(formData, "fileUrl") || undefined,
      externalUrl: value(formData, "externalUrl") || undefined,
      status,
      visibility,
      publishedAt: status === "PUBLISHED" ? new Date() : undefined,
      aiReadyNotes: resourceMetadata(formData),
      versions: {
        create: {
          version: 1,
          title,
          fileUrl: value(formData, "fileUrl") || undefined,
          externalUrl: value(formData, "externalUrl") || undefined,
          updatedById: session.user.id,
          changeNote: status === "PUBLISHED" ? "Published to learning marketplace" : "Saved as marketplace draft"
        }
      },
      analytics: { create: {} },
      externalContent: value(formData, "externalUrl") ? { create: { url: value(formData, "externalUrl"), provider: "External" } } : undefined
    }
  });

  if (status === "PUBLISHED") {
    await createModuleNotification({ institutionId, type: "CONTENT", title: "Resource published", body: resource.title, link: `/resources/${resource.id}` });
  }

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

  revalidatePath("/teacher/resources");
}

export async function deleteLearningResourceAction(formData: FormData) {
  const session = await requireTeacherSession();
  const institutionId = session.user.institutionId!;
  const resourceId = value(formData, "resourceId");
  if (!resourceId) return;
  await prisma.contentItem.deleteMany({ where: { id: resourceId, createdById: session.user.id, institutionId, status: { not: "PUBLISHED" } } });
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
    await prisma.notification.create({ data: { userId: resource.createdById, institutionId: resource.institutionId, title: "Resource bookmarked", body: `${session.user.name ?? "A student"} saved ${resource.title}.`, link: "/teacher/resources" } });
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

  await prisma.downloadHistory.create({ data: { itemId: resource.id, userId: session.user.id } });
  await prisma.contentAnalytics.upsert({
    where: { itemId: resource.id },
    update: { downloads: { increment: 1 } },
    create: { itemId: resource.id, downloads: 1 }
  });

  if (resource.createdById && resource.createdById !== session.user.id) {
    await prisma.notification.create({ data: { userId: resource.createdById, institutionId: resource.institutionId, title: "Resource downloaded", body: `${session.user.name ?? "A student"} downloaded ${resource.title}.`, link: "/teacher/resources" } });
  }

  revalidatePath(`/resources/${resource.id}`);
  revalidatePath("/student/resources");
}

export async function saveAIConversationAsResourceAction(formData: FormData) {
  const session = await requireTeacherSession();
  const institutionId = session.user.institutionId!;
  const conversationId = value(formData, "conversationId");
  const courseId = await resolveCourseId(institutionId, value(formData, "courseId"));
  const conversation = conversationId ? await prisma.aIConversation.findFirst({ where: { id: conversationId, userId: session.user.id, scope: "TEACHER" } }) : null;
  if (!conversation || !courseId) return;

  await prisma.contentItem.create({
    data: {
      institutionId,
      createdById: session.user.id,
      courseId,
      title: value(formData, "title") || conversation.title,
      description: "Saved from TeachX AI Studio.",
      type: mapResourceTypeToContentType(value(formData, "resourceType")),
      status: "DRAFT",
      visibility: "TEACHERS",
      aiReadyNotes: {
        ...resourceMetadata(formData, "ai-studio"),
        conversationId: conversation.id,
        preview: JSON.stringify(conversation.messages).slice(0, 1200)
      },
      versions: { create: { version: 1, title: value(formData, "title") || conversation.title, updatedById: session.user.id, changeNote: "Saved from AI Studio generation" } },
      analytics: { create: {} }
    }
  });

  revalidatePath("/teacher/resources");
}
