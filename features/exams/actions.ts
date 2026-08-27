"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { requireAcademicReferences } from "@/services/academic-integrity-service";
import { saveStudentExamAnswer, startStudentExamAttempt, submitStudentExamAttempt } from "@/services/exam-service";
import { parseQuestionImport } from "@/services/question-import-service";
import { rebuildLeaderboard } from "@/services/leaderboard-service";

function optionalText(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  return text || undefined;
}

async function getExamManager() {
  const user = await requireCurrentUser("exams.manage");
  if (!user.institutionId) throw new Error("Institution is required.");
  return { user, institutionId: user.institutionId };
}

const questionSchema = z.object({
  courseId: z.string().min(1),
  subjectId: z.string().min(1),
  chapterId: z.string().optional(),
  topicId: z.string().optional(),
  type: z.enum(["MCQ", "MULTIPLE_CORRECT", "TRUE_FALSE", "SHORT_ANSWER", "LONG_ANSWER", "IMAGE", "PARAGRAPH", "ASSERTION_REASON", "CASE_STUDY"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "ADVANCED"]),
  visibility: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  question: z.string().min(2),
  correctAnswer: z.string().optional(),
  explanation: z.string().optional(),
  marks: z.string().optional(),
  negativeMarks: z.string().optional()
});

export async function createQuestionAction(_: string | undefined, formData: FormData) {
  const { user, institutionId } = await getExamManager();
  const parsed = questionSchema.safeParse({
    courseId: optionalText(formData.get("courseId")),
    subjectId: optionalText(formData.get("subjectId")),
    chapterId: optionalText(formData.get("chapterId")),
    topicId: optionalText(formData.get("topicId")),
    type: optionalText(formData.get("type")) ?? "MCQ",
    difficulty: optionalText(formData.get("difficulty")) ?? "MEDIUM",
    visibility: optionalText(formData.get("visibility")) ?? "DRAFT",
    question: optionalText(formData.get("question")),
    correctAnswer: optionalText(formData.get("correctAnswer")),
    explanation: optionalText(formData.get("explanation")),
    marks: optionalText(formData.get("marks")),
    negativeMarks: optionalText(formData.get("negativeMarks"))
  });
  if (!parsed.success) return "Please enter question details.";
  await requireAcademicReferences(institutionId, parsed.data);

  const question = await prisma.question.create({
    data: {
      ...parsed.data,
      authorId: user.id,
      marks: parsed.data.marks ?? "1",
      negativeMarks: parsed.data.negativeMarks ?? "0",
      options: {
        create: ["A", "B", "C", "D"].map((label, index) => ({
          label,
          text: optionalText(formData.get(`option${label}`)) ?? "",
          isCorrect: parsed.data.correctAnswer?.toUpperCase() === label,
          order: index + 1
        })).filter((option) => option.text)
      }
    }
  });

  revalidatePath("/exams");
  return `Question saved: ${question.id}`;
}

export async function importQuestionsAction(_: string | undefined, formData: FormData) {
  const { user, institutionId } = await getExamManager();
  const courseId = optionalText(formData.get("courseId"));
  const subjectId = optionalText(formData.get("subjectId"));
  const rawText = optionalText(formData.get("rawText"));
  if (!courseId || !subjectId || !rawText) return "Course, subject and pasted questions are required.";
  await requireAcademicReferences(institutionId, { courseId, subjectId });

  const parsed = parseQuestionImport(rawText);
  await prisma.questionImport.create({
    data: {
      institutionId,
      uploadedById: user.id,
      sourceType: "BULK_PASTE",
      rawText,
      parsedCount: parsed.length,
      aiReadyNotes: "AI assisted import can improve parsing here later."
    }
  });

  await Promise.all(parsed.map((item) =>
    prisma.question.create({
      data: {
        courseId,
        subjectId,
        authorId: user.id,
        type: "MCQ",
        difficulty: "MEDIUM",
        visibility: "DRAFT",
        question: item.question,
        correctAnswer: item.correctAnswer,
        explanation: item.explanation,
        marks: item.marks ?? "1",
        negativeMarks: item.negativeMarks ?? "0",
        imageUrl: item.imagePlaceholder,
        options: {
          create: [
            { label: "A", text: item.optionA ?? "", isCorrect: item.correctAnswer?.toUpperCase() === "A", order: 1 },
            { label: "B", text: item.optionB ?? "", isCorrect: item.correctAnswer?.toUpperCase() === "B", order: 2 },
            { label: "C", text: item.optionC ?? "", isCorrect: item.correctAnswer?.toUpperCase() === "C", order: 3 },
            { label: "D", text: item.optionD ?? "", isCorrect: item.correctAnswer?.toUpperCase() === "D", order: 4 }
          ].filter((option) => option.text)
        }
      }
    })
  ));

  revalidatePath("/exams");
  return `${parsed.length} questions imported.`;
}

