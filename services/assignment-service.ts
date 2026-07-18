import { prisma } from "@/lib/db";

export async function getAssignmentsForClassroom(classroomId: string) {
  return prisma.assignment.findMany({
    where: { classroomId },
    include: { subject: true, submissions: true },
    orderBy: { createdAt: "desc" }
  });
}
