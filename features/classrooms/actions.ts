"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { userHasPermission } from "@/lib/rbac";
import { canManageAllClassrooms } from "@/services/classroom-service";
import { recordActivity } from "@/services/activity-service";
import { createModuleNotification } from "@/services/notification-aggregation-service";
import { createContentUpload } from "@/services/upload-service";

function optionalText(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  return text || undefined;
}

async function getClassroomAccess(classroomId: string) {
  const session = await auth();
  const institutionId = session?.user.institutionId;
  if (!session?.user || !institutionId) throw new Error("Institution is required.");
  if (!userHasPermission(session.user.roles, "classrooms.own.manage") && !userHasPermission(session.user.roles, "classrooms.manage")) {
    throw new Error("You do not have classroom access.");
  }

  const classroom = await prisma.classroom.findFirst({
    where: {
      id: classroomId,
      institutionId,
      ...(canManageAllClassrooms(session.user.roles)
        ? {}
        : {
            batch: {
              faculty: { some: { facultyId: session.user.id } }
            }
          })
    },
    include: { batch: { include: { students: true } } }
  });

  if (!classroom) throw new Error("Classroom was not found.");
  return { session, institutionId, classroom };
}

const announcementSchema = z.object({
  classroomId: z.string().min(1),
  title: z.string().min(2),
  message: z.string().min(2)
});

export async function createAnnouncementAction(_: string | undefined, formData: FormData) {
  const parsed = announcementSchema.safeParse({
    classroomId: optionalText(formData.get("classroomId")),
    title: optionalText(formData.get("title")),
    message: optionalText(formData.get("message"))
  });
  if (!parsed.success) return "Please enter an announcement.";

  const { session, institutionId, classroom } = await getClassroomAccess(parsed.data.classroomId);
  const announcement = await prisma.classroomAnnouncement.create({
    data: {
      classroomId: classroom.id,
      authorId: session.user.id,
      title: parsed.data.title,
      message: parsed.data.message,
      publishStatus: "PUBLISHED"
    }
  });

  await prisma.notification.create({
    data: {
      institutionId,
      title: parsed.data.title,
      body: parsed.data.message,
      metadata: { classroomId: classroom.id, announcementId: announcement.id }
    }
  });

  await writeAuditLog({ institutionId, actorId: session.user.id, action: "CREATE", entity: "ClassroomAnnouncement", entityId: announcement.id, message: `Posted announcement in ${classroom.title}` });
  revalidatePath(`/classrooms/${classroom.id}`);
  revalidatePath("/dashboard");
  return "Announcement posted.";
}

const materialSchema = z.object({
  classroomId: z.string().min(1),
  subjectId: z.string().optional(),
  title: z.string().min(2),
  type: z.enum(["PDF", "PPT", "IMAGE", "NOTES"]),
  chapter: z.string().optional(),
  topic: z.string().optional(),
  fileUrl: z.string().url().optional(),
  notes: z.string().optional(),
  publishStatus: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
});

export async function createMaterialAction(_: string | undefined, formData: FormData) {
  const parsed = materialSchema.safeParse({
    classroomId: optionalText(formData.get("classroomId")),
    subjectId: optionalText(formData.get("subjectId")),
    title: optionalText(formData.get("title")),
    type: optionalText(formData.get("type")) ?? "NOTES",
    chapter: optionalText(formData.get("chapter")),
    topic: optionalText(formData.get("topic")),
    fileUrl: optionalText(formData.get("fileUrl")),
    notes: optionalText(formData.get("notes")),
    publishStatus: optionalText(formData.get("publishStatus")) ?? "DRAFT"
  });
  if (!parsed.success) return "Please enter material details.";

  const { session, institutionId, classroom } = await getClassroomAccess(parsed.data.classroomId);
  const material = await prisma.studyMaterial.create({
    data: {
      ...parsed.data,
      uploadedById: session.user.id,
      aiSummary: parsed.data.notes ? "AI summary can be generated here when OpenAI is connected." : undefined
    }
  });

  await writeAuditLog({ institutionId, actorId: session.user.id, action: "CREATE", entity: "StudyMaterial", entityId: material.id, message: `Uploaded material in ${classroom.title}` });
  await createContentUpload({
    institutionId,
    createdById: session.user.id,
    courseId: classroom.courseId,
    classroomId: classroom.id,
    batchId: classroom.batchId,
    subjectId: parsed.data.subjectId,
    materialId: material.id,
    title: parsed.data.title,
    description: parsed.data.notes,
    type: parsed.data.type,
    fileUrl: parsed.data.fileUrl,
    status: parsed.data.publishStatus === "PUBLISHED" ? "PUBLISHED" : "DRAFT"
  });
  await recordActivity({ institutionId, actorId: session.user.id, type: "CONTENT", title: `Material uploaded: ${material.title}`, entity: "StudyMaterial", entityId: material.id, link: `/classrooms/${classroom.id}` });
  await createModuleNotification({ institutionId, type: "CONTENT", title: "New study material", body: material.title, link: `/classrooms/${classroom.id}` });
  revalidatePath(`/classrooms/${classroom.id}`);
  revalidatePath("/dashboard");
  return "Material saved.";
}

