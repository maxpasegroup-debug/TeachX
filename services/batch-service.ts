import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type BatchWithDetails = Prisma.BatchGetPayload<{
  include: {
    course: true;
    branch: true;
    academicYear: true;
    faculty: { include: { faculty: true } };
    _count: { select: { students: true } };
  };
}>;

export async function getBatchesForInstitution(institutionId?: string | null) {
  if (!institutionId) return [];

  return prisma.batch.findMany({
    where: {
      course: {
        institutionId
      }
    },
    include: {
      course: true,
      branch: true,
      academicYear: true,
      faculty: {
        include: {
          faculty: true
        }
      },
      _count: {
        select: { students: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}
