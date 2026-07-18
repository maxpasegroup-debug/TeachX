import { prisma } from "@/lib/db";
import { getStudentHome } from "@/services/learning-service";
import { getUserPreferences } from "@/services/preference-service";

export const studentLearningModes = [
  "Explain",
  "Summarize",
  "Teach",
  "Quiz Me",
  "Challenge Me",
  "Flash Cards",
  "Mind Map",
  "Examples",
  "Step by Step",
  "Exam Mode",
  "Revision Mode"
] as const;

export const studentPracticeTypes = ["MCQ", "Fill in blanks", "True False", "Descriptive", "One Word", "Match"] as const;

export async function getStudentAIHome(input: { userId?: string; institutionId?: string | null }) {
  const [home, preferences, conversations, usage, notes, bookmarks, downloads, attempts] = await Promise.all([
    getStudentHome(input.userId, input.institutionId),
    getUserPreferences(input.userId),
    input.userId
      ? prisma.aIConversation.findMany({ where: { userId: input.userId, scope: "STUDENT" }, orderBy: { updatedAt: "desc" }, take: 6 })
      : [],
    input.userId
      ? prisma.aIUsage.aggregate({
          where: { userId: input.userId, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
          _sum: { totalTokens: true },
          _count: true
        })
      : { _sum: { totalTokens: 0 }, _count: 0 },
    input.userId ? prisma.studentNote.findMany({ where: { studentId: input.userId }, orderBy: { updatedAt: "desc" }, take: 8 }) : [],
    input.userId ? prisma.bookmark.findMany({ where: { studentId: input.userId }, orderBy: { createdAt: "desc" }, take: 8 }) : [],
    input.userId ? prisma.downloadHistory.findMany({ where: { userId: input.userId }, include: { item: true }, orderBy: { downloadedAt: "desc" }, take: 8 }) : [],
    input.userId ? prisma.examAttempt.findMany({ where: { studentId: input.userId }, include: { result: true, exam: true }, orderBy: { updatedAt: "desc" }, take: 8 }) : []
  ]);

  const progressAverage = home.progress.length ? Math.round(home.progress.reduce((total, item) => total + item.completion, 0) / home.progress.length) : 0;
  const studyStreak = home.progress.reduce((max, item) => Math.max(max, item.studyStreak), 0);
  const masteredTopics = home.progress.filter((item) => item.completion >= 80).length;
  const weakAreas = home.progress.filter((item) => item.completion < 50).length;
  const recentScores = attempts.map((attempt) => Number(attempt.result?.percentage ?? 0)).filter(Boolean);
  const learningTime = home.classrooms.flatMap((classroom) => classroom.videoProgress).reduce((total, progress) => total + progress.duration, 0);

  return {
    home,
    preferences,
    conversations,
    notes,
    bookmarks,
    downloads,
    attempts,
    aiUsage: {
      todayTokens: usage._sum.totalTokens ?? 0,
      generationCount: usage._count
    },
    progress: {
      progressAverage,
      studyStreak,
      masteredTopics,
      weakAreas,
      recentScores,
      learningTime,
      achievements: home.progress.flatMap((item) => Array.isArray(item.achievements) ? item.achievements : [])
    }
  };
}
