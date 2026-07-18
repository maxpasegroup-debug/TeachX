import { prisma } from "@/lib/db";

export async function getRecordingsForClassroom(classroomId: string) {
  return prisma.recording.findMany({
    where: { classroomId },
    orderBy: { createdAt: "desc" }
  });
}