export async function createExamAction(_: string | undefined, formData: FormData) {
  const { user, institutionId } = await getExamManager();
  const courseId = optionalText(formData.get("courseId"));
  const name = optionalText(formData.get("name"));
  if (!courseId || !name) return "Exam name and course are required.";

  const duration = optionalText(formData.get("duration")) ?? "00:30:00";
  const [hours = "0", minutes = "30", seconds = "0"] = duration.split(":");
  const durationSeconds = Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
  const subjectId = optionalText(formData.get("subjectId"));
  const chapterId = optionalText(formData.get("chapterId"));
  const topicId = optionalText(formData.get("topicId"));
  const batchId = optionalText(formData.get("batchId"));
  const startsAt = optionalText(formData.get("startsAt"));
  const endsAt = optionalText(formData.get("endsAt"));
  const attemptsAllowed = Number(optionalText(formData.get("attemptsAllowed")) ?? "1");
  if (!Number.isInteger(durationSeconds) || durationSeconds <= 0 || !Number.isInteger(attemptsAllowed) || attemptsAllowed <= 0) return "Duration and attempt limit must be positive.";
  if (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt)) return "Exam end time must be after its start time.";
  await requireAcademicReferences(institutionId, { courseId, subjectId, chapterId, topicId, batchId });

  const exam = await prisma.exam.create({
    data: {
      institutionId,
      createdById: user.id,
      courseId,
      subjectId,
      chapterId,
      topicId,
      batchId,
      name,
      description: optionalText(formData.get("description")),
      instructions: optionalText(formData.get("instructions")),
      durationSeconds,
      totalMarks: optionalText(formData.get("totalMarks")) ?? "0",
      negativeMarks: optionalText(formData.get("negativeMarks")) ?? "0",
      attemptsAllowed,
      passingMarks: optionalText(formData.get("passingMarks")) ?? "0",
      type: (optionalText(formData.get("type")) ?? "PRACTICE") as never,
      status: (optionalText(formData.get("status")) ?? "DRAFT") as never,
      selectionMode: (optionalText(formData.get("selectionMode")) ?? "MANUAL") as never,
      startsAt: startsAt ? new Date(startsAt) : undefined,
      endsAt: endsAt ? new Date(endsAt) : undefined,
      publishedAt: formData.get("status") === "PUBLISHED" ? new Date() : undefined
    }
  });

  revalidatePath("/exams");
  return `Exam created: ${exam.name}`;
}

export async function addQuestionToExamAction(_: string | undefined, formData: FormData) {
  const { institutionId } = await getExamManager();
  const examId = optionalText(formData.get("examId"));
  const questionId = optionalText(formData.get("questionId"));
  if (!examId || !questionId) return "Exam and question are required.";
  await requireAcademicReferences(institutionId, { examId, questionId });

  await prisma.examQuestion.upsert({
    where: { examId_questionId: { examId, questionId } },
    update: {},
    create: {
      examId,
      questionId,
      order: Number(optionalText(formData.get("order")) ?? "1"),
      marks: optionalText(formData.get("marks")) ?? "1",
      negativeMarks: optionalText(formData.get("negativeMarks")) ?? "0"
    }
  });
  revalidatePath("/exams");
  return "Question added to exam.";
}

export async function startExamAttemptAction(_: string | undefined, formData: FormData) {
  try {
    const user = await requireCurrentUser("exams.attempt");
    const examId = optionalText(formData.get("examId"));
    if (!examId) return "ERROR: Exam is required.";
    const attempt = await startStudentExamAttempt({ examId, studentId: user.id });
    revalidatePath(`/exams/${examId}/take`);
    return attempt.id;
  } catch (error) {
    return `ERROR: ${error instanceof Error ? error.message : "Exam could not be started."}`;
  }
}

export async function saveExamAnswerAction(_: string | undefined, formData: FormData) {
  try {
    const user = await requireCurrentUser("exams.attempt");
    const attemptId = optionalText(formData.get("attemptId"));
    const questionId = optionalText(formData.get("questionId"));
    if (!attemptId || !questionId) return "Attempt and question are required.";
    const status = z.enum(["NOT_VISITED", "ANSWERED", "SKIPPED", "MARKED_REVIEW"]).parse(optionalText(formData.get("status")) ?? "ANSWERED");
    await saveStudentExamAnswer({ studentId: user.id, attemptId, questionId, answer: optionalText(formData.get("answer")), status });
    return "Saved.";
  } catch (error) {
    return error instanceof Error ? error.message : "Answer could not be saved.";
  }
}

export async function submitExamAttemptAction(_: string | undefined, formData: FormData) {
  try {
    const user = await requireCurrentUser("exams.attempt");
    const attemptId = optionalText(formData.get("attemptId"));
    if (!attemptId) return "Attempt is required.";
    if (!user.institutionId) throw new Error("Institution is required.");
    const result = await submitStudentExamAttempt({ studentId: user.id, attemptId });
    await rebuildLeaderboard(result.examId, user.institutionId);
    revalidatePath(`/exams/${result.examId}/result`);
    return result.idempotent ? "Exam was already submitted." : "Exam submitted.";
  } catch (error) {
    return error instanceof Error ? error.message : "Exam could not be submitted.";
  }
}
