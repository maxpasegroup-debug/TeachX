import { prisma } from "@/lib/db";

export async function getProgressForStudent(studentId: string, classroomId: string) {
  return prisma.learningProgress.findMany({
    where: { studentId, classroomId },
    include: { subject: true },
    orderBy: { updatedAt: "desc" }
  });
}
