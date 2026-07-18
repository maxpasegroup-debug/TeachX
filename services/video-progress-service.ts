import { prisma } from "@/lib/db";

export async function getVideoProgressForStudent(studentId: string, classroomId: string) {
  return prisma.videoProgress.findMany({
    where: { studentId, classroomId },
    include: { recording: true },
    orderBy: { updatedAt: "desc" }
  });
}
