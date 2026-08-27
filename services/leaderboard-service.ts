import type { RoleKey } from "@/lib/constants/roles";
import { prisma } from "@/lib/db";
import { canAccessExamLeaderboard } from "@/services/exam-service";

type LeaderboardActor = { userId: string; institutionId: string; roles: RoleKey[] };

export async function getLeaderboard(examId: string, actor: LeaderboardActor) {
  if (!actor.institutionId || !(await canAccessExamLeaderboard({ examId, ...actor }))) return [];
  return prisma.leaderboard.findMany({
    where: { examId, exam: { institutionId: actor.institutionId, course: { institutionId: actor.institutionId } } },
    orderBy: [{ scope: "asc" }, { rank: "asc" }]
  });
}

export async function rebuildLeaderboard(examId: string, institutionId: string) {
  if (!institutionId) throw new Error("Institution context is required.");
  const exam = await prisma.exam.findFirst({ where: { id: examId, institutionId, course: { institutionId } }, select: { id: true } });
  if (!exam) throw new Error("Exam was not found in your institution.");
  const results = await prisma.examResult.findMany({
    where: { examId: exam.id, exam: { institutionId }, attempt: { exam: { institutionId }, student: { institutionId } } },
    orderBy: [{ score: "desc" }, { percentage: "desc" }]
  });
  await prisma.$transaction([
    prisma.leaderboard.deleteMany({ where: { examId: exam.id, scope: "BATCH" } }),
    prisma.leaderboard.createMany({
      data: results.map((result, index) => ({ examId: exam.id, studentId: result.studentId, rank: index + 1, scope: "BATCH", score: result.score, accuracy: result.percentage }))
    })
  ]);
}
