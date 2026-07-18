import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type CourseWithDetails = Prisma.CourseGetPayload<{
  include: {
    branch: true;
    academicYear: true;
    department: true;
    subjects: { orderBy: { order: "asc" } };
    _count: { select: { batches: true; subjects: true } };
  };
}>;

export async function getCoursesForInstitution(institutionId?: string | null) {
  if (!institutionId) return [];

  return prisma.course.findMany({
    where: { institutionId },
    include: {
      branch: true,
      academicYear: true,
      department: true,
      subjects: {
        orderBy: { order: "asc" }
      },
      _count: {
        select: { batches: true, subjects: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}
