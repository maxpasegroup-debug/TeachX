import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

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

  return prisma.exam.findFirst({
    where: {
      id: examId,
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
      questions: { include: { question: { include: { options: { orderBy: { order: "asc" } }, topic: true, chapter: true } } }, orderBy: { order: "asc" } },
      attempts: { where: { studentId }, include: { answers: true, result: true } },
      results: true
    }
  });
}

export async function getAvailableStudentExams(studentId?: string) {
  if (!studentId) return [];

  return prisma.exam.findMany({
    where: {
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
