"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { universalSearch, type UniversalSearchResult } from "@/services/search-service";

const teacherRoles = ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"];
const categories = ["Teaching", "AI in Education", "Classroom Ideas", "Assessment", "Technology", "Career", "Resources", "Professional Development"];
const relationTypes = ["teacher-follow", "teacher-connection-request"];
const bookmarkTypes = ["community-post", "community-discussion", "community-resource", "community-save-later"];

function value(data: FormData, key: string) { return String(data.get(key) ?? "").trim(); }
function list(data: FormData, key: string) { return value(data, key).split(",").map((item) => item.trim()).filter(Boolean); }
function object(input: unknown) { return input && typeof input === "object" && !Array.isArray(input) ? input as Record<string, unknown> : {}; }
function array(input: unknown) { return Array.isArray(input) ? input.map(String) : []; }
function refresh() { revalidatePath("/teacher/community", "layout"); }

async function current() {
  const session = await auth();
  if (!session?.user.id || !session.user.institutionId) throw new Error("Teacher community access is required.");
  const actor = await prisma.user.findFirst({
    where: {
      id: session.user.id, institutionId: session.user.institutionId, status: "ACTIVE",
      roles: { some: { role: { key: { in: teacherRoles } } } }
    }, select: { id: true, name: true, institutionId: true }
  });
  if (!actor?.institutionId) throw new Error("Teacher community access is required.");
  return actor as { id: string; name: string; institutionId: string };
}

async function teacherTarget(actor: Awaited<ReturnType<typeof current>>, userId: string) {
  if (!userId || userId === actor.id) return null;
  return prisma.user.findFirst({
    where: { id: userId, institutionId: actor.institutionId, status: "ACTIVE", roles: { some: { role: { key: { in: teacherRoles } } } } },
    select: { id: true, name: true }
  });
}

async function visibleDiscussion(actor: Awaited<ReturnType<typeof current>>, id: string) {
  return prisma.genericDiscussion.findFirst({
    where: {
      id, institutionId: actor.institutionId, status: { not: "ARCHIVED" },
      OR: [{ communityId: null }, { community: { visibility: "PUBLIC" } }, { community: { members: { some: { userId: actor.id } } } }]
    }
  });
}

async function activity(actor: Awaited<ReturnType<typeof current>>, title: string, link: string, communityType: string, body?: string) {
  await prisma.activity.create({
    data: { institutionId: actor.institutionId, actorId: actor.id, type: "SYSTEM", title, body, link, metadata: { communityType } }
  });
}

async function notify(userId: string, actor: Awaited<ReturnType<typeof current>>, title: string, body: string, category: string, metadata: Record<string, unknown> = {}, link = "/teacher/community/notifications") {
  if (userId === actor.id) return;
  await prisma.notification.create({ data: { userId, institutionId: actor.institutionId, title, body, link, metadata: { category, ...metadata } } });
}

const discussionSchema = z.object({ title: z.string().min(3).max(180), body: z.string().min(3).max(5000) });

export async function saveDiscussionAction(data: FormData) {
  const actor = await current();
  const parsed = discussionSchema.safeParse({ title: value(data, "title"), body: value(data, "body") });
  if (!parsed.success) return;
  const id = value(data, "id");
  const communityId = value(data, "communityId");
  if (communityId) {
    const membership = await prisma.community.findFirst({
      where: { id: communityId, institutionId: actor.institutionId, status: "ACTIVE", members: { some: { userId: actor.id } } }, select: { id: true }
    });
    if (!membership) return;
  }
  const category = categories.includes(value(data, "category")) ? value(data, "category") : "Teaching";
  const metadata = { category, tags: list(data, "tags").slice(0, 8), postType: value(data, "postType") || "DISCUSSION" };
  if (id) {
    await prisma.genericDiscussion.updateMany({
      where: { id, institutionId: actor.institutionId, authorId: actor.id },
      data: { title: parsed.data.title, body: parsed.data.body, metadata }
    });
  } else {
    await prisma.genericDiscussion.create({
      data: { institutionId: actor.institutionId, authorId: actor.id, title: parsed.data.title, body: parsed.data.body, scope: "INSTITUTION", communityId: communityId || undefined, metadata }
    });
  }
  await activity(actor, `${id ? "Updated" : "Published"} discussion: ${parsed.data.title}`, "/teacher/community/discussions", "DISCUSSION");
  refresh();
}

