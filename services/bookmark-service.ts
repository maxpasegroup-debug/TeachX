import { prisma } from "@/lib/db";

export async function getBookmarksForStudent(studentId: string, classroomId: string) {
  return prisma.bookmark.findMany({
    where: { studentId, classroomId },
    orderBy: { createdAt: "desc" }
  });
}
