import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export type StudentClassroom = Prisma.ClassroomGetPayload<{
  include: {
    course: { include: { subjects: true } };
    batch: {
      include: {
        timetableEntries: { include: { timeSlot: true; subject: true; room: true; faculty: true } };
      };
    };
    announcements: true;
    materials: { include: { subject: true } };
    assignments: { include: { submissions: true; subject: true } };
    attendanceSessions: { include: { records: true } };
    recordings: true;
    liveSessions: true;
    learningProgress: true;
    videoProgress: true;
    bookmarks: true;
    studentNotes: true;
    discussionThreads: { include: { replies: true } };
  };
}>;

export async function getStudentClassrooms(studentId?: string, institutionId?: string | null) {
  if (!studentId || !institutionId) return [];

  return prisma.classroom.findMany({
    where: {
      institutionId,
      batch: {
        students: {
          some: { studentId }
        }
      }
    },
    include: {
      course: { include: { subjects: { orderBy: { order: "asc" } } } },
      batch: {
        include: {
          timetableEntries: { include: { timeSlot: true, subject: true, room: true, faculty: true }, orderBy: [{ day: "asc" }] }
        }
      },
      announcements: { orderBy: { createdAt: "desc" }, take: 5 },
      materials: { include: { subject: true }, orderBy: { createdAt: "desc" }, take: 10 },
      assignments: {
        include: {
          subject: true,
          submissions: { where: { studentId } }
        },
        orderBy: { dueDate: "asc" },
        take: 10
      },
      attendanceSessions: {
        include: { records: { where: { studentId } } },
        orderBy: { date: "desc" },
        take: 30
      },
      recordings: { orderBy: { createdAt: "desc" }, take: 10 },
      liveSessions: { orderBy: { scheduledAt: "asc" }, take: 10 },
      learningProgress: { where: { studentId } },
      videoProgress: { where: { studentId } },
      bookmarks: { where: { studentId } },
      studentNotes: { where: { studentId }, orderBy: { updatedAt: "desc" }, take: 10 },
      discussionThreads: { include: { replies: true }, orderBy: { createdAt: "desc" }, take: 5 }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getStudentClassroom(classroomId: string, studentId?: string, institutionId?: string | null) {
  const classrooms = await getStudentClassrooms(studentId, institutionId);
  return classrooms.find((classroom) => classroom.id === classroomId) ?? null;
}

export async function getStudentHome(studentId?: string, institutionId?: string | null) {
  const classrooms = await getStudentClassrooms(studentId, institutionId);
  const today = new Date().toLocaleDateString("en", { weekday: "long" }).toUpperCase();

  const todaysClasses = classrooms.flatMap((classroom) =>
    classroom.batch.timetableEntries.filter((entry) => entry.day === today).map((entry) => ({ classroom, entry }))
  );
  const pendingAssignments = classrooms.flatMap((classroom) =>
    classroom.assignments.filter((assignment) => assignment.status === "PUBLISHED" && assignment.submissions.every((submission) => submission.status === "PENDING"))
  );
  const upcomingLiveClasses = classrooms.flatMap((classroom) => classroom.liveSessions.filter((session) => session.status === "SCHEDULED"));
  const recordedClasses = classrooms.flatMap((classroom) => classroom.recordings);
  const announcements = classrooms.flatMap((classroom) => classroom.announcements).slice(0, 6);

  return {
    classrooms,
    continueLearning: classrooms[0],
    todaysClasses,
    upcomingLiveClasses,
    recordedClasses,
    pendingAssignments,
    announcements,
    upcomingTests: [],
    certificates: [],
    progress: classrooms.flatMap((classroom) => classroom.learningProgress)
  };
}
