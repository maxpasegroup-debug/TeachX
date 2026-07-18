import { prisma } from "@/lib/db";

export async function publishContent(itemId: string) {
  return prisma.contentItem.update({
    where: { id: itemId },
    data: {
      status: "PUBLISHED",
      visibility: "ENROLLED_STUDENTS",
      publishedAt: new Date()
    }
  });
}

export async function archiveContent(itemId: string) {
  return prisma.contentItem.update({ where: { id: itemId }, data: { status: "ARCHIVED", visibility: "PRIVATE" } });
}

export async function duplicateContent(itemId: string, userId?: string) {
  const item = await prisma.contentItem.findUniqueOrThrow({ where: { id: itemId }, include: { versions: { orderBy: { version: "desc" }, take: 1 } } });
  return prisma.contentItem.create({
    data: {
      institutionId: item.institutionId,
      folderId: item.folderId,
      courseId: item.courseId,
      subjectId: item.subjectId,
      chapterId: item.chapterId,
      topicId: item.topicId,
      classroomId: item.classroomId,
      batchId: item.batchId,
      createdById: userId ?? item.createdById,
      title: `${item.title} Copy`,
      description: item.description,
      type: item.type,
      fileUrl: item.fileUrl,
      externalUrl: item.externalUrl,
      storageKey: item.storageKey,
      mimeType: item.mimeType,
      sizeBytes: item.sizeBytes,
      durationSeconds: item.durationSeconds,
      status: "DRAFT",
      versions: {
        create: {
          version: 1,
          title: `${item.title} Copy`,
          fileUrl: item.fileUrl,
          externalUrl: item.externalUrl,
          storageKey: item.storageKey,
          sizeBytes: item.sizeBytes,
          updatedById: userId,
          changeNote: "Duplicated from existing content"
        }
      },
      analytics: { create: {} }
    }
  });
}
