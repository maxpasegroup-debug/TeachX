import type { CommunicationChannel, GenericDiscussionScope } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { RoleKey } from "@/lib/constants/roles";
import { userHasPermission } from "@/lib/rbac";
import { getRecentActivities } from "@/services/activity-service";
import { getCommunicationCenter } from "@/services/communication-service";
import { getEmailConfig } from "@/lib/email/config";

export const notificationProviders = [
  { key: "in-app", label: "In-app", status: "Active architecture" },
  { key: "email", label: "Email", status: getEmailConfig().live ? "Transactional active" : "Not configured" },
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

type CommunityActor = {
  id: string;
  institutionId: string;
  roles: RoleKey[];
};

const emptyInbox = () => ({ notifications: [], bookingRequests: [], orders: [], announcements: [], conversations: [], system: [] });

async function authenticatedCommunityActor(): Promise<CommunityActor | null> {
  const session = await auth();
  if (!session?.user.id || !session.user.institutionId) return null;

  const user = await prisma.user.findFirst({
    where: { id: session.user.id, institutionId: session.user.institutionId, status: "ACTIVE" },
    select: { id: true, institutionId: true, roles: { select: { role: { select: { key: true } } } } }
  });
  if (!user?.institutionId) return null;

  return {
    id: user.id,
    institutionId: user.institutionId,
    roles: user.roles.map(({ role }) => role.key as RoleKey)
  };
}

async function authenticatedPersonalActor() {
  const session = await auth();
  if (!session?.user.id || session.user.institutionId) return null;

  return prisma.user.findFirst({
    where: { id: session.user.id, institutionId: null, status: "ACTIVE" },
    select: { id: true }
  });
}

export async function requireCommunityActor() {
  const actor = await authenticatedCommunityActor();
  if (!actor) throw new Error("Community access requires an active workspace.");
  return actor;
}

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

export async function getEnhancedNotificationCenter(query?: string) {
  const session = await auth();
  const userId = session?.user.id;
  const institutionId = session?.user.institutionId;
  if (!userId) return { unreadCount: 0, grouped: { today: [], yesterday: [], earlier: [] }, all: [], providers: notificationProviders };
  const contains = query ? { contains: query, mode: "insensitive" as const } : undefined;
  const notificationScope = institutionId ? [{ userId }, { userId: null, institutionId }] : [{ userId }];

  const all = await prisma.notification.findMany({
    where: {
      status: { not: "ARCHIVED" },
      AND: [
        { OR: notificationScope },
        ...(contains ? [{ OR: [{ title: contains }, { body: contains }] }] : [])
      ]
    },
    orderBy: { createdAt: "desc" },
    take: 80
  });

  return {
    unreadCount: all.filter((item) => item.status === "UNREAD").length,
    grouped: groupByRecency(all),
    all,
    query: query ?? "",
    providers: notificationProviders
  };
}

async function getGlobalInboxForActor({ id: userId, institutionId }: CommunityActor) {
  const notificationScope = institutionId ? [{ userId }, { userId: null, institutionId }] : [{ userId }];
  const announcementWhere = { OR: [{ userId }, { communication: { institutionId } }] };

  const [notifications, bookingRequests, orders, announcements, conversations, system] = await Promise.all([
    prisma.notification.findMany({ where: { OR: notificationScope, status: { not: "ARCHIVED" } }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.teacherBookingRequest.findMany({ where: { OR: [{ teacherId: userId }, { studentId: userId }] }, orderBy: { updatedAt: "desc" }, take: 20 }),
    prisma.commerceOrder.findMany({ where: { buyerId: userId }, include: { items: true }, orderBy: { updatedAt: "desc" }, take: 20 }),
    prisma.communicationRecipient.findMany({ where: announcementWhere, include: { communication: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.directConversation.findMany({ where: { institutionId, participants: { some: { userId, archivedAt: null } } }, include: { participants: { where: { user: { institutionId } }, include: { user: true } }, messages: { include: { sender: true }, orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" }, take: 20 }),
    prisma.activityEvent.findMany({ where: { institutionId }, orderBy: { createdAt: "desc" }, take: 20 })
  ]);

  return { notifications, bookingRequests, orders, announcements, conversations, system };
}

export async function getGlobalInbox() {
  const actor = await authenticatedCommunityActor();
  return actor ? getGlobalInboxForActor(actor) : emptyInbox();
}

export async function getCommunityOS(notificationQuery?: string) {
  const actor = await authenticatedCommunityActor();
  if (!actor) {
    // A teacher without a workspace must never read institution-owned Community
    // data. Their own private notifications remain safe and useful while they
    // complete onboarding.
    const personalActor = await authenticatedPersonalActor();
    if (personalActor) {
      return {
        communication: { communications: [], logs: [] },
        inbox: emptyInbox(),
        notifications: await getEnhancedNotificationCenter(notificationQuery),
        activities: [], requests: [], discussions: [], communities: [], templates: [], users: [],
        providers: notificationProviders, automationEvents
      };
    }

    return {
      communication: { communications: [], logs: [] },
      inbox: emptyInbox(),
      notifications: { unreadCount: 0, grouped: { today: [], yesterday: [], earlier: [] }, all: [], query: notificationQuery ?? "", providers: notificationProviders },
      activities: [], requests: [], discussions: [], communities: [], templates: [], users: [],
      providers: notificationProviders, automationEvents
    };
  }

  const { id: userId, institutionId } = actor;
  const canManageTemplates = userHasPermission(actor.roles, "settings.manage") || actor.roles.includes("ADMIN");
  const [communication, inbox, notifications, activities, requests, discussions, communities, templates, users] = await Promise.all([
    getCommunicationCenter(institutionId),
    getGlobalInboxForActor(actor),
    getEnhancedNotificationCenter(notificationQuery),
    getRecentActivities(institutionId, 24),
    prisma.teacherBookingRequest.findMany({ where: { OR: [{ teacherId: userId }, { studentId: userId }] }, orderBy: { updatedAt: "desc" }, take: 30 }),
    prisma.genericDiscussion.findMany({
      where: {
        institutionId, status: { not: "ARCHIVED" },
        OR: [{ communityId: null }, { community: { visibility: "PUBLIC" } }, { community: { createdById: userId } }, { community: { members: { some: { userId } } } }]
      },
      include: { author: true, replies: { include: { author: true }, orderBy: { createdAt: "desc" }, take: 3 }, community: true },
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }], take: 30
    }),
    prisma.community.findMany({
      where: { institutionId, OR: [{ visibility: "PUBLIC" }, { createdById: userId }, { members: { some: { userId } } }] },
      include: { members: { include: { user: true }, take: 6 }, _count: { select: { members: true, discussions: true } } },
      orderBy: { updatedAt: "desc" }, take: 30
    }),
    canManageTemplates ? prisma.notificationTemplate.findMany({ where: { institutionId }, orderBy: { updatedAt: "desc" }, take: 30 }) : [],
    prisma.user.findMany({ where: { institutionId, status: "ACTIVE" }, include: { teacherProfile: true, studentProfile: true }, orderBy: { name: "asc" }, take: 80 })
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

export async function createDirectConversation(input: { participantIds: string[]; title: string; body?: string; type?: "TEACHER_STUDENT" | "TEACHER_TEACHER" | "SUPPORT" }) {
  const actor = await requireCommunityActor();
  const requestedIds = Array.from(new Set(input.participantIds.filter((userId) => userId && userId !== actor.id)));
  const participants = await prisma.user.findMany({
    where: { id: { in: requestedIds }, institutionId: actor.institutionId, status: "ACTIVE" },
    select: { id: true }
  });
  if (!requestedIds.length || participants.length !== requestedIds.length) throw new Error("One or more conversation participants are unavailable.");
  const participantIds = [actor.id, ...participants.map(({ id }) => id)];
  const conversation = await prisma.directConversation.create({
    data: {
      institutionId: actor.institutionId,
      createdById: actor.id,
      title: input.title,
      type: input.type ?? "TEACHER_STUDENT",
      status: "REQUESTED",
      context: { realtime: "provider-agnostic-placeholder", attachments: "placeholder", typing: "placeholder", readReceipts: "placeholder" },
      participants: { create: participantIds.map((userId) => ({ userId, role: userId === actor.id ? "OWNER" : "MEMBER" })) },
      messages: input.body ? { create: { senderId: actor.id, body: input.body } } : undefined
    }
  });

  await prisma.notification.createMany({
    data: participantIds.filter((userId) => userId !== actor.id).map((userId) => ({
      institutionId: actor.institutionId,
      userId,
      title: "New message request",
      body: input.title,
      link: "/communication",
      metadata: { category: "MESSAGE", priority: "NORMAL" }
    }))
  });

  return conversation;
}

export async function ensureCanAccessConversation(conversationId: string) {
  const actor = await requireCommunityActor();
  return prisma.directConversation.findFirst({
    where: { id: conversationId, institutionId: actor.institutionId, participants: { some: { userId: actor.id, archivedAt: null } } },
    include: { participants: { where: { user: { institutionId: actor.institutionId, status: "ACTIVE" } } } }
  });
}

async function authorizedScopeId(actor: CommunityActor, scope: GenericDiscussionScope, scopeId?: string) {
  if (scope === "INSTITUTION") return actor.institutionId;
  if (!scopeId) return undefined;

  const authorized = scope === "SUBJECT"
    ? await prisma.subject.findFirst({ where: { id: scopeId, course: { institutionId: actor.institutionId } }, select: { id: true } })
    : scope === "COURSE"
      ? await prisma.course.findFirst({ where: { id: scopeId, institutionId: actor.institutionId }, select: { id: true } })
      : scope === "RESOURCE"
        ? await prisma.contentItem.findFirst({ where: { id: scopeId, institutionId: actor.institutionId, OR: [{ createdById: actor.id }, { status: "PUBLISHED", visibility: { in: ["PUBLIC", "TEACHERS"] } }] }, select: { id: true } })
        : scope === "TEACHER"
          ? await prisma.user.findFirst({ where: { id: scopeId, institutionId: actor.institutionId, status: "ACTIVE" }, select: { id: true } })
          : await prisma.supportTicket.findFirst({ where: { id: scopeId, institutionId: actor.institutionId, OR: [{ requesterId: actor.id }, { assignedToId: actor.id }] }, select: { id: true } });
  if (!authorized) throw new Error("The selected discussion scope is unavailable.");
  return authorized.id;
}

export async function createDiscussion(input: { title: string; body?: string; scope: GenericDiscussionScope; scopeId?: string; communityId?: string; pinned?: boolean }) {
  const actor = await requireCommunityActor();
  if (input.communityId) {
    const community = await prisma.community.findFirst({
      where: { id: input.communityId, institutionId: actor.institutionId, status: "ACTIVE", members: { some: { userId: actor.id } } },
      select: { id: true }
    });
    if (!community) throw new Error("The selected community is unavailable.");
  }
  const scopeId = await authorizedScopeId(actor, input.scope, input.scopeId);
  return prisma.genericDiscussion.create({
    data: {
      institutionId: actor.institutionId,
      authorId: actor.id,
      title: input.title,
      body: input.body,
      scope: input.scope,
      scopeId,
      communityId: input.communityId,
      status: input.pinned ? "PINNED" : "OPEN",
      isPinned: input.pinned ?? false
    }
  });
}

export async function createDiscussionReply(input: { discussionId: string; body: string }) {
  const actor = await requireCommunityActor();
  const discussion = await prisma.genericDiscussion.findFirst({
    where: {
      id: input.discussionId, institutionId: actor.institutionId, isLocked: false, status: { not: "ARCHIVED" },
      OR: [{ communityId: null }, { community: { visibility: "PUBLIC" } }, { community: { createdById: actor.id } }, { community: { members: { some: { userId: actor.id } } } }]
    },
    select: { id: true }
  });
  if (!discussion) throw new Error("The discussion is unavailable.");
  await prisma.genericDiscussionReply.create({ data: { discussionId: discussion.id, authorId: actor.id, body: input.body } });
  await prisma.genericDiscussion.updateMany({ where: { id: discussion.id, institutionId: actor.institutionId }, data: { updatedAt: new Date() } });
}

export async function createCommunity(input: { name: string; description?: string; type: "TEACHER_GROUP" | "STUDY_GROUP" | "INSTITUTION" | "INTEREST" | "SUPPORT"; visibility?: "PRIVATE" | "INVITE_ONLY" | "PUBLIC" }) {
  const actor = await requireCommunityActor();
  return prisma.community.create({
    data: {
      institutionId: actor.institutionId,
      createdById: actor.id,
      name: input.name,
      description: input.description,
      type: input.type,
      visibility: input.visibility ?? "INVITE_ONLY",
      members: { create: { userId: actor.id, role: "OWNER" } },
      metadata: { realtime: "not-enabled", moderation: "queue-ready" }
    }
  });
}

export async function createNotificationTemplate(input: { key: string; name: string; category: string; channel: CommunicationChannel; subject?: string; body: string }) {
  const actor = await requireCommunityActor();
  if (!userHasPermission(actor.roles, "settings.manage") && !actor.roles.includes("ADMIN")) throw new Error("Notification template permission is required.");
  const existing = await prisma.notificationTemplate.findFirst({ where: { institutionId: actor.institutionId, key: input.key, channel: input.channel } });
  if (existing) {
    await prisma.notificationTemplate.updateMany({
      where: { id: existing.id, institutionId: actor.institutionId },
      data: { name: input.name, category: input.category, subject: input.subject, body: input.body, isActive: true }
    });
    return prisma.notificationTemplate.findFirstOrThrow({ where: { id: existing.id, institutionId: actor.institutionId } });
  }

  return prisma.notificationTemplate.create({
    data: {
      institutionId: actor.institutionId,
      createdById: actor.id,
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
