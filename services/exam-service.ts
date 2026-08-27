import { Prisma, type ExamAnswerStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { userHasPermission } from "@/lib/rbac";
import type { RoleKey } from "@/lib/constants/roles";
import { evaluateAttempt } from "@/services/evaluation-service";

export type ExamWithDetails = Prisma.ExamGetPayload<{
  include: {
    course: true;
    subject: true;
    batch: true;
    questions: { include: { question: { include: { options: true; topic: true; chapter: true } } } };
    attempts: true;
    results: true;
  };
}>;

export async function getExamsForInstitution(institutionId?: string | null) {
  if (!institutionId) return [];

  return prisma.exam.findMany({
    where: { institutionId },
    include: {
      course: true,
      subject: true,
      batch: true,
      questions: { include: { question: { include: { options: { orderBy: { order: "asc" } }, topic: true, chapter: true } } }, orderBy: { order: "asc" } },
      attempts: true,
      results: true
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getExamForStudent(examId: string, studentId?: string) {
  if (!studentId) return null;

  const student = await getActiveStudent(studentId);
  if (!student?.institutionId) return null;

  return prisma.exam.findFirst({
    where: {
      id: examId,
      institutionId: student.institutionId,
      course: { institutionId: student.institutionId },
      status: "PUBLISHED",
      OR: [
        { batchId: null },
        { batch: { students: { some: { studentId } } } }
      ]
    },
    include: {
      course: true,
      subject: true,
      batch: true,
      questions: { include: { question: { omit: { correctAnswer: true, explanation: true }, include: { options: { omit: { isCorrect: true }, orderBy: { order: "asc" } }, topic: true, chapter: true } } }, orderBy: { order: "asc" } },
      attempts: { where: { studentId }, include: { answers: true, result: true } },
      results: { where: { studentId } }
    }
  });
}

export async function getAvailableStudentExams(studentId?: string) {
  if (!studentId) return [];

  const student = await getActiveStudent(studentId);
  if (!student?.institutionId) return [];

  return prisma.exam.findMany({
    where: {
      institutionId: student.institutionId,
      course: { institutionId: student.institutionId },
      status: "PUBLISHED",
      OR: [
        { batchId: null },
        { batch: { students: { some: { studentId } } } }
      ]
    },
    include: { course: true, subject: true, batch: true, attempts: { where: { studentId }, include: { result: true } } },
    orderBy: { startsAt: "asc" }
  });
}

async function getActiveStudent(studentId: string) {
  return prisma.user.findFirst({
    where: { id: studentId, status: "ACTIVE", institutionId: { not: null }, roles: { some: { role: { key: "STUDENT" } } } },
    select: { id: true, institutionId: true }
  });
}

function assertExamWindow(exam: { startsAt: Date | null; endsAt: Date | null }, now: Date, operation: "start" | "answer") {
  if (exam.startsAt && exam.startsAt > now) throw new Error("This exam has not started yet.");
  if (exam.endsAt && exam.endsAt <= now) throw new Error(operation === "start" ? "This exam is closed." : "The exam time has ended. Submit your current attempt.");
}

function attemptDeadline(attempt: { startedAt: Date; exam: { endsAt: Date | null; durationSeconds: number } }) {
  const durationEnd = new Date(attempt.startedAt.getTime() + attempt.exam.durationSeconds * 1000);
  return attempt.exam.endsAt && attempt.exam.endsAt < durationEnd ? attempt.exam.endsAt : durationEnd;
}

export async function startStudentExamAttempt(input: { studentId: string; examId: string }) {
  const student = await getActiveStudent(input.studentId);
  if (!student?.institutionId) throw new Error("Active student access is required.");
  const institutionId = student.institutionId;
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${input.examId}:${student.id}`}, 0))`;
    const exam = await tx.exam.findFirst({
      where: {
        id: input.examId,
        institutionId,
        course: { institutionId },
        status: "PUBLISHED",
        OR: [{ batchId: null }, { batch: { students: { some: { studentId: student.id } } } }]
      },
      select: { id: true, startsAt: true, endsAt: true, attemptsAllowed: true }
    });
    if (!exam) throw new Error("This exam is not available to your enrollment.");
    assertExamWindow(exam, now, "start");

    const active = await tx.examAttempt.findFirst({ where: { examId: exam.id, studentId: student.id, status: "IN_PROGRESS" }, orderBy: { startedAt: "desc" } });
    if (active) return active;
    const used = await tx.examAttempt.count({ where: { examId: exam.id, studentId: student.id } });
    if (used >= exam.attemptsAllowed) throw new Error("You have used all allowed attempts for this exam.");
    return tx.examAttempt.create({ data: { examId: exam.id, studentId: student.id } });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function saveStudentExamAnswer(input: { studentId: string; attemptId: string; questionId: string; answer?: string; status: ExamAnswerStatus }) {
  const student = await getActiveStudent(input.studentId);
  if (!student?.institutionId) throw new Error("Active student access is required.");
  const institutionId = student.institutionId;
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${input.attemptId}, 0))`;
    const attempt = await tx.examAttempt.findFirst({
      where: {
        id: input.attemptId,
        studentId: student.id,
        status: "IN_PROGRESS",
        exam: {
          institutionId,
          course: { institutionId },
          status: "PUBLISHED",
          questions: { some: { questionId: input.questionId } },
          OR: [{ batchId: null }, { batch: { students: { some: { studentId: student.id } } } }]
        }
      },
      select: { id: true, startedAt: true, exam: { select: { endsAt: true, startsAt: true, durationSeconds: true } } }
    });
    if (!attempt) throw new Error("This question or attempt is not available to you.");
    const now = new Date();
    assertExamWindow(attempt.exam, now, "answer");
    if (now >= attemptDeadline(attempt)) throw new Error("The attempt time has ended. Submit your current work.");
    return tx.examAnswer.upsert({
      where: { attemptId_questionId: { attemptId: attempt.id, questionId: input.questionId } },
      update: { answer: input.answer, status: input.status },
      create: { attemptId: attempt.id, questionId: input.questionId, answer: input.answer, status: input.status }
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function submitStudentExamAttempt(input: { studentId: string; attemptId: string }) {
  const student = await getActiveStudent(input.studentId);
  if (!student?.institutionId) throw new Error("Active student access is required.");
  const attempt = await prisma.examAttempt.findFirst({
    where: {
      id: input.attemptId,
      studentId: student.id,
      exam: {
        institutionId: student.institutionId,
        course: { institutionId: student.institutionId },
        status: { in: ["PUBLISHED", "CLOSED"] },
        OR: [{ batchId: null }, { batch: { students: { some: { studentId: student.id } } } }]
      }
    },
    select: { id: true, status: true, startedAt: true, result: { select: { id: true } }, exam: { select: { id: true, endsAt: true, durationSeconds: true } } }
  });
  if (!attempt) throw new Error("This attempt is not available to you.");
  if (attempt.status === "EVALUATED" && attempt.result) return { examId: attempt.exam.id, idempotent: true };
  if (attempt.status !== "IN_PROGRESS") throw new Error("This attempt has already been submitted.");
  const autoSubmitted = new Date() >= attemptDeadline(attempt);
  const result = await evaluateAttempt({ attemptId: attempt.id, studentId: student.id, institutionId: student.institutionId, submissionStatus: autoSubmitted ? "AUTO_SUBMITTED" : "SUBMITTED" });
  return { examId: result.examId, idempotent: false };
}

export async function canAccessExamLeaderboard(input: { examId: string; userId: string; institutionId: string; roles: RoleKey[] }) {
  if (input.roles.includes("STUDENT")) {
    return (await prisma.exam.count({
      where: {
        id: input.examId,
        institutionId: input.institutionId,
        course: { institutionId: input.institutionId },
        results: { some: { studentId: input.userId } },
        OR: [{ batchId: null }, { batch: { students: { some: { studentId: input.userId } } } }]
      }
    })) === 1;
  }
  if (!userHasPermission(input.roles, "exams.view")) return false;
  return (await prisma.exam.count({ where: { id: input.examId, institutionId: input.institutionId, course: { institutionId: input.institutionId } } })) === 1;
}

export async function getStudentExamResult(examId: string, studentId: string) {
  const student = await getActiveStudent(studentId);
  if (!student?.institutionId) return null;
  return prisma.exam.findFirst({
    where: {
      id: examId,
      institutionId: student.institutionId,
      course: { institutionId: student.institutionId },
      attempts: { some: { studentId, status: "EVALUATED", result: { isNot: null } } },
      OR: [{ batchId: null }, { batch: { students: { some: { studentId } } } }]
    },
    include: {
      course: true,
      subject: true,
      batch: true,
      questions: { include: { question: { include: { options: { orderBy: { order: "asc" } }, topic: true, chapter: true } } }, orderBy: { order: "asc" } },
      attempts: { where: { studentId }, include: { answers: true, result: true } },
      results: { where: { studentId } }
    }
  });
}
