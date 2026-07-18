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

async function getCourseSession() {
  const session = await auth();
  const institutionId = session?.user.institutionId;
  if (!session?.user || !institutionId) throw new Error("Institution is required.");
  if (!userHasPermission(session.user.roles, "courses.manage")) throw new Error("You do not have access to manage courses.");
  return { session, institutionId };
}

const courseSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  description: z.string().optional(),
  duration: z.string().optional(),
  category: z.string().optional(),
  branchId: z.string().optional(),
  academicYearId: z.string().optional(),
  departmentId: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  learningModes: z.array(z.enum(["LIVE", "RECORDED", "OFFLINE", "HYBRID"])).min(1)
});

export async function createCourseAction(_: string | undefined, formData: FormData) {
  const { session, institutionId } = await getCourseSession();
  const parsed = courseSchema.safeParse({
    name: optionalText(formData.get("name")),
    code: optionalText(formData.get("code")),
    description: optionalText(formData.get("description")),
    duration: optionalText(formData.get("duration")),
    category: optionalText(formData.get("category")),
    branchId: optionalText(formData.get("branchId")),
    academicYearId: optionalText(formData.get("academicYearId")),
    departmentId: optionalText(formData.get("departmentId")),
    thumbnailUrl: optionalText(formData.get("thumbnailUrl")),
    learningModes: formData.getAll("learningModes").map((value) => value.toString())
  });

  if (!parsed.success) return "Please enter course details and at least one learning mode.";

  const course = await prisma.course.create({
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
    entity: "Course",
    entityId: course.id,
    message: `Created course ${course.name}`
  });

  revalidatePath("/courses");
  return "Course created.";
}

const subjectSchema = z.object({
  courseId: z.string().min(1),
  name: z.string().min(2),
  code: z.string().optional(),
  description: z.string().optional(),
  order: z.coerce.number().int().min(1),
  departmentId: z.string().optional()
});

export async function createSubjectAction(_: string | undefined, formData: FormData) {
  const { session, institutionId } = await getCourseSession();
  const parsed = subjectSchema.safeParse({
    courseId: optionalText(formData.get("courseId")),
    name: optionalText(formData.get("name")),
    code: optionalText(formData.get("code")),
    description: optionalText(formData.get("description")),
    order: formData.get("order") ?? "1",
    departmentId: optionalText(formData.get("departmentId"))
  });

  if (!parsed.success) return "Please enter subject details.";

  const course = await prisma.course.findFirst({
    where: {
      id: parsed.data.courseId,
      institutionId
    }
  });

  if (!course) return "Course was not found.";

  const subject = await prisma.subject.create({
    data: parsed.data
  });

  await writeAuditLog({
    institutionId,
    actorId: session.user.id,
    action: "CREATE",
    entity: "Subject",
    entityId: subject.id,
    message: `Created subject ${subject.name}`
  });

  revalidatePath("/courses");
  return "Subject created.";
}