export async function deleteDiscussionAction(data: FormData) {
  const actor = await current();
  await prisma.genericDiscussion.deleteMany({ where: { id: value(data, "id"), institutionId: actor.institutionId, authorId: actor.id } });
  refresh();
}

export async function replyDiscussionAction(data: FormData) {
  const actor = await current();
  const body = value(data, "body");
  const discussion = await visibleDiscussion(actor, value(data, "id"));
  if (!discussion || discussion.isLocked || body.length < 2 || body.length > 3000) return;
  const mentions = list(data, "mentions").map((item) => item.replace(/^@/, "")).slice(0, 12);
  await prisma.genericDiscussionReply.create({ data: { discussionId: discussion.id, authorId: actor.id, body, metadata: { mentions } } });
  await prisma.genericDiscussion.updateMany({ where: { id: discussion.id, institutionId: actor.institutionId }, data: { updatedAt: new Date() } });
  const mentioned = mentions.length ? await prisma.user.findMany({
    where: {
      institutionId: actor.institutionId, status: "ACTIVE", roles: { some: { role: { key: { in: teacherRoles } } } },
      OR: mentions.map((name) => ({ name: { equals: name, mode: "insensitive" as const } }))
    }, select: { id: true }
  }) : [];
  const recipients = Array.from(new Set([discussion.authorId, ...mentioned.map((item) => item.id)].filter((id): id is string => Boolean(id) && id !== actor.id)));
  if (recipients.length) await prisma.notification.createMany({ data: recipients.map((userId) => ({
    userId, institutionId: actor.institutionId,
    title: mentioned.some((item) => item.id === userId) ? "You were mentioned" : "New discussion reply",
    body: discussion.title, link: `/teacher/community/discussions#${discussion.id}`,
    metadata: { category: mentioned.some((item) => item.id === userId) ? "MENTION" : "REPLY", discussionId: discussion.id }
  })) });
  await activity(actor, `Replied to ${discussion.title}`, `/teacher/community/discussions#${discussion.id}`, "DISCUSSION_REPLY");
  refresh();
}

export async function deleteReplyAction(data: FormData) {
  const actor = await current();
  await prisma.genericDiscussionReply.deleteMany({
    where: { id: value(data, "id"), authorId: actor.id, discussion: { institutionId: actor.institutionId } }
  });
  refresh();
}

async function mutateDiscussion(data: FormData, mutate: (metadata: Record<string, unknown>, actor: Awaited<ReturnType<typeof current>>) => Record<string, unknown>) {
  const actor = await current();
  const discussion = await visibleDiscussion(actor, value(data, "id"));
  if (!discussion) return;
  await prisma.genericDiscussion.updateMany({
    where: { id: discussion.id, institutionId: actor.institutionId },
    data: { metadata: mutate(object(discussion.metadata), actor) as Prisma.InputJsonValue }
  });
  refresh();
}

export async function likeDiscussionAction(data: FormData) {
  const actor = await current();
  const discussion = await visibleDiscussion(actor, value(data, "id"));
  if (!discussion) return;
  const metadata = object(discussion.metadata);
  const likes = array(metadata.likes);
  const removing = likes.includes(actor.id);
  await prisma.genericDiscussion.updateMany({
    where: { id: discussion.id, institutionId: actor.institutionId },
    data: { metadata: { ...metadata, likes: removing ? likes.filter((id) => id !== actor.id) : [...likes, actor.id] } as Prisma.InputJsonValue }
  });
  if (!removing && discussion.authorId) await notify(discussion.authorId, actor, "Your discussion was appreciated", discussion.title, "REACTION", { discussionId: discussion.id }, `/teacher/community/discussions#${discussion.id}`);
  refresh();
}

