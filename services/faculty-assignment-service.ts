import { prisma } from "@/lib/db";
import type { RoleKey } from "@/lib/constants/roles";

const facultyRoles: RoleKey[] = ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"];

export async function getAssignableFaculty(institutionId?: string | null) {
  if (!institutionId) return [];

  return prisma.user.findMany({
    where: {
      institutionId,
      roles: {
        some: {
          role: {
            key: { in: facultyRoles }
          }
        }
      }
    },
    orderBy: { name: "asc" }
  });
}
