import { prisma } from "@/lib/db";

export async function getStudentExamAnalytics(studentId: string) {
  return prisma.performanceAnalytics.findMany({
    where: { studentId },
    include: { exam: true },
    orderBy: { updatedAt: "desc" }
  });
}
