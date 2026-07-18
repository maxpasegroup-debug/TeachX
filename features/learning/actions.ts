"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

function optionalText(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  return text || undefined;
}

async function getStudentSession(classroomId: string) {
  const session = await auth();
  const institutionId = session?.user.institutionId;
  if (!session?.user || !institutionId) throw new Error("Institution is required.");

  const classroom = await prisma.classroom.findFirst({
    where: {
      id: classroomId,
      institutionId,
      batch: {
        students: {
          some: { studentId: session.user.id }
        }
      }
    }
  });

  if (!classroom) throw new Error("Classroom was not found.");
  return { session, classroom };
}

const submissionSchema = z.object({
  classroomId: z.string().min(1),
  assignmentId: z.string().min(1),
  attachmentUrl: z.string().url().optional(),
  remarks: z.string().optional()
});

export async function submitAssignmentAction(_: string | undefined, formData: FormData) {
  const parsed = submissionSchema.safeParse({
    classroomId: optionalText(formData.get("classroomId")),
    assignmentId: optionalText(formData.get("assignmentId")),
    attachmentUrl: optionalText(formData.get("attachmentUrl")),
    remarks: optionalText(formData.get("remarks"))
  });
  if (!parsed.success) return "Please add a valid submission.";

  const { session, classroom } = await getStudentSession(parsed.data.classroomId);
  const assignment = await prisma.assignment.findFirst({
    where: { id: parsed.data.assignmentId, classroomId: classroom.id }
  });
  if (!assignment) return "Assignment was not found.";

  const isLate = assignment.dueDate ? new Date() > assignment.dueDate : false;
  await prisma.assignmentSubmission.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId: assignment.id,
        studentId: session.user.id
      }
    },
    update: {
      attachmentUrl: parsed.data.attachmentUrl,
      remarks: parsed.data.remarks,
      status: isLate ? "LATE" : "SUBMITTED",
      submittedAt: new Date()
    },
    create: {
      assignmentId: assignment.id,
      studentId: session.user.id,
      attachmentUrl: parsed.data.attachmentUrl,
      remarks: parsed.data.remarks,
      status: isLate ? "LATE" : "SUBMITTED",
      submittedAt: new Date()
    }
  });

  revalidatePath(`/learning/${classroom.id}`);
  revalidatePath("/dashboard");
  return "Assignment submitted.";
}

const videoSchema = z.object({
  classroomId: z.string().min(1),
  recordingId: z.string().min(1),
  lastPosition: z.coerce.number().int().min(0).default(0),
  duration: z.coerce.number().int().min(0).default(0),
  playbackSpeed: z.coerce.number().positive().default(1),
  completed: z.coerce.boolean().optional()
});

export async function saveVideoProgressAction(_: string | undefined, formData: FormData) {
  const parsed = videoSchema.safeParse({
    classroomId: optionalText(formData.get("classroomId")),
    recordingId: optionalText(formData.get("recordingId")),
    lastPosition: formData.get("lastPosition") ?? "0",
    duration: formData.get("duration") ?? "0",
    playbackSpeed: formData.get("playbackSpeed") ?? "1",
    completed: formData.get("completed") === "on"
  });
  if (!parsed.success) return "Could not save video progress.";

  const { session, classroom } = await getStudentSession(parsed.data.classroomId);
  await prisma.videoProgress.upsert({
    where: { studentId_recordingId: { studentId: session.user.id, recordingId: parsed.data.recordingId } },
    update: {
      lastPosition: parsed.data.lastPosition,
      duration: parsed.data.duration,
      playbackSpeed: parsed.data.playbackSpeed,
      completed: Boolean(parsed.data.completed),
      completedAt: parsed.data.completed ? new Date() : null
    },
    create: {
      studentId: session.user.id,
      classroomId: classroom.id,
      recordingId: parsed.data.recordingId,
      lastPosition: parsed.data.lastPosition,
      duration: parsed.data.duration,
      playbackSpeed: parsed.data.playbackSpeed,
      completed: Boolean(parsed.data.completed),
      completedAt: parsed.data.completed ? new Date() : null
    }
  });

  revalidatePath(`/learning/${classroom.id}`);
  return "Progress saved.";
}

const bookmarkSchema = z.object({
  classroomId: z.string().min(1),
  targetType: z.enum(["RECORDING", "MATERIAL", "ASSIGNMENT", "ANNOUNCEMENT"]),
  targetId: z.string().min(1),
  label: z.string().optional()
});

export async function saveBookmarkAction(_: string | undefined, formData: FormData) {
  const parsed = bookmarkSchema.safeParse({
    classroomId: optionalText(formData.get("classroomId")),
    targetType: optionalText(formData.get("targetType")),
    targetId: optionalText(formData.get("targetId")),
    label: optionalText(formData.get("label"))
  });
  if (!parsed.success) return "Could not save bookmark.";

  const { session, classroom } = await getStudentSession(parsed.data.classroomId);
  const { classroomId: _classroomId, ...bookmarkData } = parsed.data;
  await prisma.bookmark.upsert({
    where: { studentId_targetType_targetId: { studentId: session.user.id, targetType: parsed.data.targetType, targetId: parsed.data.targetId } },
    update: { label: parsed.data.label },
    create: { studentId: session.user.id, classroomId: classroom.id, ...bookmarkData }
  });

  revalidatePath(`/learning/${classroom.id}`);
  return "Bookmarked.";
}

const noteSchema = z.object({
  classroomId: z.string().min(1),
  targetType: z.enum(["RECORDING", "MATERIAL", "ASSIGNMENT", "LESSON"]),
  targetId: z.string().optional(),
  title: z.string().min(2),
  body: z.string().min(2)
});

export async function saveStudentNoteAction(_: string | undefined, formData: FormData) {
  const parsed = noteSchema.safeParse({
    classroomId: optionalText(formData.get("classroomId")),
    targetType: optionalText(formData.get("targetType")) ?? "LESSON",
    targetId: optionalText(formData.get("targetId")),
    title: optionalText(formData.get("title")),
    body: optionalText(formData.get("body"))
  });
  if (!parsed.success) return "Please write a note.";

  const { session, classroom } = await getStudentSession(parsed.data.classroomId);
  await prisma.studentNote.create({
    data: {
      studentId: session.user.id,
      classroomId: classroom.id,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      title: parsed.data.title,
      body: parsed.data.body,
      aiSummary: "AI explanation can be generated here when OpenAI is connected."
    }
  });

  revalidatePath(`/learning/${classroom.id}`);
  return "Note saved.";
}
