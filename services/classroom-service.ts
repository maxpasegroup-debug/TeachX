import type { Prisma } from "@prisma/client";

import type { RoleKey } from "@/lib/constants/roles";
import { prisma } from "@/lib/db";

export type ClassroomWithDetails = Prisma.ClassroomGetPayload<{
  include: {
    course: { include: { subjects: true } };
    batch: {
      include: {
        students: { include: { student: { include: { profile: true } } } };
        faculty: { include: { faculty: true } };
        timetableEntries: { include: { timeSlot: true; subject: true; room: true; faculty: true } };
      };
    };
    announcements: true;
    materials: { include: { subject: true } };
    assignments: { include: { submissions: true; subject: true } };
    attendanceSessions: { include: { records: true } };
    recordings: true;
    liveSessions: true;
  };
}>;

const allClassroomRoles: RoleKey[] = ["ACADEMIC_HEAD", "ADMIN"];
const readAllRoles: RoleKey[] = ["DIRECTOR", "ACADEMIC_HEAD", "ADMIN"];

export function canManageAllClassrooms(roles: RoleKey[]) {
  return roles.some((role) => allClassroomRoles.includes(role));
}

export function canReadAllClassrooms(roles: RoleKey[]) {
  return roles.some((role) => readAllRoles.includes(role));
}

export async function ensureClassroomsForInstitution(institutionId?: string | null) {
  if (!institutionId) return;

  const batches = await prisma.batch.findMany({
    where: { course: { institutionId } },
    include: { course: true, classroom: true }
  });

  await Promise.all(
    batches
      .filter((batch) => !batch.classroom)
      .map((batch) =>
        prisma.classroom.create({
          data: {
            institutionId,
            courseId: batch.courseId,
            batchId: batch.id,
            title: `${batch.course.name} - ${batch.name}`
          }
        })
      )
  );
}

export async function getClassroomsForUser(userId?: string, institutionId?: string | null, roles: RoleKey[] = []) {
  if (!userId || !institutionId) return [];

  await ensureClassroomsForInstitution(institutionId);

  return prisma.classroom.findMany({
    where: {
      institutionId,
      ...(canReadAllClassrooms(roles)
        ? {}
        : {
            batch: {
              faculty: {
                some: { facultyId: userId }
              }
            }
          })
    },
    include: {
      course: { include: { subjects: { orderBy: { order: "asc" } } } },
      batch: {
        include: {
          students: { include: { student: { include: { profile: true } } } },
          faculty: { include: { faculty: true } },
          timetableEntries: { include: { timeSlot: true, subject: true, room: true, faculty: true }, orderBy: [{ day: "asc" }] }
        }
      },
      announcements: { orderBy: { createdAt: "desc" }, take: 4 },
      materials: { include: { subject: true }, orderBy: { createdAt: "desc" }, take: 6 },
      assignments: { include: { submissions: true, subject: true }, orderBy: { createdAt: "desc" }, take: 6 },
      attendanceSessions: { include: { records: true }, orderBy: { date: "desc" }, take: 6 },
      recordings: { orderBy: { createdAt: "desc" }, take: 6 },
      liveSessions: { orderBy: { scheduledAt: "asc" }, take: 6 }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getClassroomForUser(classroomId: string, userId?: string, institutionId?: string | null, roles: RoleKey[] = []) {
  const classrooms = await getClassroomsForUser(userId, institutionId, roles);
  return classrooms.find((classroom) => classroom.id === classroomId) ?? null;
}

export async function getTeacherDashboard(userId?: string, institutionId?: string | null, roles: RoleKey[] = []) {
  const classrooms = await getClassroomsForUser(userId, institutionId, roles);
  const today = new Date();
  const dayName = today.toLocaleDateString("en", { weekday: "long" }).toUpperCase();

  const todaysClasses = classrooms.flatMap((classroom) =>
    classroom.batch.timetableEntries
      .filter((entry) => entry.day === dayName)
      .map((entry) => ({ classroom, entry }))
  );

  const upcomingClasses = classrooms.flatMap((classroom) =>
    classroom.batch.timetableEntries.slice(0, 3).map((entry) => ({ classroom, entry }))
  );

  const pendingAttendance = classrooms.filter((classroom) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return !classroom.attendanceSessions.some((session) => new Date(session.date).getTime() === todayStart.getTime() && session.savedAt);
  });

  const assignmentsAwaitingReview = classrooms.reduce((count, classroom) => {
    return count + classroom.assignments.reduce((inner, assignment) => inner + assignment.submissions.filter((submission) => submission.status === "SUBMITTED" || submission.status === "LATE").length, 0);
  }, 0);

  return {
    classrooms,
    todaysClasses,
    upcomingClasses,
    pendingAttendance,
    assignmentsAwaitingReview,
    recentMaterials: classrooms.flatMap((classroom) => classroom.materials).slice(0, 5),
    upcomingLiveClasses: classrooms.flatMap((classroom) => classroom.liveSessions.filter((session) => session.status === "SCHEDULED")).slice(0, 5)
  };
}
