import { prisma } from "@/lib/db";

export const institutionModules = ["dashboard", "profile", "departments", "faculty", "academics", "classes", "timetable", "announcements", "reports", "settings"] as const;
export type InstitutionModule = (typeof institutionModules)[number];

export async function getInstitutionWorkspaceData(institutionId?: string | null) {
  if (!institutionId) return null;
  const [institution, departments, years, courses, batches, classrooms, faculty, timetable, announcements, notifications, activities, settings, aiUsage, timeSlots, rooms, events] = await Promise.all([
    prisma.institution.findUnique({ where: { id: institutionId } }),
    prisma.department.findMany({ where: { institutionId }, include: { courses: { include: { subjects: true, batches: { include: { faculty: true, students: true } } } } }, orderBy: { name: "asc" } }),
    prisma.academicYear.findMany({ where: { institutionId }, include: { terms: { orderBy: { order: "asc" } } }, orderBy: { startDate: "desc" } }),
    prisma.course.findMany({ where: { institutionId }, include: { subjects: true, department: true }, orderBy: { name: "asc" } }),
    prisma.batch.findMany({ where: { course: { institutionId } }, include: { course: true, faculty: { include: { faculty: true } }, students: true, classroom: true }, orderBy: { name: "asc" } }),
    prisma.classroom.findMany({ where: { institutionId }, include: { course: true, batch: { include: { students: true, faculty: true } } }, orderBy: { title: "asc" } }),
    prisma.user.findMany({ where: { institutionId, roles: { some: { role: { key: { in: ["ACADEMIC_FACULTY", "ACADEMIC_HEAD", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"] } } } } }, include: { roles: { include: { role: true } }, facultyBatches: { include: { batch: { include: { course: true } } } } }, orderBy: { name: "asc" } }),
    prisma.timetableEntry.findMany({ where: { course: { institutionId } }, include: { course: true, batch: true, subject: true, faculty: true, timeSlot: true, room: true }, orderBy: [{ day: "asc" }, { timeSlot: { order: "asc" } }] }),
    prisma.communication.findMany({ where: { institutionId }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.notification.findMany({ where: { institutionId }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.activity.findMany({ where: { institutionId }, include: { actor: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.setting.findMany({ where: { institutionId } }),
    prisma.aIUsage.aggregate({ where: { institutionId }, _sum: { totalTokens: true }, _count: { _all: true } }),
    prisma.timeSlot.findMany({ where: { institutionId }, orderBy: { order: "asc" } }),
    prisma.room.findMany({ where: { institutionId }, orderBy: { name: "asc" } }),
    prisma.plannerEvent.findMany({ where: { institutionId }, orderBy: { startsAt: "asc" }, take: 100 })
  ]);
  if (!institution) return null;
  const profile = (settings.find((x) => x.key === "institution.profile")?.value ?? {}) as Record<string, unknown>;
  const preferences = (settings.find((x) => x.key === "institution.preferences")?.value ?? {}) as Record<string, unknown>;
  const activeStudents = await prisma.user.count({ where: { institutionId, status: "ACTIVE", roles: { some: { role: { key: "STUDENT" } } } } });
  return {
    institution, profile, preferences, departments, years, courses, batches, classrooms, faculty, timetable, announcements, timeSlots, rooms, events,
    notifications, activities, activeStudents, aiUsage: { requests: aiUsage._count._all, credits: aiUsage._sum.totalTokens ?? 0 },
    stats: {
      activeTeachers: faculty.filter((x) => x.status === "ACTIVE").length,
      activeClasses: classrooms.filter((x) => x.status === "ACTIVE").length,
      departments: departments.filter((x) => x.status === "ACTIVE").length,
      courses: courses.filter((x) => x.status === "ACTIVE").length
    }
  };
}
