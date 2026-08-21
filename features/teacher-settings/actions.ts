"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { markAllTeacherNotificationsRead, setTeacherNotificationState } from "@/services/teacher-notification-service";

async function teacherSession() {
  const session = await auth();
  const roles = session?.user.roles ?? [];
  if (!session?.user.id || !session.user.institutionId || !roles.some((role) => ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"].includes(role))) {
    throw new Error("Teacher access required.");
  }
  const active = await prisma.user.count({ where: { id: session.user.id, institutionId: session.user.institutionId, status: "ACTIVE" } });
  if (!active) throw new Error("Teacher account unavailable.");
  return session;
}

export async function setTeacherNotificationStateAction(formData: FormData) {
  const session = await teacherSession();
  const parsed = z.object({ id: z.string().min(1).max(100), status: z.enum(["READ", "UNREAD"]) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await setTeacherNotificationState({ userId: session.user.id, institutionId: session.user.institutionId!, ...parsed.data });
  revalidatePath("/teacher/workspace/notifications");
}

export async function markAllTeacherNotificationsReadAction() {
  const session = await teacherSession();
  await markAllTeacherNotificationsRead(session.user.id, session.user.institutionId!);
  revalidatePath("/teacher/workspace/notifications");
}

export async function replyToTeacherSupportAction(formData: FormData) {
  const session = await teacherSession();
  const parsed = z.object({ ticketId: z.string().min(1).max(100), body: z.string().trim().min(2).max(3000) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const ticket = await prisma.supportTicket.findFirst({
    where: { id: parsed.data.ticketId, requesterId: session.user.id, institutionId: session.user.institutionId!, status: { notIn: ["CLOSED", "ARCHIVED"] } },
    select: { id: true }
  });
  if (!ticket) return;
  await prisma.$transaction([
    prisma.supportReply.create({ data: { ticketId: ticket.id, institutionId: session.user.institutionId!, authorId: session.user.id, body: parsed.data.body, internal: false } }),
    prisma.supportTicket.updateMany({ where: { id: ticket.id, requesterId: session.user.id, institutionId: session.user.institutionId! }, data: { status: "OPEN" } })
  ]);
  revalidatePath("/teacher/support");
}
