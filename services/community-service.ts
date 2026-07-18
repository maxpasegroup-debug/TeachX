import type { CommunicationChannel, GenericDiscussionScope } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getRecentActivities } from "@/services/activity-service";
import { getCommunicationCenter } from "@/services/communication-service";

export const notificationProviders = [
  { key: "in-app", label: "In-app", status: "Active architecture" },
  { key: "email", label: "Email", status: "Provider placeholder" },
  { key: "whatsapp", label: "WhatsApp", status: "Provider placeholder" },
  { key: "push", label: "Push", status: "Provider placeholder" },
  { key: "sms", label: "SMS", status: "Provider placeholder" }
];

export const automationEvents = [
  "booking.accepted",
  "resource.published",
  "subscription.expires",
  "credits.low",
  "order.completed",
  "teacher.reply",
  "student.request"
];

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfYesterday() {
  const date = startOfToday();
  date.setDate(date.getDate() - 1);
  return date;
}

export function groupByRecency<T extends { createdAt: Date }>(items: T[]) {
  const today = startOfToday();
  const yesterday = startOfYesterday();
  return {
    today: items.filter((item) => item.createdAt >= today),
    yesterday: items.filter((item) => item.createdAt >= yesterday && item.createdAt < today),
    earlier: items.filter((item) => item.createdAt < yesterday)
  };
}

export async function getEnhancedNotificationCenter(userId?: string, institutionId?: string | null, query?: string) {
  if (!userId) return { unreadCount: 0, grouped: { today: [], yesterday: [], earlier: [] }, all: [], providers: notificationProviders };
  const contains = query ? { contains: query, mode: "insensitive" as const } : undefined;

  const all = await prisma.notification.findMany({
    where: {
      OR: [{ userId }, { userId: null, institutionId }],
      status: { not: "ARCHIVED" },
      ...(contains ? { OR: [{ title: contains }, { body: contains }] } : {})
    },
    orderBy: { createdAt: "desc" },
    take: 80
  });

  return {
    unreadCount: all.filter((item) => item.status === "UNREAD").length,
    grouped: groupByRecency(all),
    all,
    providers: notificationProviders
  };
}

