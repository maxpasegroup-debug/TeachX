import { Prisma, type ExamAttemptStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

type EvaluationInput = {
  attemptId: string;
  studentId: string;
  institutionId: string;
  submissionStatus: Extract<ExamAttemptStatus, "SUBMITTED" | "AUTO_SUBMITTED">;
};

export async function evaluateAttempt(input: EvaluationInput) {
  if (!input.institutionId) throw new Error("Institution context is required.");

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${input.attemptId}, 0))`;
    const attempt = await tx.examAttempt.findFirst({
      where: {
        id: input.attemptId,
        studentId: input.studentId,
        exam: { institutionId: input.institutionId, course: { institutionId: input.institutionId }, status: { in: ["PUBLISHED", "CLOSED"] } }
      },
      include: {
        result: true,
        exam: { include: { questions: { include: { question: true } } } },
        answers: true
      }
    });
    if (!attempt) throw new Error("This attempt is not available to you.");
    if (attempt.status === "EVALUATED" && attempt.result) return attempt.result;
    if (attempt.status !== "IN_PROGRESS") throw new Error("This attempt has already been submitted.");

    const claimed = await tx.examAttempt.updateMany({
      where: { id: attempt.id, studentId: input.studentId, status: "IN_PROGRESS" },
      data: { status: input.submissionStatus, submittedAt: new Date() }
    });
    if (claimed.count !== 1) throw new Error("This attempt has already been submitted.");

    const answerByQuestion = new Map(attempt.answers.map((answer) => [answer.questionId, answer]));
    let score = 0;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    for (const item of attempt.exam.questions) {
      const answer = answerByQuestion.get(item.questionId);
      if (!answer || answer.status === "SKIPPED" || !answer.answer) {
        skipped += 1;
        continue;
      }
      const isCorrect = item.question.correctAnswer?.trim().toLowerCase() === answer.answer.trim().toLowerCase();
      const marksAwarded = isCorrect ? Number(item.marks) : -Number(item.negativeMarks);
      if (isCorrect) correct += 1;
      else wrong += 1;
      score += marksAwarded;
      await tx.examAnswer.update({ where: { id: answer.id }, data: { isCorrect, marksAwarded } });
    }

    const totalMarks = Number(attempt.exam.totalMarks) || attempt.exam.questions.reduce((total, item) => total + Number(item.marks), 0) || 1;
    const percentage = Math.max(0, Math.round((score / totalMarks) * 100));
    const passed = score >= Number(attempt.exam.passingMarks);
    const result = await tx.examResult.create({
      data: { examId: attempt.examId, attemptId: attempt.id, studentId: input.studentId, score, correct, wrong, skipped, percentage, passed }
    });
    await tx.examAttempt.update({ where: { id: attempt.id }, data: { status: "EVALUATED" } });
    return result;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
