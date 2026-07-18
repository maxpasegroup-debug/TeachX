import type { AIConversationScope } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getUserPreferences } from "@/services/preference-service";

export type AIStudioTool = {
  slug: string;
  title: string;
  category: string;
  description: string;
};

export const aiStudioTools: AIStudioTool[] = [
  { slug: "lesson-plan", title: "Lesson Plan", category: "Planning", description: "Structure a complete class with objectives, activities, checks, and homework." },
  { slug: "worksheet", title: "Worksheet", category: "Practice", description: "Create printable practice with clear instructions and answer space." },
  { slug: "question-paper", title: "Question Paper", category: "Assessment", description: "Build exam-ready sections, marks, difficulty, and blueprint alignment." },
  { slug: "question-bank", title: "Question Bank", category: "Assessment", description: "Generate a reusable bank across difficulty levels and skills." },
  { slug: "answer-key", title: "Answer Key", category: "Assessment", description: "Prepare answers, marking guidance, and common mistakes." },
  { slug: "homework", title: "Homework", category: "Practice", description: "Create homework that is focused, achievable, and easy to review." },
  { slug: "class-activity", title: "Class Activity", category: "Classroom", description: "Design engaging solo, pair, or group classroom activity flows." },
  { slug: "lesson-summary", title: "Lesson Summary", category: "Notes", description: "Summarize concepts into clean student-friendly revision notes." },
  { slug: "teaching-notes", title: "Teaching Notes", category: "Notes", description: "Prepare teacher-facing notes with examples, prompts, and misconceptions." },
  { slug: "rubrics", title: "Rubrics", category: "Assessment", description: "Create scoring rubrics with levels, criteria, and evidence." },
  { slug: "learning-outcomes", title: "Learning Outcomes", category: "Planning", description: "Write measurable outcomes by class, subject, and topic." },
  { slug: "project-ideas", title: "Project Ideas", category: "Creative", description: "Generate practical projects with materials, steps, and evaluation." },
  { slug: "speech", title: "Speech", category: "Communication", description: "Draft speeches for classroom, events, and school moments." },
  { slug: "assembly-speech", title: "Assembly Speech", category: "Communication", description: "Create assembly-ready speeches with tone and timing." },
  { slug: "circular", title: "Circular", category: "Communication", description: "Draft clear circulars for students, parents, or staff." },
  { slug: "notice", title: "Notice", category: "Communication", description: "Prepare formal notices with date, audience, and action." },
  { slug: "pta-invitation", title: "PTA Invitation", category: "Communication", description: "Create warm and professional parent invitation text." },
  { slug: "certificate-text", title: "Certificate Text", category: "Communication", description: "Write polished certificate copy for achievements and events." },
  { slug: "student-remarks", title: "Student Remarks", category: "Reports", description: "Draft constructive remarks for student progress." },
  { slug: "report-card-remarks", title: "Report Card Remarks", category: "Reports", description: "Create report-card-ready comments with strengths and next steps." },
  { slug: "exam-blueprint", title: "Exam Blueprint", category: "Assessment", description: "Plan marks, sections, chapters, and difficulty distribution." },
  { slug: "quiz-generator", title: "Quiz Generator", category: "Practice", description: "Create quick quizzes for recall, revision, or exit tickets." },
  { slug: "flash-cards", title: "Flash Cards", category: "Practice", description: "Generate compact question-answer cards for active recall." },
  { slug: "ppt-outline", title: "PPT Outline", category: "Presentation", description: "Create slide-by-slide outlines for classroom presentation." },
  { slug: "mind-map", title: "Mind Map", category: "Creative", description: "Generate a structured text mind map for concepts and links." },
  { slug: "revision-sheet", title: "Revision Sheet", category: "Notes", description: "Prepare concise revision sheets before exams." },
  { slug: "assignment", title: "Assignment", category: "Practice", description: "Create assignment tasks with submission instructions and criteria." },
  { slug: "study-notes", title: "Study Notes", category: "Notes", description: "Create student-friendly notes with examples and key takeaways." }
];

export function getAIStudioTool(slug: string) {
  return aiStudioTools.find((tool) => tool.slug === slug) ?? aiStudioTools[0];
}

export async function getAIStudioHome(userId?: string, institutionId?: string | null) {
  const [preferences, conversations, usage, templates] = await Promise.all([
    getUserPreferences(userId),
    prisma.aIConversation.findMany({
      where: { userId, scope: "TEACHER" },
      orderBy: { updatedAt: "desc" },
      take: 8
    }),
    prisma.aIUsage.aggregate({
      where: { userId, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      _sum: { totalTokens: true, promptTokens: true, completionTokens: true },
      _count: true
    }),
    prisma.promptTemplate.findMany({
      where: { scope: "TEACHER", isActive: true, OR: [{ institutionId: institutionId ?? undefined }, { institutionId: null }] },
      orderBy: { createdAt: "desc" },
      take: 8
    })
  ]);

  const totalTokens = usage._sum.totalTokens ?? 0;
  return {
    preferences,
    conversations,
    templates,
    credits: {
      current: 1000,
      todayUsage: totalTokens,
      monthlyUsage: totalTokens,
      estimatedRemaining: Math.max(0, 1000 - Math.ceil(totalTokens / 100))
    },
    usage: {
      promptTokens: usage._sum.promptTokens ?? 0,
      completionTokens: usage._sum.completionTokens ?? 0,
      totalTokens,
      generationCount: usage._count,
      estimatedCost: Number(((totalTokens / 1000) * 0.002).toFixed(4))
    }
  };
}

export async function getAIHistory(userId?: string) {
  if (!userId) return [];
  return prisma.aIConversation.findMany({
    where: { userId, scope: "TEACHER" as AIConversationScope },
    include: { usages: true },
    orderBy: { updatedAt: "desc" },
    take: 50
  });
}

export async function getPromptLibrary(institutionId?: string | null) {
  return prisma.promptTemplate.findMany({
    where: { scope: "TEACHER", isActive: true, OR: [{ institutionId: institutionId ?? undefined }, { institutionId: null }] },
    orderBy: [{ institutionId: "desc" }, { updatedAt: "desc" }],
    take: 50
  });
}
