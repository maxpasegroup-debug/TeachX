import { prisma } from "@/lib/db";

export async function getStudentNotes(studentId: string, classroomId: string) {
  return prisma.studentNote.findMany({
    where: { studentId, classroomId },
    orderBy: { updatedAt: "desc" }
  });
}
