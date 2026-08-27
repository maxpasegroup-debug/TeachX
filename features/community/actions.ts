"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { recordActivity } from "@/services/activity-service";
import { createCommunity, createDirectConversation, createDiscussion, createDiscussionReply, createNotificationTemplate, ensureCanAccessConversation, requireCommunityActor } from "@/services/community-service";
import { createCommunication } from "@/services/communication-service";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { userHasPermission } from "@/lib/rbac";

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
  const actor = await requireCurrentUser();
  const institutionId = actor.institutionId;
  const title = value(formData, "title");
  const body = value(formData, "body");
  if (!institutionId || (!userHasPermission(actor.roles, "operations.view") && !userHasPermission(actor.roles, "classrooms.manage")) || !title || !body) throw new Error("Announcement publishing permission is required.");

  const audience = value(formData, "audience") || "Everyone";
  const status = value(formData, "intent") === "draft" ? "DRAFT" : value(formData, "intent") === "archive" ? "EXPIRED" : "SENT";
  const scheduledAt = value(formData, "scheduledAt") ? new Date(value(formData, "scheduledAt")) : undefined;

  const communication = await createCommunication({
    institutionId,
    createdById: actor.id,
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
  await recordActivity({ institutionId, actorId: actor.id, type: "ANNOUNCEMENT", title: `Announcement ${status.toLowerCase()}: ${title}`, entity: "Communication", entityId: communication.id, link: "/communication" });

  revalidatePath("/communication");
  revalidatePath("/admin/announcements");
}

export async function updateBookingWorkflowAction(formData: FormData) {
  const actor = await requireCurrentUser();
  if (!actor.institutionId) throw new Error("Institution context is required.");
  const requestId = value(formData, "requestId");
  const status = value(formData, "status");
  if (!requestId || !status) return;

  const request = await prisma.teacherBookingRequest.findFirst({ where: { id: requestId, teacherProfile: { user: { institutionId: actor.institutionId } }, OR: [{ teacherId: actor.id }, { studentId: actor.id }] } });
  if (!request) throw new Error("Authorized booking request not found.");
  const isTeacher = actor.id === request.teacherId;
  const transitions: Record<string, string[]> = isTeacher
    ? { PENDING: ["ACCEPTED", "REJECTED"], ACCEPTED: ["COMPLETED", "CANCELLED"] }
    : { PENDING: ["CANCELLED"], ACCEPTED: ["CANCELLED"] };
  if (!transitions[request.status]?.includes(status)) throw new Error("This booking status change is not allowed.");

  const history = Array.isArray(request.history) ? request.history : [];
  const nextHistory = [...history, { status, actorId: actor.id, at: new Date().toISOString(), note: value(formData, "note") || undefined }];
  await prisma.teacherBookingRequest.update({
    where: { id: request.id },
    data: {
      status,
      teacherNotes: isTeacher ? value(formData, "teacherNotes") || request.teacherNotes : request.teacherNotes,
      studentNotes: isTeacher ? request.studentNotes : value(formData, "studentNotes") || request.studentNotes,
      history: nextHistory
    }
  });

  const recipientId = actor.id === request.teacherId ? request.studentId : request.teacherId;
  await prisma.notification.create({ data: { userId: recipientId, institutionId: actor.institutionId, title: "Booking request updated", body: `${request.subject} is now ${status}.`, link: "/communication", metadata: { category: "BOOKING", priority: "HIGH" } } });
  await recordActivity({ institutionId: actor.institutionId, actorId: actor.id, type: "SYSTEM", title: `Booking ${status.toLowerCase()}`, body: request.subject, entity: "TeacherBookingRequest", entityId: request.id, link: "/communication" });
  revalidatePath("/communication");
  revalidatePath("/teacher/business/marketplace");
  revalidatePath("/student/teachers");
}

export async function createMessageRequestAction(formData: FormData) {
  const participantIds = values(formData, "participantIds");
  const title = value(formData, "title") || "TeachX conversation";
  if (!participantIds.length) return;

  await createDirectConversation({
    participantIds,
    title,
    body: value(formData, "body") || undefined,
    type: (value(formData, "type") || "TEACHER_STUDENT") as never
  });
  revalidatePath("/communication");
}

export async function sendDirectMessageAction(formData: FormData) {
  const actor = await requireCommunityActor();
  const conversationId = value(formData, "conversationId");
  const body = value(formData, "body");
  if (!conversationId || !body) return;

  const conversation = await ensureCanAccessConversation(conversationId);
  if (!conversation) return;

  await prisma.directMessage.create({ data: { conversationId, senderId: actor.id, body, attachments: { placeholder: value(formData, "attachmentUrl") || undefined } } });
  await prisma.directConversation.updateMany({ where: { id: conversationId, institutionId: actor.institutionId }, data: { status: "ACTIVE" } });
  const recipients = conversation.participants.filter((item) => item.userId !== actor.id);
  await prisma.notification.createMany({
    data: recipients.map((item) => ({ userId: item.userId, institutionId: actor.institutionId, title: "New message", body: conversation.title, link: "/communication", metadata: { category: "MESSAGE", priority: "NORMAL" } }))
  });
  revalidatePath("/communication");
}

export async function createDiscussionAction(formData: FormData) {
  const title = value(formData, "title");
  if (!title) return;

  await createDiscussion({
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
  const discussionId = value(formData, "discussionId");
  const body = value(formData, "body");
  if (!discussionId || !body) return;

  await createDiscussionReply({ discussionId, body });
  revalidatePath("/communication");
}

export async function createCommunityAction(formData: FormData) {
  const name = value(formData, "name");
  if (!name) return;

  await createCommunity({
    name,
    description: value(formData, "description") || undefined,
    type: (value(formData, "type") || "INTEREST") as never,
    visibility: (value(formData, "visibility") || "INVITE_ONLY") as never
  });
  revalidatePath("/communication");
  revalidatePath("/admin/communities");
}

export async function createNotificationTemplateAction(formData: FormData) {
  const key = value(formData, "key");
  const body = value(formData, "body");
  if (!key || !body) return;

  await createNotificationTemplate({
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
