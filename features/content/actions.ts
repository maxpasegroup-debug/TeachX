"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { userHasPermission } from "@/lib/rbac";
import { recordActivity } from "@/services/activity-service";
import { createModuleNotification } from "@/services/notification-aggregation-service";
import { archiveContent, duplicateContent, publishContent } from "@/services/publishing-service";
import { approveContent, reviewContent } from "@/services/review-service";
import { createContentUpload } from "@/services/upload-service";

function text(value: FormDataEntryValue | null) {
  const data = value?.toString().trim();
  return data || undefined;
}

async function getContentSession(manage = true) {
  const session = await auth();
  const institutionId = session?.user.institutionId;
  if (!session?.user || !institutionId) throw new Error("Institution is required.");
  if (manage && !userHasPermission(session.user.roles, "content.manage")) throw new Error("You do not have content access.");
  return { session, institutionId };
}

const uploadSchema = z.object({
  courseId: z.string().min(1),
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  topicId: z.string().optional(),
  classroomId: z.string().optional(),
  batchId: z.string().optional(),
  title: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(["VIDEO", "PDF", "PPT", "IMAGE", "AUDIO", "ZIP", "EXTERNAL_LINK", "DOCUMENT", "NOTES", "WORKSHEET", "QUESTION_PAPER", "ANSWER_KEY", "REFERENCE"]),
  fileUrl: z.string().optional(),
  externalUrl: z.string().optional(),
  status: z.enum(["DRAFT", "SUBMITTED", "PUBLISHED"])
});

export async function createContentAction(_: string | undefined, formData: FormData) {
  const { session, institutionId } = await getContentSession();
  const parsed = uploadSchema.safeParse({
    courseId: text(formData.get("courseId")),
    subjectId: text(formData.get("subjectId")),
    chapterId: text(formData.get("chapterId")),
    topicId: text(formData.get("topicId")),
    classroomId: text(formData.get("classroomId")),
    batchId: text(formData.get("batchId")),
    title: text(formData.get("title")),
    description: text(formData.get("description")),
    type: text(formData.get("type")) ?? "NOTES",
    fileUrl: text(formData.get("fileUrl")),
    externalUrl: text(formData.get("externalUrl")),
    status: text(formData.get("status")) ?? "DRAFT"
  });
  if (!parsed.success) return "Enter content title, course, type and status.";

  const content = await createContentUpload({ institutionId, createdById: session.user.id, ...parsed.data });
  await writeAuditLog({ institutionId, actorId: session.user.id, action: "CREATE", entity: "ContentItem", entityId: content.id, message: `Created content ${content.title}` });
  await recordActivity({ institutionId, actorId: session.user.id, type: "CONTENT", title: `Content saved: ${content.title}`, entity: "ContentItem", entityId: content.id, link: "/content-studio" });
  await createModuleNotification({ institutionId, type: "CONTENT", title: "Content saved", body: content.title, link: "/content-studio" });
  revalidatePath("/content-studio");
  return "Content saved.";
}

export async function createContentFolderAction(_: string | undefined, formData: FormData) {
  const { institutionId } = await getContentSession();
  const name = text(formData.get("name"));
  if (!name) return "Folder name is required.";

  await prisma.contentFolder.create({
    data: {
      institutionId,
      name,
      courseId: text(formData.get("courseId")),
      subjectId: text(formData.get("subjectId")),
      chapterId: text(formData.get("chapterId")),
      topicId: text(formData.get("topicId"))
    }
  });
  revalidatePath("/content-studio");
  return "Folder created.";
}

export async function submitContentReviewAction(_: string | undefined, formData: FormData) {
  const { institutionId } = await getContentSession();
  const itemId = text(formData.get("itemId"));
  if (!itemId) return "Content item is required.";

  await prisma.contentItem.update({ where: { id: itemId, institutionId }, data: { status: "SUBMITTED" } });
  revalidatePath("/content-studio");
  return "Submitted for review.";
}

export async function reviewContentAction(_: string | undefined, formData: FormData) {
  const { session } = await getContentSession();
  const itemId = text(formData.get("itemId"));
  const decision = text(formData.get("decision"));
  if (!itemId || !decision) return "Select review decision.";

  await reviewContent({ itemId, reviewerId: session.user.id, decision: decision as "APPROVED" | "REJECTED" | "RETURNED" | "NEEDS_CHANGES", notes: text(formData.get("notes")) });
  await recordActivity({ institutionId: session.user.institutionId, actorId: session.user.id, type: "CONTENT", title: `Content review ${decision.toLowerCase().replaceAll("_", " ")}`, entity: "ContentItem", entityId: itemId, link: "/content-studio" });
  await createModuleNotification({ institutionId: session.user.institutionId, type: "CONTENT", title: "Content review updated", body: decision, link: "/content-studio" });
  revalidatePath("/content-studio");
  return "Review saved.";
}

export async function approveContentAction(_: string | undefined, formData: FormData) {
  const { session } = await getContentSession();
  const itemId = text(formData.get("itemId"));
  const decision = text(formData.get("decision"));
  if (!itemId || !decision) return "Select approval decision.";

  await approveContent({ itemId, approverId: session.user.id, decision: decision as "APPROVED" | "REJECTED" | "RETURNED" | "NEEDS_CHANGES", notes: text(formData.get("notes")) });
  await recordActivity({ institutionId: session.user.institutionId, actorId: session.user.id, type: "CONTENT", title: `Content approval ${decision.toLowerCase().replaceAll("_", " ")}`, entity: "ContentItem", entityId: itemId, link: "/content-studio" });
  await createModuleNotification({ institutionId: session.user.institutionId, type: "CONTENT", title: "Content approval updated", body: decision, link: "/content-studio" });
  revalidatePath("/content-studio");
  return "Approval saved.";
}

export async function publishContentAction(_: string | undefined, formData: FormData) {
  await getContentSession();
  const itemId = text(formData.get("itemId"));
  if (!itemId) return "Content item is required.";

  const item = await publishContent(itemId);
  await recordActivity({ institutionId: item.institutionId, type: "CONTENT", title: `Published content: ${item.title}`, entity: "ContentItem", entityId: item.id, link: "/content-studio" });
  await createModuleNotification({ institutionId: item.institutionId, type: "CONTENT", title: "Content published", body: item.title, link: "/learning" });
  revalidatePath("/content-studio");
  return "Published to students.";
}

export async function archiveContentAction(_: string | undefined, formData: FormData) {
  await getContentSession();
  const itemId = text(formData.get("itemId"));
  if (!itemId) return "Content item is required.";

  await archiveContent(itemId);
  revalidatePath("/content-studio");
  return "Content archived.";
}

export async function duplicateContentAction(_: string | undefined, formData: FormData) {
  const { session } = await getContentSession();
  const itemId = text(formData.get("itemId"));
  if (!itemId) return "Content item is required.";

  await duplicateContent(itemId, session.user.id);
  revalidatePath("/content-studio");
  return "Content duplicated as draft.";
}