export async function reportDiscussionAction(data: FormData) {
  return mutateDiscussion(data, (metadata, actor) => ({ ...metadata, reports: Array.from(new Set([...array(metadata.reports), actor.id])), reportReason: value(data, "reason").slice(0, 500) }));
}

export async function bestAnswerAction(data: FormData) {
  const actor = await current();
  const discussion = await prisma.genericDiscussion.findFirst({ where: { id: value(data, "id"), institutionId: actor.institutionId, authorId: actor.id } });
  if (!discussion) return;
  const reply = await prisma.genericDiscussionReply.findFirst({ where: { id: value(data, "replyId"), discussionId: discussion.id } });
  if (!reply) return;
  await prisma.genericDiscussion.updateMany({ where: { id: discussion.id, institutionId: actor.institutionId, authorId: actor.id }, data: { metadata: { ...object(discussion.metadata), bestAnswerId: reply.id } as Prisma.InputJsonValue } });
  if (reply.authorId) await notify(reply.authorId, actor, "Your reply was selected", discussion.title, "BEST_ANSWER", { discussionId: discussion.id }, `/teacher/community/discussions#${discussion.id}`);
  refresh();
}

export async function toggleCommunityBookmarkAction(data: FormData) {
  const actor = await current();
  const type = value(data, "type");
  const entityId = value(data, "entityId");
  if (!bookmarkTypes.includes(type) || !entityId) return;
  const allowed = type.includes("discussion") || type === "community-post"
    ? Boolean(await visibleDiscussion(actor, entityId))
    : Boolean(await prisma.contentItem.findFirst({ where: { id: entityId, institutionId: actor.institutionId, status: "PUBLISHED", visibility: { in: ["PUBLIC", "TEACHERS"] } }, select: { id: true } }));
  if (!allowed) return;
  const key = { userId_type_entityId: { userId: actor.id, type, entityId } };
  const found = await prisma.favoriteItem.findUnique({ where: key });
  if (found) await prisma.favoriteItem.delete({ where: { id: found.id } });
  else await prisma.favoriteItem.create({ data: { userId: actor.id, type, entityId, title: value(data, "title").slice(0, 180), link: value(data, "link") || undefined } });
  refresh();
}

export async function saveGroupAction(data: FormData) {
  const actor = await current();
  const id = value(data, "id");
  const name = value(data, "name").slice(0, 140);
  if (name.length < 3) return;
  const resourceIds = [...new Set(list(data, "resources").slice(0, 30))];
  const accessibleResources = resourceIds.length ? await prisma.contentItem.count({
    where: {
      id: { in: resourceIds }, institutionId: actor.institutionId,
      OR: [{ createdById: actor.id }, { status: "PUBLISHED", visibility: { in: ["PUBLIC", "TEACHERS"] } }]
    }
  }) : 0;
  if (accessibleResources !== resourceIds.length) return;
  const visibility = ["PUBLIC", "PRIVATE", "INVITE_ONLY"].includes(value(data, "visibility")) ? value(data, "visibility") as "PUBLIC" | "PRIVATE" | "INVITE_ONLY" : "PUBLIC";
  const payload = {
    name, description: value(data, "description").slice(0, 1500), visibility,
    metadata: { category: categories.includes(value(data, "category")) ? value(data, "category") : "Professional Development", settings: value(data, "settings").slice(0, 1000), sharedResources: resourceIds }
  };
  if (id) await prisma.community.updateMany({ where: { id, institutionId: actor.institutionId, createdById: actor.id }, data: payload });
  else await prisma.community.create({ data: { institutionId: actor.institutionId, createdById: actor.id, type: "TEACHER_GROUP", ...payload, members: { create: { userId: actor.id, role: "OWNER" } } } });
  await activity(actor, `${id ? "Updated" : "Created"} teacher group: ${name}`, "/teacher/community/groups", "GROUP_ACTIVITY");
  refresh();
}

