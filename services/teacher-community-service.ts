import { prisma } from "@/lib/db";

export const teacherCommunityModules = ["home", "discussions", "groups", "network", "messages", "collaboration", "resources", "bookmarks", "notifications", "activity"] as const;
export type TeacherCommunityModule = (typeof teacherCommunityModules)[number];
function record(value: unknown) { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function list(value: unknown) { return Array.isArray(value) ? value.map(String) : []; }

export async function getTeacherCommunityData(userId?: string, institutionId?: string | null) {
  if (!userId || !institutionId) return null;
  const [discussions, groups, teachers, conversations, resources, favorites, notifications, activities, collaborations] = await Promise.all([
    prisma.genericDiscussion.findMany({ where: { institutionId, status: { not: "ARCHIVED" } }, include: { author: { include: { teacherProfile: true } }, community: true, replies: { include: { author: true }, orderBy: { createdAt: "asc" } } }, orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }], take: 120 }),
    prisma.community.findMany({ where: { institutionId, status: "ACTIVE" }, include: { createdBy: true, members: { include: { user: true } }, discussions: { take: 5, orderBy: { updatedAt: "desc" } } }, orderBy: { updatedAt: "desc" }, take: 100 }),
    prisma.teacherProfile.findMany({ where: { user: { institutionId }, userId: { not: userId } }, include: { user: { include: { profile: true } } }, orderBy: { updatedAt: "desc" }, take: 100 }),
    prisma.directConversation.findMany({ where: { institutionId, participants: { some: { userId } } }, include: { participants: { include: { user: true } }, messages: { include: { sender: true }, orderBy: { createdAt: "asc" } } }, orderBy: { updatedAt: "desc" }, take: 100 }),
    prisma.contentItem.findMany({ where: { institutionId, status: "PUBLISHED", visibility: { in: ["PUBLIC", "TEACHERS"] } }, include: { createdBy: true, course: true, subject: true, analytics: true, downloads: true }, orderBy: { updatedAt: "desc" }, take: 100 }),
    prisma.favoriteItem.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.activity.findMany({ where: { institutionId, type: { in: ["CONTENT", "ANNOUNCEMENT", "SYSTEM"] } }, include: { actor: true }, orderBy: { createdAt: "desc" }, take: 120 }),
    prisma.userPreference.findMany({ where: { userId, key: { startsWith: "teacher-collaboration:" } }, orderBy: { updatedAt: "desc" }, take: 100 })
  ]);
  return {
    discussions: discussions.map((item) => {
      const metadata = record(item.metadata); const likes = list(metadata.likes); const reports = list(metadata.reports);
      return {
        id: item.id, title: item.title, body: item.body, authorId: item.authorId === userId ? item.authorId : null, owned: item.authorId === userId, author: item.author?.name ?? "Teacher",
        category: String(metadata.category ?? "Teaching Practice"), tags: list(metadata.tags), likes: likes.length, liked: likes.includes(userId),
        reports: reports.length, reported: reports.includes(userId), bestAnswerId: String(metadata.bestAnswerId ?? ""),
        pinned: item.isPinned, locked: item.isLocked, communityId: item.communityId, community: item.community?.name,
        bookmarked: favorites.some((favorite) => favorite.type === "community-discussion" && favorite.entityId === item.id),
        replies: item.replies.map((reply) => ({ id: reply.id, authorId: reply.authorId, author: reply.author?.name ?? "Teacher", body: reply.body, createdAt: reply.createdAt.toISOString(), metadata: record(reply.metadata) })),
        createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString()
      };
    }),
    groups: groups.map((group) => ({
      id: group.id, name: group.name, description: group.description, type: group.type, visibility: group.visibility,
      owner: group.createdBy?.name, ownerId: group.createdById === userId ? group.createdById : null, owned: group.createdById === userId, members: group.members.map((member) => ({ id: member.id, userId: member.userId, name: member.user.name, role: member.role })),
      joined: group.members.some((member) => member.userId === userId), memberCount: group.members.length, discussionCount: group.discussions.length,
      metadata: record(group.metadata)
    })),
    teachers: teachers.map((teacher) => ({
      id: teacher.id, userId: teacher.userId, name: teacher.user.name, avatar: teacher.user.profile?.avatarUrl, headline: teacher.headline,
      subjects: teacher.subjects, grades: teacher.classes, languages: teacher.languages, mode: teacher.teachingMode, location: teacher.location,
      followed: favorites.some((favorite) => favorite.type === "teacher-follow" && favorite.entityId === teacher.userId),
      connected: favorites.some((favorite) => favorite.type === "teacher-connection" && favorite.entityId === teacher.userId),
      connectionRequested: favorites.some((favorite) => favorite.type === "teacher-connection-request" && favorite.entityId === teacher.userId)
    })),
    conversations: conversations.map((conversation) => {
      const participant = conversation.participants.find((item) => item.userId === userId);
      return {
        id: conversation.id, title: conversation.title, status: conversation.status, archived: Boolean(participant?.archivedAt),
        participants: conversation.participants.filter((item) => item.userId !== userId).map((item) => ({ id: item.userId, name: item.user.name })),
        messages: conversation.messages.map((message) => ({ id: message.id, senderId: message.senderId, sender: message.sender?.name ?? "Teacher", body: message.body, attachments: record(message.attachments), read: Boolean(message.readAt), createdAt: message.createdAt.toISOString() })),
        updatedAt: conversation.updatedAt.toISOString()
      };
    }),
    resources: resources.map((resource) => ({
      id: resource.id, title: resource.title, description: resource.description, type: resource.type, author: resource.createdBy?.name,
      course: resource.course.name, subject: resource.subject?.name, url: resource.fileUrl ?? resource.externalUrl,
      views: resource.analytics?.views ?? 0, downloads: resource.downloads.length,
      favorite: favorites.some((favorite) => favorite.type === "community-resource" && favorite.entityId === resource.id),
      saved: favorites.some((favorite) => favorite.type === "community-save-later" && favorite.entityId === resource.id)
    })),
    bookmarks: favorites.filter((item) => ["community-post", "community-discussion", "community-resource", "community-save-later", "teacher-follow", "teacher-connection"].includes(item.type)).map((item) => ({ id: item.id, type: item.type, entityId: item.entityId, title: item.title, link: item.link, createdAt: item.createdAt.toISOString() })),
    notifications: notifications.map((item) => ({ id: item.id, title: item.title, body: item.body, status: item.status, link: item.link, category: String(record(item.metadata).category ?? "COMMUNITY"), createdAt: item.createdAt.toISOString() })),
    activities: activities.map((item) => ({ id: item.id, title: item.title, body: item.body, type: String(record(item.metadata).communityType ?? item.type), actor: item.actor?.name, link: item.link, createdAt: item.createdAt.toISOString() })),
    collaborations: collaborations.map((item) => {
      const entry=record(item.value);
      return { id:item.id,key:item.key,title:String(entry.title??""),type:String(entry.type??"SHARED_LESSON"),collaboratorId:String(entry.collaboratorId??""),status:String(entry.status??"REQUESTED"),resourceIds:list(entry.resourceIds),collection:String(entry.collection??""),activity:Array.isArray(entry.activity)?entry.activity:[],updatedAt:item.updatedAt.toISOString() };
    })
  };
}
