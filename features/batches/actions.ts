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

async function getBatchSession() {
  const session = await auth();
  const institutionId = session?.user.institutionId;
  if (!session?.user || !institutionId) throw new Error("Institution is required.");
  if (!userHasPermission(session.user.roles, "batches.manage")) throw new Error("You do not have access to manage batches.");
  return { session, institutionId };
}

const batchSchema = z.object({
  name: z.string().min(2),
  courseId: z.string().min(1),
  branchId: z.string().optional(),
  academicYearId: z.string().optional(),
  capacity: z.coerce.number().int().positive(),
  maximumStrength: z.coerce.number().int().positive(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  mode: z.enum(["LIVE", "RECORDED", "OFFLINE", "HYBRID"]),
  type: z.enum(["MORNING", "EVENING", "WEEKEND", "WEEKDAY", "ONLINE", "OFFLINE", "HYBRID", "CUSTOM"]),
  status: z.enum(["UPCOMING", "RUNNING", "COMPLETED", "CANCELLED"])
});

export async function createBatchAction(_: string | undefined, formData: FormData) {
  const { session, institutionId } = await getBatchSession();
  const parsed = batchSchema.safeParse({
    name: optionalText(formData.get("name")),
    courseId: optionalText(formData.get("courseId")),
    branchId: optionalText(formData.get("branchId")),
    academicYearId: optionalText(formData.get("academicYearId")),
    capacity: formData.get("capacity") ?? "30",
    maximumStrength: formData.get("maximumStrength") ?? "30",
    startDate: optionalText(formData.get("startDate")),
    endDate: optionalText(formData.get("endDate")),
    mode: optionalText(formData.get("mode")) ?? "OFFLINE",
    type: optionalText(formData.get("type")) ?? "WEEKDAY",
    status: optionalText(formData.get("status")) ?? "UPCOMING"
  });

  if (!parsed.success) return "Please enter valid batch details.";

  const course = await prisma.course.findFirst({
    where: {
      id: parsed.data.courseId,
      institutionId
    }
  });

  if (!course) return "Course was not found.";

  const batch = await prisma.batch.create({
    data: parsed.data
  });

  await writeAuditLog({
    institutionId,
    actorId: session.user.id,
    action: "CREATE",
    entity: "Batch",
    entityId: batch.id,
    message: `Created batch ${batch.name}`
  });

  revalidatePath("/batches");
  return "Batch created.";
}

const facultySchema = z.object({
  batchId: z.string().min(1),
  facultyId: z.string().min(1),
  isLead: z.coerce.boolean().optional()
});

export async function assignFacultyAction(_: string | undefined, formData: FormData) {
  const { session, institutionId } = await getBatchSession();
  const parsed = facultySchema.safeParse({
    batchId: optionalText(formData.get("batchId")),
    facultyId: optionalText(formData.get("facultyId")),
    isLead: formData.get("isLead") === "on"
  });

  if (!parsed.success) return "Please select a batch and faculty member.";

  const batch = await prisma.batch.findFirst({
    where: {
      id: parsed.data.batchId,
      course: { institutionId }
    }
  });

  if (!batch) return "Batch was not found.";

  await prisma.batchFaculty.upsert({
    where: {
      batchId_facultyId: {
        batchId: parsed.data.batchId,
        facultyId: parsed.data.facultyId
      }
    },
    update: { isLead: Boolean(parsed.data.isLead) },
    create: parsed.data
  });

  await writeAuditLog({
    institutionId,
    actorId: session.user.id,
    action: "UPDATE",
    entity: "Batch",
    entityId: parsed.data.batchId,
    message: "Assigned faculty to batch"
  });

  revalidatePath("/batches");
  return "Faculty assigned.";
}
