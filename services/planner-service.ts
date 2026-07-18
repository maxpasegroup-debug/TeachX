import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type PlannerEntry = Prisma.TimetableEntryGetPayload<{
  include: {
    course: true;
    batch: true;
    timeSlot: true;
    faculty: true;
    subject: true;
    room: true;
  };
}>;

export type PlannerOverride = Prisma.DailyScheduleOverrideGetPayload<{
  include: {
    timetableEntry: { include: { batch: true; timeSlot: true } };
    faculty: true;
    subject: true;
    room: true;
  };
}>;

export type PlannerBatch = Prisma.BatchGetPayload<{
  include: { course: true };
}>;

export type PlannerSubject = Prisma.SubjectGetPayload<{
  include: { course: true };
}>;

export async function getPlannerData(institutionId?: string | null) {
  if (!institutionId) {
    return {
      entries: [],
      overrides: [],
      timeSlots: [],
      courses: [],
      batches: [],
      faculty: [],
      subjects: [],
      rooms: []
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [entries, overrides, timeSlots, courses, batches, faculty, subjects, rooms] = await Promise.all([
    prisma.timetableEntry.findMany({
      where: {
        course: { institutionId }
      },
      include: {
        course: true,
        batch: true,
        timeSlot: true,
        faculty: true,
        subject: true,
        room: true
      },
      orderBy: [{ day: "asc" }]
    }),
    prisma.dailyScheduleOverride.findMany({
      where: {
        date: { gte: today, lt: tomorrow },
        OR: [
          { timetableEntry: { course: { institutionId } } },
          { faculty: { institutionId } },
          { room: { institutionId } }
        ]
      },
      include: {
        timetableEntry: {
          include: {
            batch: true,
            timeSlot: true
          }
        },
        faculty: true,
        subject: true,
        room: true
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.timeSlot.findMany({ where: { institutionId }, orderBy: [{ order: "asc" }, { startsAt: "asc" }] }),
    prisma.course.findMany({ where: { institutionId }, orderBy: { name: "asc" } }),
    prisma.batch.findMany({ where: { course: { institutionId } }, include: { course: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: {
        institutionId,
        roles: {
          some: {
            role: { key: { in: ["ACADEMIC_HEAD", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"] } }
          }
        }
      },
      orderBy: { name: "asc" }
    }),
    prisma.subject.findMany({ where: { course: { institutionId } }, include: { course: true }, orderBy: [{ courseId: "asc" }, { order: "asc" }] }),
    prisma.room.findMany({ where: { institutionId }, orderBy: { name: "asc" } })
  ]);

  return { entries, overrides, timeSlots, courses, batches, faculty, subjects, rooms };
}