const assignmentSchema = z.object({
  classroomId: z.string().min(1),
  subjectId: z.string().optional(),
  title: z.string().min(2),
  instructions: z.string().min(2),
  dueDate: z.coerce.date().optional(),
  attachmentUrl: z.string().url().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]),
  aiPrompt: z.string().optional()
});

export async function createAssignmentAction(_: string | undefined, formData: FormData) {
  const parsed = assignmentSchema.safeParse({
    classroomId: optionalText(formData.get("classroomId")),
    subjectId: optionalText(formData.get("subjectId")),
    title: optionalText(formData.get("title")),
    instructions: optionalText(formData.get("instructions")),
    dueDate: optionalText(formData.get("dueDate")),
    attachmentUrl: optionalText(formData.get("attachmentUrl")),
    status: optionalText(formData.get("status")) ?? "DRAFT",
    aiPrompt: optionalText(formData.get("aiPrompt"))
  });
  if (!parsed.success) return "Please enter assignment details.";

  const { session, institutionId, classroom } = await getClassroomAccess(parsed.data.classroomId);
  const assignment = await prisma.assignment.create({
    data: {
      ...parsed.data,
      createdById: session.user.id
    }
  });

  if (parsed.data.status === "PUBLISHED") {
    await Promise.all(
      classroom.batch.students.map((item) =>
        prisma.assignmentSubmission.upsert({
          where: { assignmentId_studentId: { assignmentId: assignment.id, studentId: item.studentId } },
          update: {},
          create: { assignmentId: assignment.id, studentId: item.studentId }
        })
      )
    );
  }

  await writeAuditLog({ institutionId, actorId: session.user.id, action: "CREATE", entity: "Assignment", entityId: assignment.id, message: `Created assignment in ${classroom.title}` });
  await recordActivity({ institutionId, actorId: session.user.id, type: "ASSIGNMENT", title: `Assignment created: ${assignment.title}`, entity: "Assignment", entityId: assignment.id, link: `/classrooms/${classroom.id}` });
  await createModuleNotification({ institutionId, type: "ASSIGNMENT", title: "New assignment", body: assignment.title, link: `/classrooms/${classroom.id}` });
  revalidatePath(`/classrooms/${classroom.id}`);
  revalidatePath("/dashboard");
  return "Assignment saved.";
}

const recordingSchema = z.object({
  classroomId: z.string().min(1),
  title: z.string().min(2),
  videoUrl: z.string().url().optional(),
  editorNotes: z.string().optional()
});