export async function deleteGroupAction(data: FormData) {
  const actor = await current();
  await prisma.community.deleteMany({ where: { id: value(data, "id"), institutionId: actor.institutionId, createdById: actor.id } });
  refresh();
}

export async function joinGroupAction(data: FormData) {
  const actor = await current();
  const group = await prisma.community.findFirst({ where: { id: value(data, "id"), institutionId: actor.institutionId, type: "TEACHER_GROUP", status: "ACTIVE" } });
  if (!group) return;
  if (group.visibility === "PUBLIC") {
    await prisma.communityMember.upsert({ where: { communityId_userId: { communityId: group.id, userId: actor.id } }, update: {}, create: { communityId: group.id, userId: actor.id } });
    await activity(actor, `Joined ${group.name}`, "/teacher/community/groups", "GROUP_ACTIVITY");
  } else if (group.createdById) {
    const duplicate = await prisma.notification.findFirst({ where: { userId: group.createdById, institutionId: actor.institutionId, status: "UNREAD", metadata: { path: ["requesterId"], equals: actor.id } } });
    if (!duplicate) await notify(group.createdById, actor, "Group join request", `${actor.name} requested to join ${group.name}.`, "GROUP_REQUEST", { groupId: group.id, requesterId: actor.id }, "/teacher/community/groups");
  }
  refresh();
}

export async function leaveGroupAction(data: FormData) {
  const actor = await current();
  await prisma.communityMember.deleteMany({ where: { communityId: value(data, "id"), userId: actor.id, role: { not: "OWNER" }, community: { institutionId: actor.institutionId } } });
  refresh();
}

export async function inviteGroupMemberAction(data: FormData) {
  const actor = await current();
  const target = await teacherTarget(actor, value(data, "userId"));
  const group = await prisma.community.findFirst({
    where: { id: value(data, "id"), institutionId: actor.institutionId, members: { some: { userId: actor.id, role: { in: ["OWNER", "MODERATOR"] } } } }
  });
  if (!group || !target) return;
  await notify(target.id, actor, "Teacher group invitation", `${actor.name} invited you to ${group.name}.`, "GROUP_INVITATION", { groupId: group.id }, "/teacher/community/groups");
  refresh();
}

export async function acceptGroupAction(data: FormData) {
  const actor = await current();
  const notification = await prisma.notification.findFirst({ where: { id: value(data, "notificationId"), userId: actor.id, institutionId: actor.institutionId, status: "UNREAD" } });
  if (!notification) return;
  const metadata = object(notification.metadata);
  const groupId = String(metadata.groupId ?? "");
  const category = String(metadata.category ?? "");
  if (category === "GROUP_INVITATION") {
    const group = await prisma.community.findFirst({ where: { id: groupId, institutionId: actor.institutionId, status: "ACTIVE" } });
    if (!group) return;
    await prisma.communityMember.upsert({ where: { communityId_userId: { communityId: group.id, userId: actor.id } }, update: {}, create: { communityId: group.id, userId: actor.id } });
  } else if (category === "GROUP_REQUEST") {
    const requesterId = String(metadata.requesterId ?? "");
    const group = await prisma.community.findFirst({ where: { id: groupId, institutionId: actor.institutionId, members: { some: { userId: actor.id, role: { in: ["OWNER", "MODERATOR"] } } } } });
    const requester = await teacherTarget(actor, requesterId);
    if (!group || !requester) return;
    await prisma.communityMember.upsert({ where: { communityId_userId: { communityId: group.id, userId: requester.id } }, update: {}, create: { communityId: group.id, userId: requester.id } });
    await notify(requester.id, actor, "Group request accepted", `You joined ${group.name}.`, "GROUP_ACTIVITY", { groupId: group.id }, "/teacher/community/groups");
  } else return;
  await prisma.notification.updateMany({ where: { id: notification.id, userId: actor.id }, data: { status: "READ", readAt: new Date() } });
  refresh();
}

