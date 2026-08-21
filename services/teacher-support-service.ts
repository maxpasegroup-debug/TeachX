import { prisma } from "@/lib/db";

const teacherRoles = ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"];

export async function getTeacherSupportData(userId?: string, institutionId?: string | null) {
  if (!userId || !institutionId) return null;
  const teacher = await prisma.user.findFirst({
    where: { id: userId, institutionId, status: "ACTIVE", roles: { some: { role: { key: { in: teacherRoles } } } } },
    select: { id: true }
  });
  if (!teacher) return null;
  const tickets = await prisma.supportTicket.findMany({
    where: { requesterId: userId, institutionId },
    include: { replies: { where: { internal: false }, include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" }, take: 50 } },
    orderBy: { updatedAt: "desc" }, take: 50
  });
  return { tickets };
}
