import { prisma } from "@/lib/db";

export async function getAcademicSetup(institutionId?: string | null) {
  if (!institutionId) {
    return {
      branches: [],
      academicYears: [],
      departments: [],
      timeSlots: [],
      rooms: [],
      events: []
    };
  }

  const [branches, academicYears, departments, timeSlots, rooms, events] = await Promise.all([
    prisma.branch.findMany({ where: { institutionId }, orderBy: { name: "asc" } }),
    prisma.academicYear.findMany({ where: { institutionId }, orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }] }),
    prisma.department.findMany({ where: { institutionId }, orderBy: { name: "asc" } }),
    prisma.timeSlot.findMany({ where: { institutionId }, orderBy: [{ order: "asc" }, { startsAt: "asc" }] }),
    prisma.room.findMany({ where: { institutionId }, orderBy: { name: "asc" } }),
    prisma.plannerEvent.findMany({ where: { institutionId }, orderBy: { startsAt: "asc" }, take: 8 })
  ]);

  return { branches, academicYears, departments, timeSlots, rooms, events };
}
