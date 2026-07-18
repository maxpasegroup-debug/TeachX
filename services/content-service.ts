import { prisma } from "@/lib/db";

export async function getContentStudioOverview(institutionId?: string | null, userId?: string | null, isStudent = false) {
  if (!institutionId) {
    return {
      items: [],
      folders: [],
      courses: [],
      subjects: [],
      chapters: [],
      topics: [],
      classrooms: [],
      batches: []
    };
  }

  const studentClassroomFilter = isStudent && userId
    ? { classroom: { batch: { students: { some: { studentId: userId } } } }, status: "PUBLISHED" as const }
    : {};

  const [items, folders, courses, subjects, chapters, topics, classrooms, batches] = await Promise.all([
    prisma.contentItem.findMany({
      where: { institutionId, ...studentClassroomFilter },
      include: {
        course: true,
        subject: true,
        chapter: true,
        topic: true,
        classroom: true,
        batch: true,
        createdBy: true,
        analytics: true,
        versions: { orderBy: { version: "desc" }, take: 3 },
        reviews: { include: { reviewer: true }, orderBy: { createdAt: "desc" }, take: 3 },
        approvals: { include: { approver: true }, orderBy: { createdAt: "desc" }, take: 3 }
      },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.contentFolder.findMany({ where: { institutionId }, include: { course: true, subject: true, chapter: true, topic: true, _count: { select: { items: true } } }, orderBy: { order: "asc" } }),
    prisma.course.findMany({ where: { institutionId }, include: { subjects: { orderBy: { order: "asc" } } }, orderBy: { name: "asc" } }),
    prisma.subject.findMany({ where: { course: { institutionId } }, orderBy: [{ courseId: "asc" }, { order: "asc" }] }),
    prisma.chapter.findMany({ where: { course: { institutionId } }, include: { subject: true }, orderBy: { order: "asc" } }),
    prisma.topic.findMany({ where: { course: { institutionId } }, include: { subject: true, chapter: true }, orderBy: { order: "asc" } }),
    prisma.classroom.findMany({ where: { institutionId }, include: { course: true, batch: true }, orderBy: { updatedAt: "desc" } }),
    prisma.batch.findMany({ where: { course: { institutionId } }, include: { course: true }, orderBy: { name: "asc" } })
  ]);

  return { items, folders, courses, subjects, chapters, topics, classrooms, batches };
}

export async function searchContent(institutionId: string, query: string, userId?: string, isStudent = false) {
  const contains = { contains: query, mode: "insensitive" as const };
  const studentClassroomFilter = isStudent && userId
    ? { classroom: { batch: { students: { some: { studentId: userId } } } }, status: "PUBLISHED" as const }
    : {};

  return prisma.contentItem.findMany({
    where: {
      institutionId,
      ...studentClassroomFilter,
      OR: [
        { title: contains },
        { description: contains },
        { course: { name: contains } },
        { subject: { name: contains } },
        { chapter: { name: contains } },
        { topic: { name: contains } },
        { createdBy: { name: contains } },
        { fileUrl: contains },
        { externalUrl: contains }
      ]
    },
    include: { course: true, subject: true, chapter: true, topic: true, createdBy: true, analytics: true },
    take: 30,
    orderBy: { updatedAt: "desc" }
  });
}

export async function getContentItem(itemId: string, institutionId?: string | null) {
  if (!institutionId) return null;

  return prisma.contentItem.findFirst({
    where: { id: itemId, institutionId },
    include: {
      course: true,
      subject: true,
      chapter: true,
      topic: true,
      classroom: true,
      batch: true,
      createdBy: true,
      analytics: true,
      versions: { include: { updatedBy: true }, orderBy: { version: "desc" } },
      reviews: { include: { reviewer: true }, orderBy: { createdAt: "desc" } },
      approvals: { include: { approver: true }, orderBy: { createdAt: "desc" } },
      transcript: true,
      externalContent: true
    }
  });
}
