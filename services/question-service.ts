import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export type QuestionWithDetails = Prisma.QuestionGetPayload<{
  include: {
    course: true;
    subject: true;
    chapter: true;
    topic: true;
    options: true;
    tags: { include: { tag: true } };
  };
}>;

export async function getQuestionBank(institutionId?: string | null) {
  if (!institutionId) return [];

  return prisma.question.findMany({
    where: { course: { institutionId } },
    include: {
      course: true,
      subject: true,
      chapter: true,
      topic: true,
      options: { orderBy: { order: "asc" } },
      tags: { include: { tag: true } }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getQuestionSetup(institutionId?: string | null) {
  if (!institutionId) return { chapters: [], topics: [] };

  const [chapters, topics] = await Promise.all([
    prisma.chapter.findMany({ where: { course: { institutionId } }, include: { subject: true }, orderBy: { order: "asc" } }),
    prisma.topic.findMany({ where: { course: { institutionId } }, include: { subject: true, chapter: true }, orderBy: { order: "asc" } })
  ]);

  return { chapters, topics };
}
