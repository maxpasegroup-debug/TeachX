import type { RoleKey } from "@/lib/constants/roles";
import { prisma } from "@/lib/db";
import { getTeacherDashboard } from "@/services/classroom-service";
import { isPersonalTeacherWorkspace } from "@/services/standalone-teacher-service";

export const teacherWorkspaceModules = [
  "classrooms", "lessons", "resources", "planner", "notes", "saved-ai", "activity", "notifications", "search"
] as const;

export type TeacherWorkspaceModule = (typeof teacherWorkspaceModules)[number];

function jsonRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function assistantText(messages: unknown) {
  if (!Array.isArray(messages)) return "";
  const message = [...messages].reverse().find((entry) => entry && typeof entry === "object" && (entry as { role?: string }).role === "assistant");
  return message && typeof message === "object" ? String((message as { content?: string }).content ?? "") : "";
}

export async function getTeacherWorkspaceData(input: {
  userId?: string;
  institutionId?: string | null;
  roles: RoleKey[];
}) {
  if (!input.userId || !input.institutionId) {
    return {
      classrooms: [], content: [], planner: [], timetable: [], exams: [], notes: [], aiOutputs: [],
      personalWorkspace: false, activities: [], notifications: [], downloads: [], purchases: [], favorites: [], recent: [], courses: [], subjects: [], assignments: []
    };
  }

  const activeTeacher = await prisma.user.count({
    where: {
      id: input.userId,
      institutionId: input.institutionId,
      status: "ACTIVE",
      roles: { some: { role: { key: { in: ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"] } } } }
    }
  });
  if (activeTeacher !== 1) {
    return {
      classrooms: [], content: [], planner: [], timetable: [], exams: [], notes: [], aiOutputs: [],
      personalWorkspace: false, activities: [], notifications: [], downloads: [], purchases: [], favorites: [], recent: [], courses: [], subjects: [], assignments: []
    };
  }

  const personalWorkspace = await isPersonalTeacherWorkspace(input.userId, input.institutionId);

  const rangeStart = new Date();
  rangeStart.setDate(rangeStart.getDate() - 31);
  rangeStart.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(rangeStart);
  rangeEnd.setDate(rangeEnd.getDate() + 152);

  const [teacher, content, planner, exams, notes, aiOutputs, activities, notifications, notificationStates, downloads, purchases, favorites, recent, courses, subjects] = await Promise.all([
    getTeacherDashboard(input.userId, input.institutionId, input.roles),
    prisma.contentItem.findMany({
      where: { institutionId: input.institutionId, createdById: input.userId },
      include: { course: true, subject: true, versions: { orderBy: { version: "desc" }, take: 3 }, downloads: true },
      orderBy: { updatedAt: "desc" },
      take: 100
    }),
    prisma.plannerEvent.findMany({
      where: {
        institutionId: input.institutionId,
        startsAt: { gte: rangeStart, lt: rangeEnd },
        OR: [{ createdById: input.userId }, { createdById: null }]
      },
      include: {
        classroom: { include: { course: true, batch: true } },
        lesson: { include: { course: true, subject: true } }
      },
      orderBy: { startsAt: "asc" },
      take: 500
    }),
    prisma.exam.findMany({
      where: { institutionId: input.institutionId, startsAt: { gte: rangeStart, lt: rangeEnd } },
      include: { course: true }, orderBy: { startsAt: "asc" }, take: 100
    }),
    prisma.userPreference.findMany({ where: { userId: input.userId, key: { startsWith: "teacher-note:" } }, orderBy: { updatedAt: "desc" }, take: 100 }),
    prisma.aIConversation.findMany({ where: { userId: input.userId, institutionId: input.institutionId, scope: "TEACHER" }, orderBy: { updatedAt: "desc" }, take: 100 }),
    prisma.activity.findMany({
      where: { institutionId: input.institutionId, OR: [{ actorId: input.userId }, { type: { in: ["CONTENT", "ANNOUNCEMENT", "SYSTEM"] } }] },
      include: { actor: true },
      orderBy: { createdAt: "desc" },
      take: 100
    }),
    prisma.notification.findMany({ where: { OR: [{ userId: input.userId, institutionId: input.institutionId }, { userId: null, institutionId: input.institutionId }] }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.userPreference.findMany({ where: { userId: input.userId, key: { startsWith: "notification-state:" } } }),
    prisma.downloadHistory.findMany({ where: { userId: input.userId, item: { institutionId: input.institutionId } }, include: { item: { include: { course: true, subject: true } } }, orderBy: { downloadedAt: "desc" }, take: 100 }),
    prisma.commerceOrderItem.findMany({ where: { order: { buyerId: input.userId, institutionId: input.institutionId, status: "PAID" }, resourceId: { not: null }, resource: { institutionId: input.institutionId } }, include: { resource: { include: { course: true, subject: true } }, order: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.favoriteItem.findMany({ where: { userId: input.userId }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.recentItem.findMany({ where: { userId: input.userId }, orderBy: { viewedAt: "desc" }, take: 100 }),
    prisma.course.findMany({ where: { institutionId: input.institutionId }, orderBy: { name: "asc" } }),
    prisma.subject.findMany({ where: { course: { institutionId: input.institutionId } }, include: { course: true }, orderBy: { name: "asc" } })
  ]);

  return {
    personalWorkspace,
    classrooms: teacher.classrooms.map((classroom) => {
      const attendanceRecords = classroom.attendanceSessions.flatMap((session) => session.records);
      const present = attendanceRecords.filter((record) => record.status === "PRESENT").length;
      const submissions = classroom.assignments.flatMap((assignment) => assignment.submissions);
      return {
        id: classroom.id,
        title: classroom.title,
        course: classroom.course.name,
        section: classroom.batch.name,
        subjects: classroom.course.subjects.map((subject) => subject.name),
        studentCount: classroom.batch.students.length,
        attendanceRate: attendanceRecords.length ? Math.round((present / attendanceRecords.length) * 100) : null,
        resourceCount: classroom.materials.length,
        homeworkPending: submissions.filter((submission) => submission.status === "SUBMITTED" || submission.status === "LATE").length,
        notes: classroom.announcements.map((announcement) => announcement.title),
        timetable: classroom.batch.timetableEntries.map((entry) => ({
          id: entry.id, day: entry.day, time: `${entry.timeSlot.startsAt}-${entry.timeSlot.endsAt}`,
          subject: entry.subject?.name ?? "Subject", room: entry.room?.name ?? "Room not assigned"
        }))
      };
    }),
    content: content.map((item) => ({
      id: item.id, title: item.title, description: item.description, type: item.type, status: item.status,
      course: item.course.name, courseId: item.courseId, subject: item.subject?.name, subjectId: item.subjectId,
      fileUrl: item.fileUrl ?? item.externalUrl, version: item.version, downloads: item.downloads.length,
      updatedAt: item.updatedAt.toISOString(), tags: [item.type.replaceAll("_", " "), item.course.name, item.subject?.name].filter(Boolean) as string[],
      favorite: favorites.some((favorite) => favorite.entityId === item.id && favorite.type === "teacher-content")
    })),
    planner: planner.map((event) => ({
      id: event.id, title: event.title, type: event.type, description: event.description,
      startsAt: event.startsAt.toISOString(), endsAt: event.endsAt.toISOString(),
      kind: event.kind, status: event.status, priority: event.priority, location: event.location,
      owned: event.createdById === input.userId,
      classroom: event.classroom ? {
        id: event.classroom.id, title: event.classroom.title, course: event.classroom.course.name,
        section: event.classroom.batch.name
      } : null,
      lesson: event.lesson ? {
        id: event.lesson.id, title: event.lesson.title, course: event.lesson.course.name,
        subject: event.lesson.subject?.name ?? null
      } : null
    })),
    timetable: teacher.upcomingClasses.map(({ classroom, entry }) => ({
      id: entry.id, title: `${entry.subject?.name ?? "Class"} - ${classroom.batch.name}`, type: "TEACHING",
      day: entry.day, time: `${entry.timeSlot.startsAt}-${entry.timeSlot.endsAt}`, href: `/classrooms/${classroom.id}`
    })),
    exams: exams.map((exam) => ({ id: exam.id, title: exam.name, type: "EXAM", startsAt: exam.startsAt?.toISOString() ?? exam.createdAt.toISOString(), course: exam.course.name })),
    assignments: teacher.classrooms.flatMap((classroom) => classroom.assignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      dueDate: assignment.dueDate?.toISOString() ?? null,
      status: assignment.status,
      classroomId: classroom.id,
      classroom: classroom.title,
      course: classroom.course.name,
      subject: assignment.subject?.name ?? null,
      pendingReviews: assignment.submissions.filter((submission) => submission.status === "SUBMITTED" || submission.status === "LATE").length,
      href: `/classrooms/${classroom.id}#assignments`
    }))),
    notes: notes.map((note) => {
      const value = jsonRecord(note.value);
      return {
        id: note.id, key: note.key, title: String(value.title ?? "Untitled note"), content: String(value.content ?? ""),
        kind: String(value.kind ?? "PERSONAL"), pinned: Boolean(value.pinned), archived: Boolean(value.archived),
        updatedAt: note.updatedAt.toISOString()
      };
    }),
    aiOutputs: aiOutputs.map((item) => ({
      id: item.id, title: item.title, type: String(jsonRecord(item.context).toolSlug ?? item.title),
      text: assistantText(item.messages), updatedAt: item.updatedAt.toISOString(),
      favorite: favorites.some((favorite) => favorite.entityId === item.id && favorite.type === "ai-generation")
    })),
    activities: [
      ...activities.map((item) => ({
        id: item.id, title: item.title, body: item.body, type: item.type, actor: item.actor?.name,
        link: item.link, createdAt: item.createdAt.toISOString()
      })),
      ...downloads.map((download) => ({
        id: `download-${download.id}`, title: `Downloaded ${download.item.title}`, body: download.item.course.name,
        type: "DOWNLOAD", actor: null, link: `/resources/${download.itemId}`, createdAt: download.downloadedAt.toISOString()
      })),
      ...aiOutputs.map((output) => ({
        id: `ai-${output.id}`, title: `AI generated: ${output.title}`, body: String(jsonRecord(output.context).toolSlug ?? "Teaching Studio"),
        type: "AI", actor: null, link: "/teacher/workspace/saved-ai", createdAt: output.updatedAt.toISOString()
      })),
      ...purchases.map((purchase) => ({
        id: `marketplace-${purchase.id}`, title: `Marketplace order: ${purchase.title}`, body: purchase.order.status,
        type: "MARKETPLACE", actor: null, link: "/teacher/business/orders", createdAt: purchase.createdAt.toISOString()
      })),
      ...recent.map((item) => ({
        id: `recent-${item.id}`, title: `Opened ${item.title}`, body: item.type,
        type: "WORKSPACE", actor: null, link: item.link, createdAt: item.viewedAt.toISOString()
      }))
    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    notifications: notifications.filter((item) => {
      const state=notificationStates.find((entry)=>entry.key===`notification-state:${item.id}`);
      return !(state?.value && typeof state.value==="object" && !Array.isArray(state.value) && Boolean((state.value as Record<string,unknown>).hidden));
    }).map((item) => {
      const state=notificationStates.find((entry)=>entry.key===`notification-state:${item.id}`);
      const read=state?.value && typeof state.value==="object" && !Array.isArray(state.value) && Boolean((state.value as Record<string,unknown>).read);
      return ({
      id: item.id, title: item.title, body: item.body, link: item.link,
      category: String(jsonRecord(item.metadata).category ?? jsonRecord(item.metadata).type ?? "PLATFORM").toUpperCase(),
      createdAt: item.createdAt.toISOString(), status: read ? "READ" as const : item.status
    }); }),
    downloads: downloads.map((download) => ({
      id: download.id, itemId: download.itemId, title: download.item.title, course: download.item.course.name,
      subject: download.item.subject?.name, fileUrl: download.item.fileUrl ?? download.item.externalUrl,
      downloadedAt: download.downloadedAt.toISOString()
    })),
    purchases: purchases.filter((purchase) => purchase.resource).map((purchase) => ({
      id: purchase.id, itemId: purchase.resourceId!, title: purchase.title, course: purchase.resource!.course.name,
      subject: purchase.resource!.subject?.name, fileUrl: purchase.resource!.fileUrl ?? purchase.resource!.externalUrl,
      purchasedAt: purchase.createdAt.toISOString(), total: Number(purchase.total), currency: purchase.order.currency
    })),
    favorites: favorites.map((item) => ({ id: item.id, entityId: item.entityId, type: item.type, title: item.title, link: item.link })),
    recent: recent.map((item) => ({ id: item.id, type: item.type, title: item.title, link: item.link, viewedAt: item.viewedAt.toISOString() })),
    courses: courses.map((course) => ({ id: course.id, name: course.name })),
    subjects: subjects.map((subject) => ({ id: subject.id, name: subject.name, courseId: subject.courseId, course: subject.course.name }))
  };
}