export async function toggleTeacherRelationAction(data: FormData) {
  const actor = await current();
  const type = value(data, "type");
  const target = await teacherTarget(actor, value(data, "userId"));
  if (!target || !relationTypes.includes(type)) return;
  const key = { userId_type_entityId: { userId: actor.id, type, entityId: target.id } };
  const found = await prisma.favoriteItem.findUnique({ where: key });
  if (found) await prisma.favoriteItem.delete({ where: { id: found.id } });
  else {
    await prisma.favoriteItem.create({ data: { userId: actor.id, type, entityId: target.id, title: target.name, link: value(data, "link") || undefined } });
    if (type === "teacher-connection-request") await notify(target.id, actor, "Professional connection request", `${actor.name} would like to connect.`, "CONNECTION_REQUEST", { requesterId: actor.id }, "/teacher/community/network");
  }
  refresh();
}

export async function acceptConnectionAction(data: FormData) {
  const actor = await current();
  const notification = await prisma.notification.findFirst({ where: { id: value(data, "notificationId"), userId: actor.id, institutionId: actor.institutionId, status: "UNREAD", metadata: { path: ["category"], equals: "CONNECTION_REQUEST" } } });
  if (!notification) return;
  const requester = await teacherTarget(actor, String(object(notification.metadata).requesterId ?? ""));
  if (!requester) return;
  await prisma.$transaction([
    prisma.favoriteItem.upsert({ where: { userId_type_entityId: { userId: actor.id, type: "teacher-connection", entityId: requester.id } }, update: {}, create: { userId: actor.id, type: "teacher-connection", entityId: requester.id, title: requester.name, link: "/teacher/community/network" } }),
    prisma.favoriteItem.upsert({ where: { userId_type_entityId: { userId: requester.id, type: "teacher-connection", entityId: actor.id } }, update: {}, create: { userId: requester.id, type: "teacher-connection", entityId: actor.id, title: actor.name, link: "/teacher/community/network" } }),
    prisma.favoriteItem.deleteMany({ where: { userId: requester.id, type: "teacher-connection-request", entityId: actor.id } }),
    prisma.notification.updateMany({ where: { id: notification.id, userId: actor.id }, data: { status: "READ", readAt: new Date() } })
  ]);
  await notify(requester.id, actor, "Connection accepted", `${actor.name} accepted your professional connection request.`, "CONNECTION", { userId: actor.id }, "/teacher/community/network");
  await activity(actor, `Connected with ${requester.name}`, "/teacher/community/network", "CONNECTION");
  refresh();
}

async function validatedAttachments(actor: Awaited<ReturnType<typeof current>>, data: FormData) {
  const urls = list(data, "attachments").slice(0, 5).filter((item) => {
    try {
      return ["http:", "https:"].includes(new URL(item).protocol);
    } catch {
      return false;
    }
  });
  const resources = [...new Set(list(data, "resources").slice(0, 10))];
  if (resources.length) {
    const accessible = await prisma.contentItem.count({
      where: {
        id: { in: resources },
        institutionId: actor.institutionId,
        OR: [
          { createdById: actor.id },
          { status: "PUBLISHED", visibility: { in: ["PUBLIC", "TEACHERS"] } }
        ]
      }
    });
    if (accessible !== resources.length) return null;
  }
  return { urls, resources };
}