export async function getGlobalInbox(userId?: string, institutionId?: string | null) {
  if (!userId) return { notifications: [], bookingRequests: [], orders: [], announcements: [], conversations: [], system: [] };
  const notificationScope = institutionId ? [{ userId }, { userId: null, institutionId }] : [{ userId }];
  const announcementWhere = institutionId ? { OR: [{ userId }, { communication: { institutionId } }] } : { userId };

  const [notifications, bookingRequests, orders, announcements, conversations, system] = await Promise.all([
    prisma.notification.findMany({ where: { OR: notificationScope, status: { not: "ARCHIVED" } }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.teacherBookingRequest.findMany({ where: { OR: [{ teacherId: userId }, { studentId: userId }] }, orderBy: { updatedAt: "desc" }, take: 20 }),
    prisma.commerceOrder.findMany({ where: { buyerId: userId }, include: { items: true }, orderBy: { updatedAt: "desc" }, take: 20 }),
    prisma.communicationRecipient.findMany({ where: announcementWhere, include: { communication: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.directConversation.findMany({ where: { participants: { some: { userId, archivedAt: null } } }, include: { participants: { include: { user: true } }, messages: { include: { sender: true }, orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" }, take: 20 }),
    prisma.activityEvent.findMany({ where: { institutionId }, orderBy: { createdAt: "desc" }, take: 20 })
  ]);

  return { notifications, bookingRequests, orders, announcements, conversations, system };
}

export async function getCommunityOS(input: { userId?: string; institutionId?: string | null; roles?: string[] }) {
  const [communication, inbox, notifications, activities, requests, discussions, communities, templates, users] = await Promise.all([
    getCommunicationCenter(input.institutionId),
    getGlobalInbox(input.userId, input.institutionId),
    getEnhancedNotificationCenter(input.userId, input.institutionId),
    getRecentActivities(input.institutionId, 24),
    input.userId ? prisma.teacherBookingRequest.findMany({ where: { OR: [{ teacherId: input.userId }, { studentId: input.userId }] }, orderBy: { updatedAt: "desc" }, take: 30 }) : [],
    prisma.genericDiscussion.findMany({ where: { institutionId: input.institutionId ?? undefined }, include: { author: true, replies: { include: { author: true }, orderBy: { createdAt: "desc" }, take: 3 }, community: true }, orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }], take: 30 }),
    prisma.community.findMany({ where: { institutionId: input.institutionId ?? undefined }, include: { members: { include: { user: true }, take: 6 }, _count: { select: { members: true, discussions: true } } }, orderBy: { updatedAt: "desc" }, take: 30 }),
    prisma.notificationTemplate.findMany({ where: { institutionId: input.institutionId ?? undefined }, orderBy: { updatedAt: "desc" }, take: 30 }),
    prisma.user.findMany({ where: { institutionId: input.institutionId ?? undefined }, include: { teacherProfile: true, studentProfile: true }, orderBy: { name: "asc" }, take: 80 })
  ]);

  return {
    communication,
    inbox,
    notifications,
    activities,
    requests,
    discussions,
    communities,
    templates,
    users,
    providers: notificationProviders,
    automationEvents
  };
}

export async function createDirectConversation(input: { institutionId?: string | null; createdById: string; participantIds: string[]; title: string; body?: string; type?: "TEACHER_STUDENT" | "TEACHER_TEACHER" | "SUPPORT" }) {
  const participantIds = Array.from(new Set([input.createdById, ...input.participantIds]));
  const conversation = await prisma.directConversation.create({
    data: {
      institutionId: input.institutionId ?? undefined,
      createdById: input.createdById,
      title: input.title,
      type: input.type ?? "TEACHER_STUDENT",
      status: "REQUESTED",
      context: { realtime: "provider-agnostic-placeholder", attachments: "placeholder", typing: "placeholder", readReceipts: "placeholder" },
      participants: { create: participantIds.map((userId) => ({ userId, role: userId === input.createdById ? "OWNER" : "MEMBER" })) },
      messages: input.body ? { create: { senderId: input.createdById, body: input.body } } : undefined
    }
  });

  await prisma.notification.createMany({
    data: participantIds.filter((userId) => userId !== input.createdById).map((userId) => ({
      institutionId: input.institutionId ?? undefined,
      userId,
      title: "New message request",
      body: input.title,
      link: "/communication",
      metadata: { category: "MESSAGE", priority: "NORMAL" }
    }))
  });

  return conversation;
}

export async function ensureCanAccessConversation(userId: string, conversationId: string) {
  return prisma.directConversation.findFirst({
    where: { id: conversationId, participants: { some: { userId, archivedAt: null } } },
    include: { participants: true }
  });
}

export async function createDiscussion(input: { institutionId?: string | null; authorId?: string; title: string; body?: string; scope: GenericDiscussionScope; scopeId?: string; communityId?: string; pinned?: boolean }) {
  return prisma.genericDiscussion.create({
    data: {
      institutionId: input.institutionId ?? undefined,
      authorId: input.authorId,
      title: input.title,
      body: input.body,
      scope: input.scope,
      scopeId: input.scopeId,
      communityId: input.communityId,
      status: input.pinned ? "PINNED" : "OPEN",
      isPinned: input.pinned ?? false
    }
  });
}

export async function createCommunity(input: { institutionId?: string | null; createdById?: string; name: string; description?: string; type: "TEACHER_GROUP" | "STUDY_GROUP" | "INSTITUTION" | "INTEREST" | "SUPPORT"; visibility?: "PRIVATE" | "INVITE_ONLY" | "PUBLIC" }) {
  return prisma.community.create({
    data: {
      institutionId: input.institutionId ?? undefined,
      createdById: input.createdById,
      name: input.name,
      description: input.description,
      type: input.type,
      visibility: input.visibility ?? "INVITE_ONLY",
      members: input.createdById ? { create: { userId: input.createdById, role: "OWNER" } } : undefined,
      metadata: { realtime: "not-enabled", moderation: "queue-ready" }
    }
  });
}

export async function createNotificationTemplate(input: { institutionId?: string | null; createdById?: string; key: string; name: string; category: string; channel: CommunicationChannel; subject?: string; body: string }) {
  const existing = await prisma.notificationTemplate.findFirst({ where: { institutionId: input.institutionId ?? undefined, key: input.key, channel: input.channel } });
  if (existing) {
    return prisma.notificationTemplate.update({
      where: { id: existing.id },
      data: { name: input.name, category: input.category, subject: input.subject, body: input.body, isActive: true }
    });
  }

  return prisma.notificationTemplate.create({
    data: {
      institutionId: input.institutionId ?? undefined,
      createdById: input.createdById,
      key: input.key,
      name: input.name,
      category: input.category,
      channel: input.channel,
      subject: input.subject,
      body: input.body,
      variables: { placeholders: ["name", "resource", "date", "amount"] }
    }
  });
}
