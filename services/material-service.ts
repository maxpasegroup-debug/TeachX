import { prisma } from "@/lib/db";

export async function getMaterialsForClassroom(classroomId: string, search?: string) {
  return prisma.studyMaterial.findMany({
    where: {
      classroomId,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { chapter: { contains: search, mode: "insensitive" } },
              { topic: { contains: search, mode: "insensitive" } },
              { notes: { contains: search, mode: "insensitive" } }
            ]
          }
        : {})
    },
    include: { subject: true },
    orderBy: { createdAt: "desc" }
  });
}