export async function createConversationAction(data: FormData) {
  const actor = await current();
  const target = await teacherTarget(actor, value(data, "userId"));
  const body = value(data, "body").slice(0, 5000);
  const attachments = await validatedAttachments(actor, data);
  if (!target || !body || !attachments) return;
  const existing = await prisma.directConversation.findFirst({
    where: { institutionId: actor.institutionId, type: "TEACHER_TEACHER", AND: [{ participants: { some: { userId: actor.id } } }, { participants: { some: { userId: target.id } } }] }, select: { id: true }
  });
  const conversation = existing ? await prisma.directConversation.update({
    where: { id: existing.id }, data: { status: "ACTIVE", updatedAt: new Date(), messages: { create: { senderId: actor.id, body, attachments } } }
  }) : await prisma.directConversation.create({
    data: {
      institutionId: actor.institutionId, createdById: actor.id, type: "TEACHER_TEACHER", status: "ACTIVE",
      title: value(data, "title").slice(0, 160) || "Professional conversation",
      participants: { create: [{ userId: actor.id, role: "OWNER" }, { userId: target.id, role: "MEMBER" }] },
      messages: { create: { senderId: actor.id, body, attachments } }
    }
  });
  await notify(target.id, actor, "New message", `${actor.name}: ${body.slice(0, 120)}`, "MESSAGE", { conversationId: conversation.id }, "/teacher/community/messages");
  refresh();
}

export async function sendMessageAction(data: FormData) {
  const actor = await current();
  const body = value(data, "body").slice(0, 5000);
  const attachments = await validatedAttachments(actor, data);
  const conversation = await prisma.directConversation.findFirst({
    where: { id: value(data, "id"), institutionId: actor.institutionId, status: { not: "BLOCKED" }, participants: { some: { userId: actor.id, archivedAt: null } } },
    include: { participants: { select: { userId: true } } }
  });
  if (!conversation || !body || !attachments) return;
  await prisma.directMessage.create({ data: { conversationId: conversation.id, senderId: actor.id, body, attachments } });
  await prisma.directConversation.updateMany({ where: { id: conversation.id, institutionId: actor.institutionId }, data: { updatedAt: new Date() } });
  const recipients = conversation.participants.filter((item) => item.userId !== actor.id);
  if (recipients.length) await prisma.notification.createMany({ data: recipients.map((item) => ({ userId: item.userId, institutionId: actor.institutionId, title: "New message", body: `${actor.name}: ${body.slice(0, 120)}`, link: "/teacher/community/messages", metadata: { category: "MESSAGE", conversationId: conversation.id } })) });
  refresh();
}

export async function archiveConversationAction(data: FormData) {
  const actor = await current();
  await prisma.directConversationParticipant.updateMany({
    where: { conversationId: value(data, "id"), userId: actor.id, conversation: { institutionId: actor.institutionId } },
    data: { archivedAt: value(data, "restore") === "true" ? null : new Date() }
  });
  refresh();
}

export async function markConversationReadAction(data: FormData) {
  const actor = await current();
  const id = value(data, "id");
  const access = await prisma.directConversationParticipant.findFirst({ where: { conversationId: id, userId: actor.id, conversation: { institutionId: actor.institutionId } } });
  if (!access) return;
  await prisma.$transaction([
    prisma.directConversationParticipant.updateMany({ where: { conversationId: id, userId: actor.id }, data: { lastReadAt: new Date() } }),
    prisma.directMessage.updateMany({ where: { conversationId: id, senderId: { not: actor.id }, readAt: null }, data: { readAt: new Date(), status: "READ" } })
  ]);
  refresh();
}

