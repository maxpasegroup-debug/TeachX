import { prisma } from "@/lib/db";

export async function getAnnouncementsForClassroom(classroomId: string) {
  return prisma.classroomAnnouncement.findMany({
    where: { classroomId },
    orderBy: { createdAt: "desc" }
  });
}
