import { prisma } from "@/lib/db";

export async function createContentUpload(input: {
  institutionId: string;
  createdById?: string;
  courseId: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  classroomId?: string;
  batchId?: string;
  materialId?: string;
  recordingId?: string;
  title: string;
  description?: string;
  type: "VIDEO" | "PDF" | "PPT" | "IMAGE" | "AUDIO" | "ZIP" | "EXTERNAL_LINK" | "DOCUMENT" | "NOTES" | "WORKSHEET" | "QUESTION_PAPER" | "ANSWER_KEY" | "REFERENCE";
  fileUrl?: string;
  externalUrl?: string;
  sizeBytes?: number;
  durationSeconds?: number;
  status?: "DRAFT" | "SUBMITTED" | "PUBLISHED";
}) {
  const status = input.status ?? "DRAFT";

  return prisma.contentItem.create({
    data: {
      institutionId: input.institutionId,
      createdById: input.createdById,
      courseId: input.courseId,
      subjectId: input.subjectId,
      chapterId: input.chapterId,
      topicId: input.topicId,
      classroomId: input.classroomId,
      batchId: input.batchId,
      materialId: input.materialId,
      recordingId: input.recordingId,
      title: input.title,
      description: input.description,
      type: input.type,
      fileUrl: input.fileUrl,
      externalUrl: input.externalUrl,
      sizeBytes: input.sizeBytes ?? 0,
      durationSeconds: input.durationSeconds ?? 0,
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : undefined,
      visibility: status === "PUBLISHED" ? "ENROLLED_STUDENTS" : "TEACHERS",
      aiReadyNotes: {
        summary: "AI summary can be generated later.",
        quiz: "AI quiz generation can attach here.",
        transcript: "AI transcript can attach here."
      },
      versions: {
        create: {
          version: 1,
          title: input.title,
          fileUrl: input.fileUrl,
          externalUrl: input.externalUrl,
          sizeBytes: input.sizeBytes ?? 0,
          updatedById: input.createdById,
          changeNote: "Initial upload"
        }
      },
      analytics: { create: {} },
      externalContent: input.externalUrl ? { create: { url: input.externalUrl, provider: "External" } } : undefined,
      transcript: input.type === "VIDEO" || input.type === "AUDIO" ? { create: { status: "AI_READY" } } : undefined
    },
    include: { versions: true, analytics: true, externalContent: true, transcript: true }
  });
}
