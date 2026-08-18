"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

function value(formData: FormData, key: string) { return String(formData.get(key) ?? "").trim(); }
function list(formData: FormData, key: string) { return value(formData, key).split(",").map((item) => item.trim()).filter(Boolean); }
function refresh() { revalidatePath("/teacher/business", "layout"); revalidatePath("/teacher/business/marketplace"); revalidatePath("/marketplace"); }
async function session() {
  const result = await auth();
  if (!result?.user.id || !result.user.institutionId) throw new Error("Teacher business access is required.");
  return result;
}

export async function saveBusinessProfileAction(formData: FormData) {
  const current = await session();
  const availability = {
    summary: value(formData, "availability"), skills: list(formData, "skills"),
    website: value(formData, "website"), contactPreferences: value(formData, "contactPreferences"),
    socialLinks: { linkedin: value(formData, "linkedin"), youtube: value(formData, "youtube"), instagram: value(formData, "instagram") }
  };
  await prisma.profile.upsert({
    where: { userId: current.user.id },
    update: { avatarUrl: value(formData, "avatarUrl") || undefined, title: value(formData, "qualification") || undefined, bio: value(formData, "bio") || undefined },
    create: { userId: current.user.id, avatarUrl: value(formData, "avatarUrl") || undefined, title: value(formData, "qualification") || undefined, bio: value(formData, "bio") || undefined }
  });
  await prisma.teacherProfile.upsert({
    where: { userId: current.user.id },
    update: {
      coverUrl: value(formData, "coverUrl") || undefined, headline: value(formData, "headline") || undefined,
      bio: value(formData, "bio") || undefined, qualification: value(formData, "qualification") || undefined,
      experienceYears: Number(value(formData, "experienceYears")) || undefined, certificates: list(formData, "certifications"),
      subjects: list(formData, "subjects"), classes: list(formData, "grades"), languages: list(formData, "languages"),
      teachingMode: value(formData, "teachingMode") || undefined, location: value(formData, "location") || undefined,
      availability, isMarketplaceListed: formData.get("public") === "on"
    },
    create: {
      userId: current.user.id, coverUrl: value(formData, "coverUrl") || undefined, headline: value(formData, "headline") || undefined,
      bio: value(formData, "bio") || undefined, qualification: value(formData, "qualification") || undefined,
      experienceYears: Number(value(formData, "experienceYears")) || undefined, certificates: list(formData, "certifications"),
      subjects: list(formData, "subjects"), classes: list(formData, "grades"), languages: list(formData, "languages"),
      teachingMode: value(formData, "teachingMode") || undefined, location: value(formData, "location") || undefined,
      availability, isMarketplaceListed: formData.get("public") === "on"
    }
  });
  refresh();
}

export async function savePortfolioItemAction(formData: FormData) {
  const current = await session();
  const id = value(formData, "id");
  const payload = {
    title: value(formData, "title"), type: value(formData, "type"), description: value(formData, "description"),
    url: value(formData, "url"), thumbnail: value(formData, "thumbnail"), public: formData.get("public") === "on"
  };
  if (!payload.title) return;
  if (id) await prisma.userPreference.updateMany({ where: { id, userId: current.user.id, key: { startsWith: "teacher-portfolio:" } }, data: { value: payload } });
  else await prisma.userPreference.create({ data: { userId: current.user.id, key: `teacher-portfolio:${crypto.randomUUID()}`, value: payload } });
  refresh();
}

export async function deletePortfolioItemAction(formData: FormData) {
  const current = await session();
  await prisma.userPreference.deleteMany({ where: { id: value(formData, "id"), userId: current.user.id, key: { startsWith: "teacher-portfolio:" } } });
  refresh();
}

function resourceMetadata(formData: FormData) {
  return {
    marketplace: "TeachX", category: value(formData, "category"), resourceType: value(formData, "category"),
    tags: list(formData, "tags"), priceType: value(formData, "priceType") || "Free",
    price: Number(value(formData, "price")) || 0, coverImage: value(formData, "thumbnail"),
    preview: value(formData, "preview"), attachments: list(formData, "attachments")
  };
}

