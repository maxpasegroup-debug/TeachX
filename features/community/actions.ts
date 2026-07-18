"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { userHasPermission } from "@/lib/rbac";
import { recordActivity } from "@/services/activity-service";
import { createCommunity, createDirectConversation, createDiscussion, createNotificationTemplate, ensureCanAccessConversation } from "@/services/community-service";
import { createCommunication } from "@/services/communication-service";
import { prisma } from "@/lib/db";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function values(formData: FormData, key: string) {
  return value(formData, key).split(",").map((item) => item.trim()).filter(Boolean);
}

async function requireSession() {
  const session = await auth();
  if (!session?.user.id) throw new Error("Sign in required.");
  return session;
}

export async function publishCommunityAnnouncementAction(formData: FormData) {
  const session = await requireSession();
  const institutionId = session.user.institutionId;
  const title = value(formData, "title");
  const body = value(formData, "body");
  if (!institutionId || !title || !body) return;

  const audience = value(formData, "audience") || "Everyone";
  const status = value(formData, "intent") === "draft" ? "DRAFT" : value(formData, "intent") === "archive" ? "EXPIRED" : "SENT";
  const scheduledAt = value(formData, "scheduledAt") ? new Date(value(formData, "scheduledAt")) : undefined;

  const communication = await createCommunication({
    institutionId,
    createdById: session.user.id,
    kind: "ANNOUNCEMENT",
    title,
    body,
    priority: (value(formData, "priority") || "NORMAL") as never,
    channels: ["IN_APP"],
    roleKey: audience === "My Students" ? "STUDENT" : audience === "Everyone" ? undefined : value(formData, "roleKey") || undefined,
    courseId: value(formData, "courseId") || undefined,
    batchId: value(formData, "batchId") || undefined,
    scheduledAt,
    attachmentUrl: value(formData, "attachmentUrl") || undefined
  });

  await prisma.communication.update({ where: { id: communication.id }, data: { status: status as never, metadata: { audience, pinned: formData.get("pinned") === "on", attachmentsPlaceholder: true } } });
  await recordActivity({ institutionId, actorId: session.user.id, type: "ANNOUNCEMENT", title: `Announcement ${status.toLowerCase()}: ${title}`, entity: "Communication", entityId: communication.id, link: "/communication" });

  revalidatePath("/communication");
  revalidatePath("/admin/announcements");
}

export async function updateBookingWorkflowAction(formData: FormData) {
  const session = await requireSession();
  const requestId = value(formData, "requestId");
  const status = value(formData, "status");
  if (!requestId || !status) return;

  const request = await prisma.teacherBookingRequest.findFirst({ where: { id: requestId, OR: [{ teacherId: session.user.id }, { studentId: session.user.id }] } });
  if (!request) return;

  const history = Array.isArray(request.history) ? request.history : [];
  const nextHistory = [...history, { status, actorId: session.user.id, at: new Date().toISOString(), note: value(formData, "note") || undefined }];
  await prisma.teacherBookingRequest.update({
    where: { id: request.id },
    data: {
      status,
      teacherNotes: value(formData, "teacherNotes") || request.teacherNotes,
      studentNotes: value(formData, "studentNotes") || request.studentNotes,
      history: nextHistory
    }
  });

  const recipientId = session.user.id === request.teacherId ? request.studentId : request.teacherId;
  await prisma.notification.create({ data: { userId: recipientId, institutionId: session.user.institutionId, title: "Booking request updated", body: `${request.subject} is now ${status}.`, link: "/communication", metadata: { category: "BOOKING", priority: "HIGH" } } });
  await recordActivity({ institutionId: session.user.institutionId, actorId: session.user.id, type: "SYSTEM", title: `Booking ${status.toLowerCase()}`, body: request.subject, entity: "TeacherBookingRequest", entityId: request.id, link: "/communication" });
  revalidatePath("/communication");
  revalidatePath("/teacher/marketplace");
  revalidatePath("/student/teachers");
}

