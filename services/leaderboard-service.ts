import { prisma } from "@/lib/db";

export async function getLeaderboard(examId: string) {
  return prisma.leaderboard.findMany({
    where: { examId },
    orderBy: [{ scope: "asc" }, { rank: "asc" }]
  });
}

export async function rebuildLeaderboard(examId: string) {
  const results = await prisma.examResult.findMany({ where: { examId }, orderBy: [{ score: "desc" }, { percentage: "desc" }] });
  await prisma.leaderboard.deleteMany({ where: { examId, scope: "BATCH" } });
  await Promise.all(results.map((result, index) =>
    prisma.leaderboard.create({
      data: {
        examId,
        studentId: result.studentId,
        rank: index + 1,
        scope: "BATCH",
        score: result.score,
        accuracy: result.percentage
      }
    })
  ));
}