export async function createBusinessResourceAction(formData: FormData) {
  const current = await session();
  const courseId = value(formData, "courseId");
  const title = value(formData, "title");
  const course = await prisma.course.findFirst({ where: { id: courseId, institutionId: current.user.institutionId! } });
  if (!course || !title) return;
  const item = await prisma.contentItem.create({
    data: {
      institutionId: current.user.institutionId!, createdById: current.user.id, courseId,
      subjectId: value(formData, "subjectId") || undefined, title, description: value(formData, "description") || undefined,
      type: (value(formData, "type") || "DOCUMENT") as "DOCUMENT" | "NOTES" | "WORKSHEET" | "QUESTION_PAPER" | "PPT" | "PDF" | "VIDEO" | "IMAGE" | "ZIP" | "REFERENCE",
      externalUrl: value(formData, "fileUrl") || undefined, status: formData.get("publish") === "on" ? "PUBLISHED" : "DRAFT",
      visibility: formData.get("publish") === "on" ? "PUBLIC" : "PRIVATE", publishedAt: formData.get("publish") === "on" ? new Date() : undefined,
      aiReadyNotes: resourceMetadata(formData),
      versions: { create: { version: 1, title, externalUrl: value(formData, "fileUrl") || undefined, updatedById: current.user.id, changeNote: "Initial marketplace version" } }
    }
  });
  await prisma.activity.create({ data: { institutionId: current.user.institutionId, actorId: current.user.id, type: "CONTENT", title: `Resource created: ${item.title}`, entity: "ContentItem", entityId: item.id, link: "/teacher/business/publishing" } });
  refresh();
}

export async function updateBusinessResourceAction(formData: FormData) {
  const current = await session();
  const item = await prisma.contentItem.findFirst({ where: { id: value(formData, "id"), createdById: current.user.id } });
  if (!item) return;
  const title = value(formData, "title") || item.title;
  const version = item.version + 1;
  await prisma.contentItem.update({
    where: { id: item.id },
    data: {
      title, description: value(formData, "description"), externalUrl: value(formData, "fileUrl") || undefined,
      aiReadyNotes: resourceMetadata(formData), version,
      versions: { create: { version, title, externalUrl: value(formData, "fileUrl") || undefined, updatedById: current.user.id, changeNote: value(formData, "changeNote") || "Listing updated" } }
    }
  });
  refresh();
}

export async function setBusinessResourceStatusAction(formData: FormData) {
  const current = await session();
  const status = value(formData, "status");
  if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) return;
  await prisma.contentItem.updateMany({
    where: { id: value(formData, "id"), createdById: current.user.id },
    data: { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED", visibility: status === "PUBLISHED" ? "PUBLIC" : "PRIVATE", publishedAt: status === "PUBLISHED" ? new Date() : undefined }
  });
  refresh();
}

export async function deleteBusinessResourceAction(formData: FormData) {
  const current = await session();
  await prisma.contentItem.deleteMany({ where: { id: value(formData, "id"), createdById: current.user.id } });
  refresh();
}

export async function setSubscriptionRenewalAction(formData: FormData) {
  const current = await session();
  await prisma.userSubscription.updateMany({ where: { id: value(formData, "id"), userId: current.user.id }, data: { cancelAtPeriodEnd: value(formData, "cancel") === "true" } });
  refresh();
}

export async function deleteBusinessOrderAction(formData: FormData) {
  const current = await session();
  await prisma.commerceOrder.deleteMany({ where: { id: value(formData, "id"), buyerId: current.user.id, status: { in: ["DRAFT", "CREATED", "CANCELLED"] } } });
  refresh();
}

export async function deleteWalletTransactionAction(formData: FormData) {
  const current = await session();
  await prisma.walletTransaction.deleteMany({ where: { id: value(formData, "id"), userId: current.user.id, pending: true, type: "HOLD" } });
  refresh();
}