export async function createMessageRequestAction(formData: FormData) {
  const session = await requireSession();
  const participantIds = values(formData, "participantIds");
  const title = value(formData, "title") || "TeachX conversation";
  if (!participantIds.length) return;

  await createDirectConversation({
    institutionId: session.user.institutionId,
    createdById: session.user.id,
    participantIds,
    title,
    body: value(formData, "body") || undefined,
    type: (value(formData, "type") || "TEACHER_STUDENT") as never
  });
  revalidatePath("/communication");
}

export async function sendDirectMessageAction(formData: FormData) {
  const session = await requireSession();
  const conversationId = value(formData, "conversationId");
  const body = value(formData, "body");
  if (!conversationId || !body) return;

  const conversation = await ensureCanAccessConversation(session.user.id, conversationId);
  if (!conversation) return;

  await prisma.directMessage.create({ data: { conversationId, senderId: session.user.id, body, attachments: { placeholder: value(formData, "attachmentUrl") || undefined } } });
  await prisma.directConversation.update({ where: { id: conversationId }, data: { status: "ACTIVE" } });
  const recipients = conversation.participants.filter((item) => item.userId !== session.user.id);
  await prisma.notification.createMany({
    data: recipients.map((item) => ({ userId: item.userId, institutionId: session.user.institutionId, title: "New message", body: conversation.title, link: "/communication", metadata: { category: "MESSAGE", priority: "NORMAL" } }))
  });
  revalidatePath("/communication");
}

export async function createDiscussionAction(formData: FormData) {
  const session = await requireSession();
  const title = value(formData, "title");
  if (!title) return;

  await createDiscussion({
    institutionId: session.user.institutionId,
    authorId: session.user.id,
    title,
    body: value(formData, "body") || undefined,
    scope: (value(formData, "scope") || "INSTITUTION") as never,
    scopeId: value(formData, "scopeId") || undefined,
    communityId: value(formData, "communityId") || undefined,
    pinned: formData.get("pinned") === "on"
  });
  revalidatePath("/communication");
}

export async function replyToDiscussionAction(formData: FormData) {
  const session = await requireSession();
  const discussionId = value(formData, "discussionId");
  const body = value(formData, "body");
  if (!discussionId || !body) return;

  const discussion = await prisma.genericDiscussion.findFirst({ where: { id: discussionId, isLocked: false, status: { not: "ARCHIVED" } } });
  if (!discussion) return;
  await prisma.genericDiscussionReply.create({ data: { discussionId, authorId: session.user.id, body } });
  await prisma.genericDiscussion.update({ where: { id: discussionId }, data: { updatedAt: new Date() } });
  revalidatePath("/communication");
}

export async function createCommunityAction(formData: FormData) {
  const session = await requireSession();
  const name = value(formData, "name");
  if (!name) return;

  await createCommunity({
    institutionId: session.user.institutionId,
    createdById: session.user.id,
    name,
    description: value(formData, "description") || undefined,
    type: (value(formData, "type") || "INTEREST") as never,
    visibility: (value(formData, "visibility") || "INVITE_ONLY") as never
  });
  revalidatePath("/communication");
  revalidatePath("/admin/communities");
}

export async function createNotificationTemplateAction(formData: FormData) {
  const session = await requireSession();
  if (!userHasPermission(session.user.roles, "settings.manage") && !session.user.roles.includes("ADMIN")) return;
  const key = value(formData, "key");
  const body = value(formData, "body");
  if (!key || !body) return;

  await createNotificationTemplate({
    institutionId: session.user.institutionId,
    createdById: session.user.id,
    key,
    name: value(formData, "name") || key,
    category: value(formData, "category") || "System",
    channel: (value(formData, "channel") || "IN_APP") as never,
    subject: value(formData, "subject") || undefined,
    body
  });
  revalidatePath("/admin/notification-templates");
}

export async function markAllNotificationsReadAction() {
  const session = await requireSession();
  await prisma.notification.updateMany({ where: { userId: session.user.id, status: "UNREAD" }, data: { status: "READ", readAt: new Date() } });
  revalidatePath("/communication");
}

export async function archiveNotificationFromInboxAction(formData: FormData) {
  const session = await requireSession();
  const notificationId = value(formData, "notificationId");
  if (!notificationId) return;
  await prisma.notification.updateMany({ where: { id: notificationId, userId: session.user.id }, data: { status: "ARCHIVED" } });
  revalidatePath("/communication");
}
