import { prisma } from "@/lib/db";

export type StudentPlatformView = "search" | "notifications" | "timeline" | "files";

export async function getStudentPlatform(input: { userId?: string; institutionId?: string | null }) {
  if (!input.userId || !input.institutionId) return null;
  const student = await prisma.user.findFirst({ where: { id: input.userId, institutionId: input.institutionId, status: "ACTIVE", roles: { some: { role: { key: "STUDENT" } } } }, select: { id: true, name: true, institution: { select: { name: true } } } });
  if (!student) return null;
  const [notifications, activities, materials, downloads, notes, bookmarks, assignments, conversations] = await Promise.all([
    prisma.notification.findMany({ where: { OR: [{ userId: student.id }, { userId: null, institutionId: input.institutionId }], status: { not: "ARCHIVED" } }, select: { id: true, title: true, body: true, link: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 80 }),
    prisma.activity.findMany({ where: { institutionId: input.institutionId, OR: [{ actorId: student.id }, { type: { in: ["ANNOUNCEMENT", "ASSIGNMENT", "CONTENT", "SYSTEM"] } }] }, select: { id: true, type: true, title: true, link: true, createdAt: true, actor: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 80 }),
    prisma.studyMaterial.findMany({ where: { classroom: { institutionId: input.institutionId, batch: { students: { some: { studentId: student.id } } } }, publishStatus: "PUBLISHED" }, select: { id: true, title: true, type: true, fileUrl: true, notes: true, createdAt: true, subject: { select: { name: true } }, classroom: { select: { title: true } } }, orderBy: { createdAt: "desc" }, take: 80 }),
    prisma.downloadHistory.findMany({ where: { userId: student.id }, select: { id: true, downloadedAt: true, item: { select: { id: true, title: true, type: true, fileUrl: true } } }, orderBy: { downloadedAt: "desc" }, take: 50 }),
    prisma.studentNote.findMany({ where: { studentId: student.id }, select: { id: true, title: true, body: true, updatedAt: true, targetType: true }, orderBy: { updatedAt: "desc" }, take: 50 }),
    prisma.bookmark.findMany({ where: { studentId: student.id }, select: { id: true, targetId: true, targetType: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.assignment.findMany({ where: { classroom: { institutionId: input.institutionId, batch: { students: { some: { studentId: student.id } } } }, status: "PUBLISHED" }, select: { id: true, title: true, dueDate: true, subject: { select: { name: true } }, classroom: { select: { title: true } } }, orderBy: { dueDate: "asc" }, take: 50 }),
    prisma.aIConversation.findMany({ where: { userId: student.id, scope: "STUDENT" }, select: { id: true, title: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 30 })
  ]);
  const searchItems = [...materials.map((item) => ({ id: `material-${item.id}`, kind: "Material", title: item.title, detail: `${item.subject?.name ?? "General"} · ${item.classroom.title}`, href: "/student/resources" })), ...assignments.map((item) => ({ id: `assignment-${item.id}`, kind: "Assignment", title: item.title, detail: `${item.subject?.name ?? "General"} · due ${(item.dueDate?.toLocaleDateString() ?? "No deadline")}`, href: "/student/assignments" })), ...notes.map((item) => ({ id: `note-${item.id}`, kind: "Saved note", title: item.title || "Untitled note", detail: item.targetType, href: "/student/files" })), ...conversations.map((item) => ({ id: `ai-${item.id}`, kind: "AI conversation", title: item.title || "Untitled AI conversation", detail: "AI Tutor", href: "/student/ask-ai" }))];
  return { student, notifications, activities, materials, downloads, notes, bookmarks, assignments, conversations, searchItems, generatedAt: new Date().toISOString() };
}