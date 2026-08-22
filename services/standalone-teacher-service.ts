import crypto from "node:crypto";

import type { BatchMode, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { invitedRosterStudentWhere, ownedPersonalClassroomWhere, rosterEnrollmentWhere } from "@/lib/teacher-tenant-boundary.mjs";

const PERSONAL_WORKSPACE_KEY = "teachx.workspace";

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export async function isPersonalTeacherWorkspace(userId: string, institutionId: string) {
  const [setting, legacyTrial] = await Promise.all([
    prisma.setting.findUnique({ where: { institutionId_key: { institutionId, key: PERSONAL_WORKSPACE_KEY } }, select: { value: true } }),
    prisma.userSubscription.findFirst({ where: { userId, institutionId }, select: { metadata: true }, orderBy: { createdAt: "asc" } })
  ]);
  const explicit = record(setting?.value);
  if (explicit.kind === "PERSONAL_TEACHER") return explicit.ownerId === userId;
  return record(legacyTrial?.metadata).source === "teacher_phone_signup";
}

async function requirePersonalTeacher(userId: string, institutionId: string) {
  const teacher = await prisma.user.findFirst({
    where: { id: userId, institutionId, status: "ACTIVE", roles: { some: { role: { key: { in: ["ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"] } } } } },
    select: { id: true }
  });
  if (!teacher || !(await isPersonalTeacherWorkspace(userId, institutionId))) throw new Error("Personal teacher workspace access is required.");
}

async function requireOwnedPersonalClassroom(userId: string, institutionId: string, classroomId: string) {
  await requirePersonalTeacher(userId, institutionId);
  const classroom = await prisma.classroom.findFirst({
    where: ownedPersonalClassroomWhere({ userId, institutionId, classroomId }),
    select: { id: true, title: true, batchId: true, batch: { select: { capacity: true, _count: { select: { students: true } } } } }
  });
  if (!classroom) throw new Error("Classroom was not found in your personal workspace.");
  return classroom;
}

export async function createStandaloneClass(input: { userId: string; institutionId: string; className: string; subjectName: string; section: string; capacity: number; mode: BatchMode }) {
  await requirePersonalTeacher(input.userId, input.institutionId);
  const duplicate = await prisma.classroom.count({
    where: { institutionId: input.institutionId, title: { equals: input.className, mode: "insensitive" }, batch: { faculty: { some: { facultyId: input.userId } } } }
  });
  if (duplicate) throw new Error("You already have a class with this name.");

  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase();
  return prisma.$transaction(async (tx) => {
    const course = await tx.course.create({
      data: { institutionId: input.institutionId, name: input.className, code: `PERSONAL-${suffix}`, description: "Teacher-managed personal class.", learningModes: [input.mode], subjects: { create: { name: input.subjectName } } }
    });
    const batch = await tx.batch.create({
      data: { courseId: course.id, name: input.section, capacity: input.capacity, maximumStrength: input.capacity, mode: input.mode, status: "RUNNING", faculty: { create: { facultyId: input.userId, isLead: true } } }
    });
    const classroom = await tx.classroom.create({ data: { institutionId: input.institutionId, courseId: course.id, batchId: batch.id, title: input.className } });
    await tx.auditLog.create({ data: { institutionId: input.institutionId, actorId: input.userId, action: "CREATE", entity: "Classroom", entityId: classroom.id, message: `Created personal class ${input.className}` } });
    return classroom;
  }, { isolationLevel: "Serializable" });
}

export async function addStandaloneStudent(input: { userId: string; institutionId: string; classroomId: string; name: string; email?: string }) {
  const classroom = await requireOwnedPersonalClassroom(input.userId, input.institutionId, input.classroomId);
  if (classroom.batch._count.students >= classroom.batch.capacity) throw new Error("This class has reached its student capacity.");
  const studentRole = await prisma.role.findUnique({ where: { key: "STUDENT" }, select: { id: true } });
  if (!studentRole) throw new Error("Student accounts are not configured yet.");
  const email = input.email?.toLowerCase() || `roster-${crypto.randomUUID()}@accounts.teachx.invalid`;
  const existing = input.email ? await prisma.user.findUnique({ where: { email }, select: { id: true, institutionId: true, userType: true } }) : null;
  if (existing && (existing.institutionId !== input.institutionId || existing.userType !== "student")) throw new Error("That email cannot be added to this class.");

  return prisma.$transaction(async (tx) => {
    const currentBatch = await tx.batch.findFirst({
      where: { id: classroom.batchId, course: { institutionId: input.institutionId }, faculty: { some: { facultyId: input.userId } } },
      select: { capacity: true, _count: { select: { students: true } } }
    });
    if (!currentBatch) throw new Error("Classroom roster access is no longer available.");
    if (currentBatch._count.students >= currentBatch.capacity) throw new Error("This class has reached its student capacity.");
    const student = existing ?? await tx.user.create({
      data: { institutionId: input.institutionId, name: input.name, email, userType: "student", status: "INVITED", profile: { create: { title: "Student" } }, studentProfile: { create: {} }, roles: { create: { roleId: studentRole.id } } },
      select: { id: true, institutionId: true, userType: true }
    });
    const enrollment = await tx.batchStudent.upsert({ where: { batchId_studentId: { batchId: classroom.batchId, studentId: student.id } }, update: {}, create: { batchId: classroom.batchId, studentId: student.id } });
    const publishedAssignments = await tx.assignment.findMany({ where: { classroomId: classroom.id, status: "PUBLISHED" }, select: { id: true } });
    if (publishedAssignments.length) {
      await tx.assignmentSubmission.createMany({
        data: publishedAssignments.map((assignment) => ({ assignmentId: assignment.id, studentId: student.id })),
        skipDuplicates: true
      });
    }
    await tx.auditLog.create({ data: { institutionId: input.institutionId, actorId: input.userId, action: "CREATE", entity: "BatchStudent", entityId: enrollment.id, message: `Added a student to ${classroom.title}` } });
    return enrollment;
  }, { isolationLevel: "Serializable" });
}

export async function updateStandaloneStudent(input: { userId: string; institutionId: string; classroomId: string; studentId: string; name: string }) {
  const classroom = await requireOwnedPersonalClassroom(input.userId, input.institutionId, input.classroomId);
  const student = await prisma.user.findFirst({
    where: invitedRosterStudentWhere({ institutionId: input.institutionId, batchId: classroom.batchId, studentId: input.studentId }),
    select: { id: true }
  });
  if (!student) throw new Error("Only invited students in this class can be edited.");
  await prisma.user.update({ where: { id: student.id }, data: { name: input.name } });
}

export async function removeStandaloneStudent(input: { userId: string; institutionId: string; classroomId: string; studentId: string }) {
  const classroom = await requireOwnedPersonalClassroom(input.userId, input.institutionId, input.classroomId);
  const enrollment = await prisma.batchStudent.findFirst({
    where: rosterEnrollmentWhere({ institutionId: input.institutionId, batchId: classroom.batchId, studentId: input.studentId }), select: { id: true }
  });
  if (!enrollment) throw new Error("Student enrollment was not found in this class.");
  await prisma.batchStudent.delete({ where: { id: enrollment.id } });
  await prisma.auditLog.create({ data: { institutionId: input.institutionId, actorId: input.userId, action: "DELETE", entity: "BatchStudent", entityId: enrollment.id, message: `Removed a student from ${classroom.title}` } });
}

export const personalWorkspaceSetting = (ownerId: string): Prisma.InputJsonValue => ({ kind: "PERSONAL_TEACHER", ownerId });
