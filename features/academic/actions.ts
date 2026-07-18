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

async function getAcademicSession() {
  const session = await auth();
  const institutionId = session?.user.institutionId;
  if (!session?.user || !institutionId) throw new Error("Institution is required.");
  if (!userHasPermission(session.user.roles, "academic.setup.manage")) throw new Error("You do not have access to manage academic setup.");
  return { session, institutionId };
}

const branchSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  address: z.string().optional(),
  contact: z.string().optional()
});

export async function createBranchAction(_: string | undefined, formData: FormData) {
  const { session, institutionId } = await getAcademicSession();
  const parsed = branchSchema.safeParse({
    name: optionalText(formData.get("name")),
    code: optionalText(formData.get("code")),
    address: optionalText(formData.get("address")),
    contact: optionalText(formData.get("contact"))
  });

  if (!parsed.success) return "Please enter a branch name and code.";

  const branch = await prisma.branch.create({
    data: {
      institutionId,
      ...parsed.data,
      code: parsed.data.code.toUpperCase()
    }
  });

  await writeAuditLog({
    institutionId,
    actorId: session.user.id,
    action: "CREATE",
    entity: "Branch",
    entityId: branch.id,
    message: `Created branch ${branch.name}`
  });

  revalidatePath("/operations");
  return "Branch created.";
}

const academicYearSchema = z.object({
  name: z.string().min(4),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isCurrent: z.coerce.boolean().optional()
});

export async function createAcademicYearAction(_: string | undefined, formData: FormData) {
  const { session, institutionId } = await getAcademicSession();
  const parsed = academicYearSchema.safeParse({
    name: optionalText(formData.get("name")),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    isCurrent: formData.get("isCurrent") === "on"
  });

  if (!parsed.success) return "Please enter valid academic year dates.";

  if (parsed.data.isCurrent) {
    await prisma.academicYear.updateMany({
      where: { institutionId },
      data: { isCurrent: false, status: "PLANNED" }
    });
  }

  const year = await prisma.academicYear.create({
    data: {
      institutionId,
      name: parsed.data.name,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      isCurrent: Boolean(parsed.data.isCurrent),
      status: parsed.data.isCurrent ? "CURRENT" : "PLANNED"
    }
  });

  await writeAuditLog({
    institutionId,
    actorId: session.user.id,
    action: "CREATE",
    entity: "AcademicYear",
    entityId: year.id,
    message: `Created academic year ${year.name}`
  });

  revalidatePath("/operations");
  return "Academic year created.";
}

const departmentSchema = z.object({
  name: z.string().min(2),
  code: z.string().optional()
});

export async function createDepartmentAction(_: string | undefined, formData: FormData) {
  const { session, institutionId } = await getAcademicSession();
  const parsed = departmentSchema.safeParse({
    name: optionalText(formData.get("name")),
    code: optionalText(formData.get("code"))
  });

  if (!parsed.success) return "Please enter a department name.";

  const department = await prisma.department.create({
    data: {
      institutionId,
      ...parsed.data
    }
  });

  await writeAuditLog({
    institutionId,
    actorId: session.user.id,
    action: "CREATE",
    entity: "Department",
    entityId: department.id,
    message: `Created department ${department.name}`
  });

  revalidatePath("/operations");
  return "Department created.";
}

const timeSlotSchema = z.object({
  name: z.string().min(2),
  startsAt: z.string().min(4),
  endsAt: z.string().min(4),
  type: z.enum(["CLASS", "BREAK", "LUNCH", "CUSTOM"]),
  shift: z.string().optional(),
  order: z.coerce.number().int().min(1)
});

export async function createTimeSlotAction(_: string | undefined, formData: FormData) {
  const { session, institutionId } = await getAcademicSession();
  const parsed = timeSlotSchema.safeParse({
    name: optionalText(formData.get("name")),
    startsAt: optionalText(formData.get("startsAt")),
    endsAt: optionalText(formData.get("endsAt")),
    type: optionalText(formData.get("type")) ?? "CLASS",
    shift: optionalText(formData.get("shift")),
    order: formData.get("order") ?? "1"
  });

  if (!parsed.success) return "Please enter a valid time slot.";

  const slot = await prisma.timeSlot.create({
    data: {
      institutionId,
      ...parsed.data
    }
  });

  await writeAuditLog({
    institutionId,
    actorId: session.user.id,
    action: "CREATE",
    entity: "TimeSlot",
    entityId: slot.id,
    message: `Created time slot ${slot.name}`
  });

  revalidatePath("/operations");
  revalidatePath("/classes");
  return "Time slot created.";
}

const roomSchema = z.object({
  name: z.string().min(2),
  code: z.string().optional(),
  capacity: z.coerce.number().int().positive().optional(),
  branchId: z.string().optional()
});

export async function createRoomAction(_: string | undefined, formData: FormData) {
  const { session, institutionId } = await getAcademicSession();
  const parsed = roomSchema.safeParse({
    name: optionalText(formData.get("name")),
    code: optionalText(formData.get("code")),
    capacity: optionalText(formData.get("capacity")),
    branchId: optionalText(formData.get("branchId"))
  });

  if (!parsed.success) return "Please enter a room name.";

  const room = await prisma.room.create({
    data: {
      institutionId,
      ...parsed.data
    }
  });

  await writeAuditLog({
    institutionId,
    actorId: session.user.id,
    action: "CREATE",
    entity: "Room",
    entityId: room.id,
    message: `Created room ${room.name}`
  });

  revalidatePath("/operations");
  revalidatePath("/classes");
  return "Room created.";
}

const plannerEventSchema = z.object({
  title: z.string().min(2),
  type: z.enum(["HOLIDAY", "SPECIAL_HOLIDAY", "EVENT"]),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  academicYearId: z.string().optional(),
  description: z.string().optional()
});

export async function createPlannerEventAction(_: string | undefined, formData: FormData) {
  const { session, institutionId } = await getAcademicSession();
  const parsed = plannerEventSchema.safeParse({
    title: optionalText(formData.get("title")),
    type: optionalText(formData.get("type")) ?? "EVENT",
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    academicYearId: optionalText(formData.get("academicYearId")),
    description: optionalText(formData.get("description"))
  });

  if (!parsed.success) return "Please enter a valid calendar item.";

  const event = await prisma.plannerEvent.create({
    data: {
      institutionId,
      ...parsed.data
    }
  });

  await writeAuditLog({
    institutionId,
    actorId: session.user.id,
    action: "CREATE",
    entity: "PlannerEvent",
    entityId: event.id,
    message: `Created calendar item ${event.title}`
  });

  revalidatePath("/operations");
  revalidatePath("/classes");
  return "Calendar item created.";
}