export async function createRecordingAction(_: string | undefined, formData: FormData) {
  const parsed = recordingSchema.safeParse({
    classroomId: optionalText(formData.get("classroomId")),
    title: optionalText(formData.get("title")),
    videoUrl: optionalText(formData.get("videoUrl")),
    editorNotes: optionalText(formData.get("editorNotes"))
  });
  if (!parsed.success) return "Please enter recording details.";

  const { session, institutionId, classroom } = await getClassroomAccess(parsed.data.classroomId);
  const recording = await prisma.recording.create({
    data: { ...parsed.data, uploadedById: session.user.id, status: parsed.data.editorNotes ? "SENT_TO_EDITOR" : "UPLOADED" }
  });

  await writeAuditLog({ institutionId, actorId: session.user.id, action: "CREATE", entity: "Recording", entityId: recording.id, message: `Uploaded recording in ${classroom.title}` });
  await createContentUpload({
    institutionId,
    createdById: session.user.id,
    courseId: classroom.courseId,
    classroomId: classroom.id,
    batchId: classroom.batchId,
    recordingId: recording.id,
    title: parsed.data.title,
    description: parsed.data.editorNotes,
    type: "VIDEO",
    fileUrl: parsed.data.videoUrl,
    status: parsed.data.editorNotes ? "SUBMITTED" : "DRAFT"
  });
  await recordActivity({ institutionId, actorId: session.user.id, type: "CONTENT", title: `Recording uploaded: ${recording.title}`, entity: "Recording", entityId: recording.id, link: `/classrooms/${classroom.id}` });
  await createModuleNotification({ institutionId, type: "CONTENT", title: "Recording ready for review", body: recording.title, link: "/content-studio" });
  revalidatePath(`/classrooms/${classroom.id}`);
  revalidatePath("/dashboard");
  return "Recording saved.";
}

const liveSessionSchema = z.object({
  classroomId: z.string().min(1),
  title: z.string().min(2),
  scheduledAt: z.coerce.date().optional()
});

export async function createLiveSessionAction(_: string | undefined, formData: FormData) {
  const parsed = liveSessionSchema.safeParse({
    classroomId: optionalText(formData.get("classroomId")),
    title: optionalText(formData.get("title")),
    scheduledAt: optionalText(formData.get("scheduledAt"))
  });
  if (!parsed.success) return "Please enter live class details.";

  const { session, institutionId, classroom } = await getClassroomAccess(parsed.data.classroomId);
  const liveSession = await prisma.liveSession.create({
    data: { ...parsed.data, facultyId: session.user.id, status: "SCHEDULED" }
  });

  await writeAuditLog({ institutionId, actorId: session.user.id, action: "CREATE", entity: "LiveSession", entityId: liveSession.id, message: `Scheduled live class in ${classroom.title}` });
  revalidatePath(`/classrooms/${classroom.id}`);
  revalidatePath("/dashboard");
  return "Live class scheduled.";
}

export async function saveAttendanceAction(_: string | undefined, formData: FormData) {
  const classroomId = optionalText(formData.get("classroomId"));
  if (!classroomId) return "Classroom is required.";

  const { session, institutionId, classroom } = await getClassroomAccess(classroomId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayName = today.toLocaleDateString("en", { weekday: "long" }).toUpperCase();
  const timetableEntry = await prisma.timetableEntry.findFirst({
    where: { batchId: classroom.batchId, day: dayName as never },
    orderBy: { createdAt: "asc" }
  });

  const attendanceSession = await prisma.attendanceSession.upsert({
    where: { classroomId_date: { classroomId, date: today } },
    update: { savedAt: new Date(), remarks: optionalText(formData.get("remarks")) },
    create: {
      classroomId,
      batchId: classroom.batchId,
      timetableEntryId: timetableEntry?.id,
      date: today,
      savedAt: new Date(),
      remarks: optionalText(formData.get("remarks"))
    }
  });

  await Promise.all(
    classroom.batch.students.map((item) => {
      const status = formData.get(`student-${item.studentId}`)?.toString() ?? "PRESENT";
      return prisma.attendanceRecord.upsert({
        where: { sessionId_studentId: { sessionId: attendanceSession.id, studentId: item.studentId } },
        update: { status: status as never },
        create: { sessionId: attendanceSession.id, studentId: item.studentId, status: status as never }
      });
    })
  );

  await writeAuditLog({ institutionId, actorId: session.user.id, action: "CREATE", entity: "AttendanceSession", entityId: attendanceSession.id, message: `Saved attendance in ${classroom.title}` });
  revalidatePath(`/classrooms/${classroom.id}`);
  revalidatePath("/dashboard");
  return "Attendance saved.";
}
