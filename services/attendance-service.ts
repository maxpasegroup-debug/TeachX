import { prisma } from "@/lib/db";

export async function getTodayAttendanceSession(classroomId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return prisma.attendanceSession.findUnique({
    where: {
      classroomId_date: {
        classroomId,
        date: today
      }
    },
    include: {
      records: {
        include: {
          student: { include: { profile: true } }
        }
      }
    }
  });
}
