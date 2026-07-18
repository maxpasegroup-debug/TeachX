import { prisma } from "@/lib/db";

export async function evaluateAttempt(attemptId: string) {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: { include: { questions: { include: { question: true } } } },
      answers: { include: { question: true } }
    }
  });

  if (!attempt) throw new Error("Attempt not found.");

  let score = 0;
  let correct = 0;
  let wrong = 0;
  let skipped = 0;

  for (const answer of attempt.answers) {
    if (answer.status === "SKIPPED" || !answer.answer) {
      skipped += 1;
      continue;
    }
    const isCorrect = answer.question.correctAnswer?.trim().toLowerCase() === answer.answer.trim().toLowerCase();
    const marks = Number(answer.question.marks);
    const negative = Number(answer.question.negativeMarks);
    const marksAwarded = isCorrect ? marks : -negative;
    if (isCorrect) correct += 1;
    else wrong += 1;
    score += marksAwarded;
    await prisma.examAnswer.update({ where: { id: answer.id }, data: { isCorrect, marksAwarded } });
  }

  const totalMarks = Number(attempt.exam.totalMarks) || attempt.exam.questions.reduce((total, item) => total + Number(item.marks), 0) || 1;
  const percentage = Math.max(0, Math.round((score / totalMarks) * 100));
  const passed = score >= Number(attempt.exam.passingMarks);

  const result = await prisma.examResult.upsert({
    where: { attemptId },
    update: { score, correct, wrong, skipped, percentage, passed },
    create: { examId: attempt.examId, attemptId, studentId: attempt.studentId, score, correct, wrong, skipped, percentage, passed }
  });

  await prisma.examAttempt.update({ where: { id: attemptId }, data: { status: "EVALUATED", submittedAt: new Date() } });
  return result;
}
