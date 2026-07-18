"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { userHasPermission } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";

function optionalText(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  return text || undefined;
}

async function getPlannerSession() {
  const session = await auth();
  const institutionId = session?.user.institutionId;
  if (!session?.user || !institutionId) throw new Error("Institution is required.");
  if (!userHasPermission(session.user.roles, "planner.manage")) throw new Error("You do not have access to manage the planner.");
  return { session, institutionId };
}

const timetableSchema = z.object({
  courseId: z.string().min(1),
  batchId: z.string().min(1),
  academicYearId: z.string().optional(),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
  timeSlotId: z.string().min(1),
  facultyId: z.string().optional(),
  subjectId: z.string().optional(),
  roomId: z.string().optional(),
  remarks: z.string().optional()
});

export async function createTimetableEntryAction(_: string | undefined, formData: FormData) {
  const { session, institutionId } = await getPlannerSession();
  const parsed = timetableSchema.safeParse({
    courseId: optionalText(formData.get("courseId")),
    batchId: optionalText(formData.get("batchId")),
    academicYearId: optionalText(formData.get("academicYearId")),
    day: optionalText(formData.get("day")),
    timeSlotId: optionalText(formData.get("timeSlotId")),
    facultyId: optionalText(formData.get("facultyId")),
    subjectId: optionalText(formData.get("subjectId")),
    roomId: optionalText(formData.get("roomId")),
    remarks: optionalText(formData.get("remarks"))
  });

  if (!parsed.success) return "Please enter a valid timetable item.";

  const course = await prisma.course.findFirst({
    where: {
      id: parsed.data.courseId,
      institutionId
    }
  });

  if (!course) return "Course was not found.";

  const entry = await prisma.timetableEntry.create({
    data: parsed.data
  });

  await writeAuditLog({
    institutionId,
    actorId: session.user.id,
    action: "CREATE",
    entity: "TimetableEntry",
    entityId: entry.id,
    message: "Created timetable item"
  });

  revalidatePath("/classes");
  revalidatePath("/dashboard");
  return "Timetable item added.";
}

const overrideSchema = z.object({
  timetableEntryId: z.string().optional(),
  date: z.coerce.date(),
  type: z.enum(["FACULTY_REPLACEMENT", "SUBJECT_REPLACEMENT", "ROOM_CHANGE", "TIME_CHANGE", "CANCEL_CLASS", "EXTRA_CLASS", "SPECIAL_CLASS", "HOLIDAY"]),
  facultyId: z.string().optional(),
  subjectId: z.string().optional(),
  roomId: z.string().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  remarks: z.string().optional()
});

export async function createDailyOverrideAction(_: string | undefined, formData: FormData) {
  const { session, institutionId } = await getPlannerSession();
  const parsed = overrideSchema.safeParse({
    timetableEntryId: optionalText(formData.get("timetableEntryId")),
    date: formData.get("date"),
    type: optionalText(formData.get("type")) ?? "SPECIAL_CLASS",
    facultyId: optionalText(formData.get("facultyId")),
    subjectId: optionalText(formData.get("subjectId")),
    roomId: optionalText(formData.get("roomId")),
    startsAt: optionalText(formData.get("startsAt")),
    endsAt: optionalText(formData.get("endsAt")),
    remarks: optionalText(formData.get("remarks"))
  });

  if (!parsed.success) return "Please enter a valid daily change.";

  const override = await prisma.dailyScheduleOverride.create({
    data: {
      ...parsed.data,
      createdById: session.user.id
    }
  });

  await writeAuditLog({
    institutionId,
    actorId: session.user.id,
    action: "UPDATE",
    entity: "DailyScheduleOverride",
    entityId: override.id,
    message: `Created daily schedule override: ${override.type}`
  });

  revalidatePath("/classes");
  revalidatePath("/dashboard");
  return "Today's change saved.";
}
