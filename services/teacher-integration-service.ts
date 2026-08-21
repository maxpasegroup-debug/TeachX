import type { ContentItemType } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { UniversalSearchResult } from "@/services/search-service";

type SaveAIContentInput = {
  userId: string;
  institutionId: string;
  conversationId: string;
  courseId: string;
  title?: string;
  content?: string;
  contentType?: ContentItemType;
  saveKind: "lesson" | "resource";
  metadata?: Record<string, unknown>;
};

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function latestAssistantMessage(messages: unknown) {
  if (!Array.isArray(messages)) return "";
  const item = [...messages].reverse().find((message) => record(message).role === "assistant");
  return String(record(item).content ?? "").trim();
}

function contentTypeForAI(saveKind: "lesson" | "resource", context: Record<string, unknown>): ContentItemType {
  if (saveKind === "lesson") return "NOTES";
  const toolSlug = String(context.toolSlug ?? "ai-studio");
  if (toolSlug.includes("worksheet") || toolSlug.includes("homework")) return "WORKSHEET";
  if (toolSlug.includes("question-paper")) return "QUESTION_PAPER";
  if (toolSlug.includes("presentation")) return "PPT";
  return "DOCUMENT";
}

export async function saveAIContentToTeacherLibrary(input: SaveAIContentInput) {
  const [conversation, course, teacher] = await Promise.all([
    prisma.aIConversation.findFirst({
      where: {
        id: input.conversationId,
        userId: input.userId,
        institutionId: input.institutionId,
        scope: "TEACHER"
      }
    }),
    prisma.course.findFirst({
      where: { id: input.courseId, institutionId: input.institutionId },
      select: { id: true }
    }),
    prisma.user.findFirst({
      where: {
        id: input.userId,
        institutionId: input.institutionId,
        status: "ACTIVE",
        roles: { some: { role: { key: { in: ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"] } } } }
      },
      select: { id: true }
    })
  ]);
  if (!conversation || !course || !teacher) return null;

  const content = input.content?.trim() || latestAssistantMessage(conversation.messages);
  if (!content) return null;

  const id = `ai-${conversation.id}-${input.saveKind}`;
  const existing = await prisma.contentItem.findFirst({
    where: { id, institutionId: input.institutionId, createdById: input.userId }
  });
  const title = input.title?.trim() || conversation.title;
  const conversationContext = record(conversation.context);
  const contentType = input.contentType ?? contentTypeForAI(input.saveKind, conversationContext);
  const aiReadyNotes = {
    ...input.metadata,
    source: "ai-studio",
    conversationId: conversation.id,
    toolSlug: String(conversationContext.toolSlug ?? "ai-studio"),
    saveKind: input.saveKind
  };

  if (existing) {
    if (existing.status === "PUBLISHED") {
      return {
        id: existing.id,
        created: false,
        updated: false,
        href: input.saveKind === "lesson" ? "/teacher/workspace/lessons" : "/teacher/resources"
      };
    }
    const nextVersion = existing.version + 1;
    await prisma.$transaction([
      prisma.contentItem.updateMany({
        where: { id, institutionId: input.institutionId, createdById: input.userId },
        data: {
          courseId: course.id,
          title,
          description: content,
          type: contentType,
          visibility: input.saveKind === "lesson" ? "PRIVATE" : "TEACHERS",
          aiReadyNotes,
          version: nextVersion
        }
      }),
      prisma.contentVersion.create({
        data: {
          itemId: id,
          version: nextVersion,
          title,
          updatedById: input.userId,
          changeNote: input.saveKind === "lesson" ? "Updated from AI Studio in Lesson Library" : "Updated from AI Studio in Resource Library"
        }
      })
    ]);
    return {
      id,
      created: false,
      updated: true,
      href: input.saveKind === "lesson" ? "/teacher/workspace/lessons" : "/teacher/resources"
    };
  }

  await prisma.contentItem.create({
    data: {
      id,
      institutionId: input.institutionId,
      createdById: input.userId,
      courseId: course.id,
      title,
      description: content,
      type: contentType,
      status: "DRAFT",
      visibility: input.saveKind === "lesson" ? "PRIVATE" : "TEACHERS",
      aiReadyNotes,
      versions: {
        create: {
          version: 1,
          title,
          updatedById: input.userId,
          changeNote: input.saveKind === "lesson" ? "Saved from AI Studio to Lesson Library" : "Saved from AI Studio to Resource Library"
        }
      },
      analytics: { create: {} }
    }
  });
  return {
    id,
    created: true,
    updated: false,
    href: input.saveKind === "lesson" ? "/teacher/workspace/lessons" : "/teacher/resources"
  };
}

export async function searchTeacherOS(userId: string, institutionId: string, query: string): Promise<UniversalSearchResult[]> {
  const contains = { contains: query, mode: "insensitive" as const };
  const assignedClass = {
    institutionId,
    OR: [
      { batch: { faculty: { some: { facultyId: userId } } } },
      { batch: { timetableEntries: { some: { facultyId: userId } } } }
    ]
  };
  const [classrooms, students, content, aiOutputs, conversations, messages, discussions, groups, teachers, orders, assignments, notes] = await Promise.all([
    prisma.classroom.findMany({
      where: { ...assignedClass, AND: [{ OR: [{ title: contains }, { course: { name: contains } }, { batch: { name: contains } }] }] },
      include: { course: true, batch: true }, take: 6
    }),
    prisma.user.findMany({
      where: {
        institutionId, status: "ACTIVE", name: contains,
        roles: { some: { role: { key: "STUDENT" } } },
        studentBatches: { some: { batch: { OR: [{ faculty: { some: { facultyId: userId } } }, { timetableEntries: { some: { facultyId: userId } } }] } } }
      }, take: 6
    }),
    prisma.contentItem.findMany({
      where: {
        institutionId,
        AND: [
          { OR: [{ title: contains }, { description: contains }, { course: { name: contains } }, { subject: { name: contains } }] },
          { OR: [{ createdById: userId }, { status: "PUBLISHED", visibility: { in: ["PUBLIC", "TEACHERS"] } }] }
        ]
      }, include: { course: true, subject: true }, take: 12
    }),
    prisma.aIConversation.findMany({ where: { institutionId, userId, scope: "TEACHER", title: contains }, take: 6 }),
    prisma.directConversation.findMany({ where: { institutionId, participants: { some: { userId } }, title: contains }, take: 6 }),
    prisma.directMessage.findMany({
      where: { conversation: { institutionId, participants: { some: { userId } } }, body: contains },
      include: { conversation: true }, take: 6
    }),
    prisma.genericDiscussion.findMany({
      where: {
        institutionId,
        AND: [
          { OR: [{ title: contains }, { body: contains }] },
          { OR: [{ communityId: null }, { community: { visibility: "PUBLIC" } }, { community: { members: { some: { userId } } } }] }
        ]
      }, take: 6
    }),
    prisma.community.findMany({
      where: {
        institutionId, status: "ACTIVE",
        AND: [
          { OR: [{ name: contains }, { description: contains }] },
          { OR: [{ visibility: "PUBLIC" }, { createdById: userId }, { members: { some: { userId } } }] }
        ]
      }, take: 6
    }),
    prisma.teacherProfile.findMany({
      where: {
        userId: { not: userId },
        user: {
          institutionId,
          status: "ACTIVE",
          roles: { some: { role: { key: { in: ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"] } } } }
        },
        OR: [{ user: { name: contains } }, { headline: contains }, { bio: contains }, { location: contains }, { subjects: { has: query } }]
      }, include: { user: true }, take: 6
    }),
    prisma.commerceOrderItem.findMany({
      where: {
        sellerId: userId,
        order: { institutionId, OR: [{ gatewayOrderId: contains }, { buyer: { name: contains } }] }
      }, include: { order: { include: { buyer: true } } }, take: 6
    }),
    prisma.assignment.findMany({
      where: { title: contains, classroom: assignedClass }, include: { classroom: true }, take: 6
    }),
    prisma.userPreference.findMany({
      where: { userId, key: { startsWith: "teacher-note:" }, value: { path: ["title"], string_contains: query } }, take: 6
    })
  ]);

  const lowerQuery = query.toLowerCase();
  const destinations: UniversalSearchResult[] = [
    { type: "Settings", title: "Teacher settings", subtitle: "Account, preferences, privacy, security, and billing", href: "/teacher/settings" },
    { type: "Help", title: "TeachX Help Center", subtitle: "Guides and teacher support", href: "/teacher/support?view=help" }
  ].filter((item) => `${item.title} ${item.subtitle}`.toLowerCase().includes(lowerQuery));

  return [
    ...classrooms.map((item) => ({ type: "Class", title: item.title, subtitle: `${item.course.name} - ${item.batch.name}`, href: `/classrooms/${item.id}` })),
    ...students.map((item) => ({ type: "Student", title: item.name, subtitle: "Student in one of your assigned classes", href: "/teacher/workspace/classrooms" })),
    ...content.map((item) => ({
      type: item.createdById === userId ? (item.type === "NOTES" ? "Lesson" : "Resource") : "Shared Resource",
      title: item.title,
      subtitle: item.subject?.name ?? item.course.name,
      href: item.createdById === userId ? (item.type === "NOTES" ? "/teacher/workspace/lessons" : "/teacher/resources") : `/resources/${item.id}`
    })),
    ...aiOutputs.map((item) => ({ type: "AI Creation", title: item.title, subtitle: "Your saved AI teaching material", href: "/teacher/workspace/saved-ai" })),
    ...conversations.map((item) => ({ type: "Message Thread", title: item.title, subtitle: item.status, href: `/teacher/community/messages?conversation=${item.id}` })),
    ...messages.map((item) => ({ type: "Message", title: item.conversation.title, subtitle: item.body, href: `/teacher/community/messages?conversation=${item.conversationId}` })),
    ...discussions.map((item) => ({ type: "Discussion", title: item.title, subtitle: item.scope, href: `/teacher/community/discussions#${item.id}` })),
    ...groups.map((item) => ({ type: "Teacher Group", title: item.name, subtitle: item.type, href: `/teacher/community/groups?group=${item.id}` })),
    ...teachers.map((item) => ({ type: "Teacher", title: item.user.name, subtitle: item.headline ?? item.subjects.join(", "), href: `/marketplace/teachers/${item.id}` })),
    ...orders.map((item) => ({ type: "Order", title: item.title, subtitle: `${item.order.buyer.name} - ${item.order.status}`, href: "/teacher/business/orders" })),
    ...assignments.map((item) => ({ type: "Assignment", title: item.title, subtitle: item.classroom.title, href: `/classrooms/${item.classroomId}#assignments` })),
    ...notes.map((item) => ({ type: "Note", title: String(record(item.value).title ?? "Teaching note"), subtitle: "Teacher workspace", href: "/teacher/workspace/notes" })),
    ...destinations
  ];
}
