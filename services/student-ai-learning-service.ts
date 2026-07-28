import { prisma } from "@/lib/db";
import { getStudentHome } from "@/services/learning-service";
import { getUserPreferences } from "@/services/preference-service";

// Future ClassTutor: student learning orchestration remains on the shared
// backend and should not be duplicated when the student frontend is split out.
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

export type StudentAIPreferences = { learningStyle: string; explanationStyle: string; difficulty: string; memoryEnabled: boolean; subjects: string[] };
const defaultAIPreferences: StudentAIPreferences = { learningStyle: "Examples first", explanationStyle: "Step by step", difficulty: "Adaptive", memoryEnabled: true, subjects: [] };
function objectValue(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
export async function getStudentAIWorkspace(userId?: string) {
  if (!userId) return { conversations: [], favorites: [], preferences: defaultAIPreferences, recommendations: [], flashcardDecks: [] };
  const [conversations, favorites, preference, flashcardPreference, home] = await Promise.all([
    prisma.aIConversation.findMany({ where: { userId, scope: "STUDENT" }, orderBy: { updatedAt: "desc" }, take: 40 }),
    prisma.favoriteItem.findMany({ where: { userId, type: { startsWith: "student-ai" } }, orderBy: { createdAt: "desc" }, take: 40 }),
    prisma.userPreference.findUnique({ where: { userId_key: { userId, key: "learnx.ai.personalization" } } }),
    prisma.userPreference.findUnique({ where: { userId_key: { userId, key: "learnx.ai.flashcards" } } }), getStudentHome(userId)
  ]);
  const raw = objectValue(preference?.value);
  const preferences: StudentAIPreferences = { learningStyle: typeof raw.learningStyle === "string" ? raw.learningStyle : defaultAIPreferences.learningStyle, explanationStyle: typeof raw.explanationStyle === "string" ? raw.explanationStyle : defaultAIPreferences.explanationStyle, difficulty: typeof raw.difficulty === "string" ? raw.difficulty : defaultAIPreferences.difficulty, memoryEnabled: typeof raw.memoryEnabled === "boolean" ? raw.memoryEnabled : true, subjects: Array.isArray(raw.subjects) ? raw.subjects.filter((x): x is string => typeof x === "string").slice(0, 12) : [] };
  const recommendations = [...home.pendingAssignments.slice(0, 3).map((x) => ({ title: x.title, reason: "Upcoming assignment", mode: "homework" })), ...home.progress.filter((x) => x.completion < 60).slice(0, 3).map((x) => ({ title: `Strengthen a ${x.completion}% mastery topic`, reason: "Your progress shows room to improve", mode: "revision" }))];
  return { conversations, favorites, preferences, recommendations, flashcardDecks: Array.isArray(flashcardPreference?.value) ? flashcardPreference.value : [] };
}