export async function saveCollaborationAction(data: FormData) {
  const actor = await current();
  const collaborator = await teacherTarget(actor, value(data, "collaboratorId"));
  const resourceIds = list(data, "resources").slice(0, 30);
  const accessibleResources = resourceIds.length ? await prisma.contentItem.count({ where: { id: { in: resourceIds }, institutionId: actor.institutionId, OR: [{ createdById: actor.id }, { status: "PUBLISHED", visibility: { in: ["PUBLIC", "TEACHERS"] } }] } }) : 0;
  if (!collaborator || accessibleResources !== resourceIds.length) return;
  const id = value(data, "id");
  const existing = id ? await prisma.userPreference.findFirst({ where: { id, userId: actor.id, key: { startsWith: "teacher-collaboration:" } } }) : null;
  const previous = existing ? object(existing.value) : {};
  const previousActivity = Array.isArray(previous.activity) ? previous.activity : [];
  const payload = {
    title: value(data, "title").slice(0, 180), type: value(data, "type"), collaboratorId: collaborator.id,
    status: value(data, "status") || "REQUESTED", resourceIds, collection: value(data, "collection").slice(0, 180),
    activity: [...previousActivity, { at: new Date().toISOString(), actor: actor.name, action: id ? "Updated collaboration" : "Created collaboration" }].slice(-50)
  };
  if (existing) await prisma.userPreference.update({ where: { id: existing.id }, data: { value: payload } });
  else {
    const created = await prisma.userPreference.create({ data: { userId: actor.id, key: `teacher-collaboration:${crypto.randomUUID()}`, value: payload } });
    await notify(collaborator.id, actor, "Collaboration invitation", payload.title, "COLLABORATION", { collaborationId: created.id }, "/teacher/community/collaboration");
  }
  refresh();
}

export async function deleteCollaborationAction(data: FormData) {
  const actor = await current();
  await prisma.userPreference.deleteMany({ where: { id: value(data, "id"), userId: actor.id, key: { startsWith: "teacher-collaboration:" } } });
  refresh();
}

export async function shareResourceAction(data: FormData) {
  const actor = await current();
  const resource = await prisma.contentItem.findFirst({
    where: { id: value(data, "id"), institutionId: actor.institutionId, status: "PUBLISHED", visibility: { in: ["PUBLIC", "TEACHERS"] } }
  });
  if (!resource) return;
  const discussion = await prisma.genericDiscussion.create({
    data: {
      institutionId: actor.institutionId, authorId: actor.id, title: `Resource: ${resource.title}`,
      body: value(data, "message").slice(0, 3000) || resource.description || undefined, scope: "RESOURCE", scopeId: resource.id,
      metadata: { category: "Resources", postType: "RESOURCE", resourceId: resource.id, tags: list(data, "tags").slice(0, 8) }
    }
  });
  await activity(actor, `Shared resource: ${resource.title}`, `/teacher/community/discussions#${discussion.id}`, "RESOURCE_SHARE");
  if (resource.createdById) await notify(resource.createdById, actor, "Your resource was shared", resource.title, "RESOURCE_INTERACTION", { resourceId: resource.id }, `/teacher/community/discussions#${discussion.id}`);
  refresh();
}

export async function markCommunityNotificationAction(data: FormData) {
  const actor = await current();
  await prisma.notification.updateMany({ where: { id: value(data, "id"), userId: actor.id, institutionId: actor.institutionId }, data: { status: "READ", readAt: new Date() } });
  refresh();
}

export async function deleteCommunityNotificationAction(data: FormData) {
  const actor = await current();
  await prisma.notification.deleteMany({ where: { id: value(data, "id"), userId: actor.id, institutionId: actor.institutionId } });
  refresh();
}

export type CommunitySearchState = { query?: string; results: UniversalSearchResult[]; error?: string };

export async function teacherCommunitySearchAction(_: CommunitySearchState, data: FormData): Promise<CommunitySearchState> {
  const actor = await current();
  const query = value(data, "query").slice(0, 100);
  if (query.length < 2) return { results: [], error: "Enter at least two characters." };
  const allowed = new Set(["Teacher", "Marketplace Teacher", "Learning Resource", "Discussion", "Community", "Message Thread", "Message", "Content"]);
  const results = (await universalSearch(actor.institutionId, query, actor.id)).filter((item) => allowed.has(item.type)).map((item) => ({
    ...item,
    subtitle: item.type === "Teacher" ? "Teacher in your institution" : item.subtitle,
    href: item.type === "Discussion" ? "/teacher/community/discussions" : item.type === "Community" ? "/teacher/community/groups" : ["Message", "Message Thread"].includes(item.type) ? "/teacher/community/messages" : item.href
  }));
  return { query, results };
}
