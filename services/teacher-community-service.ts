import { prisma } from "@/lib/db";

export const teacherCommunityModules = ["home", "discussions", "groups", "network", "messages", "collaboration", "resources", "bookmarks", "notifications", "activity"] as const;
export type TeacherCommunityModule = (typeof teacherCommunityModules)[number];

const teacherRoles = ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"];
const favoriteTypes = ["community-post", "community-discussion", "community-resource", "community-save-later", "teacher-follow", "teacher-connection", "teacher-connection-request"];

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function list(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

export async function getTeacherCommunityData(
  userId?: string,
  institutionId?: string | null,
  options: { page?: number; pageSize?: number } = {}
) {
  if (!userId || !institutionId) return null;
  const member = await prisma.user.findFirst({
    where: { id: userId, institutionId, status: "ACTIVE", roles: { some: { role: { key: { in: teacherRoles } } } } },
    select: { id: true }
  });
  if (!member) return null;

  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(30, Math.max(12, options.pageSize ?? 24));
  const skip = (page - 1) * pageSize;
  const take = pageSize + 1;
  const activitySince = new Date();
  activitySince.setDate(activitySince.getDate() - 90);

  const [discussionRows, groupRows, teacherRows, conversationRows, resourceRows, favorites, notifications, activityRows, collaborations] = await Promise.all([
    prisma.genericDiscussion.findMany({
      where: {
        institutionId, status: { not: "ARCHIVED" },
        OR: [{ communityId: null }, { community: { visibility: "PUBLIC" } }, { community: { members: { some: { userId } } } }]
      },
      include: {
        author: { include: { teacherProfile: true } }, community: true,
        replies: { include: { author: true }, orderBy: { createdAt: "desc" }, take: 30 }
      },
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }], skip, take
    }),
    prisma.community.findMany({
      where: {
        institutionId, type: "TEACHER_GROUP", status: "ACTIVE",
        OR: [{ visibility: "PUBLIC" }, { createdById: userId }, { members: { some: { userId } } }]
      },
      include: {
        createdBy: true,
        members: { include: { user: true }, orderBy: { joinedAt: "asc" }, take: 30 },
        discussions: { where: { status: { not: "ARCHIVED" } }, take: 6, orderBy: { updatedAt: "desc" } }
      },
      orderBy: { updatedAt: "desc" }, skip, take
    }),
    prisma.teacherProfile.findMany({
      where: {
        userId: { not: userId },
        user: { institutionId, status: "ACTIVE", roles: { some: { role: { key: { in: teacherRoles } } } } }
      },
      include: { user: { include: { profile: true } } }, orderBy: { updatedAt: "desc" }, skip, take
    }),
    prisma.directConversation.findMany({
      where: { institutionId, participants: { some: { userId } } },
      include: {
        participants: { include: { user: true } },
        messages: { include: { sender: true }, orderBy: { createdAt: "desc" }, take: 50 }
      },
      orderBy: { updatedAt: "desc" }, skip, take
    }),
    prisma.contentItem.findMany({
      where: { institutionId, status: "PUBLISHED", visibility: { in: ["PUBLIC", "TEACHERS"] } },
      include: { createdBy: true, course: true, subject: true, analytics: true, downloads: true },
      orderBy: { updatedAt: "desc" }, skip, take
    }),
    prisma.favoriteItem.findMany({ where: { userId, type: { in: favoriteTypes } }, orderBy: { createdAt: "desc" }, take: 250 }),
    prisma.notification.findMany({ where: { userId, institutionId, status: { not: "ARCHIVED" } }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.activity.findMany({
      where: {
        institutionId, createdAt: { gte: activitySince },
        metadata: { path: ["communityType"], string_contains: "" }
      },
      include: { actor: true }, orderBy: { createdAt: "desc" }, skip, take
    }),
    prisma.userPreference.findMany({ where: { userId, key: { startsWith: "teacher-collaboration:" } }, orderBy: { updatedAt: "desc" }, take: 100 })
  ]);

  const hasMore = {
    discussions: discussionRows.length > pageSize, groups: groupRows.length > pageSize,
    teachers: teacherRows.length > pageSize, conversations: conversationRows.length > pageSize,
    resources: resourceRows.length > pageSize, activities: activityRows.length > pageSize
  };
  const discussions = discussionRows.slice(0, pageSize);
  const groups = groupRows.slice(0, pageSize);
  const teachers = teacherRows.slice(0, pageSize);
  const conversations = conversationRows.slice(0, pageSize);
  const resources = resourceRows.slice(0, pageSize);
  const activities = activityRows.slice(0, pageSize);

  return {
    pagination: { page, pageSize, hasMore },
    discussions: discussions.map((item) => {
      const metadata = record(item.metadata);
      const likes = list(metadata.likes);
      const reports = list(metadata.reports);
      return {
        id: item.id, title: item.title, body: item.body, authorId: item.authorId === userId ? item.authorId : null,
        owned: item.authorId === userId, author: item.author?.name ?? "Teacher",
        authorProfileId: item.author?.teacherProfile?.id ?? null,
        category: String(metadata.category ?? "Teaching"), postType: String(metadata.postType ?? "DISCUSSION"),
        tags: list(metadata.tags), resourceId: typeof metadata.resourceId === "string" ? metadata.resourceId : null,
        likes: likes.length, liked: likes.includes(userId), reports: reports.length, reported: reports.includes(userId),
        bestAnswerId: String(metadata.bestAnswerId ?? ""), pinned: item.isPinned, locked: item.isLocked,
        communityId: item.communityId, community: item.community?.name,
        bookmarked: favorites.some((favorite) => favorite.type === "community-discussion" && favorite.entityId === item.id),
        replies: [...item.replies].reverse().map((reply) => ({
          id: reply.id, authorId: reply.authorId, author: reply.author?.name ?? "Teacher", body: reply.body,
          createdAt: reply.createdAt.toISOString(), metadata: record(reply.metadata)
        })),
        createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString()
      };
    }),
    groups: groups.map((group) => {
      const metadata = record(group.metadata);
      return {
        id: group.id, name: group.name, description: group.description, type: group.type, visibility: group.visibility,
        category: String(metadata.category ?? "Professional Development"), owner: group.createdBy?.name,
        ownerId: group.createdById === userId ? group.createdById : null, owned: group.createdById === userId,
        members: group.members.map((member) => ({ id: member.id, userId: member.userId, name: member.user.name, role: member.role })),
        joined: group.members.some((member) => member.userId === userId), memberCount: group.members.length,
        discussionCount: group.discussions.length, discussions: group.discussions.map((item) => ({ id: item.id, title: item.title })),
        sharedResources: list(metadata.sharedResources), settings: String(metadata.settings ?? "")
      };
    }),
    teachers: teachers.map((teacher) => ({
      id: teacher.id, userId: teacher.userId, name: teacher.user.name, avatar: teacher.user.profile?.avatarUrl,
      headline: teacher.headline, subjects: teacher.subjects, grades: teacher.classes, languages: teacher.languages,
      mode: teacher.teachingMode, location: teacher.location, qualification: teacher.qualification,
      experienceYears: teacher.experienceYears, teachingStyle: teacher.teachingStyle, isMarketplaceListed: teacher.isMarketplaceListed,
      followed: favorites.some((favorite) => favorite.type === "teacher-follow" && favorite.entityId === teacher.userId),
      connected: favorites.some((favorite) => favorite.type === "teacher-connection" && favorite.entityId === teacher.userId),
      connectionRequested: favorites.some((favorite) => favorite.type === "teacher-connection-request" && favorite.entityId === teacher.userId)
    })),
    conversations: conversations.map((conversation) => {
      const participant = conversation.participants.find((item) => item.userId === userId);
      return {
        id: conversation.id, title: conversation.title, status: conversation.status, archived: Boolean(participant?.archivedAt),
        unread: conversation.messages.filter((message) => message.senderId !== userId && (!participant?.lastReadAt || message.createdAt > participant.lastReadAt)).length,
        participants: conversation.participants.filter((item) => item.userId !== userId).map((item) => ({ id: item.userId, name: item.user.name })),
        messages: [...conversation.messages].reverse().map((message) => ({
          id: message.id, senderId: message.senderId, sender: message.sender?.name ?? "Teacher", body: message.body,
          attachments: record(message.attachments), status: message.status, read: Boolean(message.readAt), createdAt: message.createdAt.toISOString()
        })), updatedAt: conversation.updatedAt.toISOString()
      };
    }),
    resources: resources.map((resource) => ({
      id: resource.id, title: resource.title, description: resource.description, type: resource.type,
      author: resource.createdBy?.name, ownerId: resource.createdById, course: resource.course.name,
      subject: resource.subject?.name, url: resource.fileUrl ?? resource.externalUrl,
      views: resource.analytics?.views ?? 0, downloads: resource.downloads.length,
      favorite: favorites.some((favorite) => favorite.type === "community-resource" && favorite.entityId === resource.id),
      saved: favorites.some((favorite) => favorite.type === "community-save-later" && favorite.entityId === resource.id)
    })),
    bookmarks: favorites.map((item) => ({ id: item.id, type: item.type, entityId: item.entityId, title: item.title, link: item.link, createdAt: item.createdAt.toISOString() })),
    notifications: notifications.map((item) => ({
      id: item.id, title: item.title, body: item.body, status: item.status, link: item.link,
      category: String(record(item.metadata).category ?? "COMMUNITY"), metadata: record(item.metadata), createdAt: item.createdAt.toISOString()
    })),
    activities: activities.map((item) => ({
      id: item.id, title: item.title, body: item.body, type: String(record(item.metadata).communityType ?? item.type),
      actor: item.actor?.name, link: item.link, createdAt: item.createdAt.toISOString()
    })),
    collaborations: collaborations.map((item) => {
      const entry = record(item.value);
      return {
        id: item.id, key: item.key, title: String(entry.title ?? ""), type: String(entry.type ?? "SHARED_LESSON"),
        collaboratorId: String(entry.collaboratorId ?? ""), status: String(entry.status ?? "REQUESTED"),
        resourceIds: list(entry.resourceIds), collection: String(entry.collection ?? ""),
        activity: Array.isArray(entry.activity) ? entry.activity : [], updatedAt: item.updatedAt.toISOString()
      };
    })
  };
}
