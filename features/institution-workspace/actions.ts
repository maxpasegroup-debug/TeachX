"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { requireAcademicReferences } from "@/services/academic-integrity-service";

const text = (fd: FormData, key: string) => fd.get(key)?.toString().trim() ?? "";
async function access(permission: "institution.manage" | "academic.setup.manage" = "academic.setup.manage") {
  const user = await requireCurrentUser(permission);
  if (!user.institutionId) throw new Error("Institution workspace permission is required.");
  return { userId: user.id, institutionId: user.institutionId };
}
function refresh() { revalidatePath("/institution", "layout"); }

export async function saveInstitutionProfileAction(fd: FormData) {
  const { institutionId } = await access("institution.manage");
  await prisma.institution.update({ where: { id: institutionId }, data: {
    name: text(fd, "name"), logoUrl: text(fd, "logoUrl") || null, address: text(fd, "address") || null,
    phone: text(fd, "phone") || null, email: text(fd, "email") || null, website: text(fd, "website") || null
  } });
  await prisma.setting.upsert({ where: { institutionId_key: { institutionId, key: "institution.profile" } }, create: { institutionId, key: "institution.profile", value: {
    coverImage: text(fd, "coverImage"), description: text(fd, "description"), accreditation: text(fd, "accreditation"),
    linkedin: text(fd, "linkedin"), facebook: text(fd, "facebook"), instagram: text(fd, "instagram")
  } }, update: { value: {
    coverImage: text(fd, "coverImage"), description: text(fd, "description"), accreditation: text(fd, "accreditation"),
    linkedin: text(fd, "linkedin"), facebook: text(fd, "facebook"), instagram: text(fd, "instagram")
  } } });
  refresh();
}
export async function saveInstitutionPreferencesAction(fd: FormData) {
  const { institutionId } = await access("institution.manage");
  await prisma.institution.update({ where: { id: institutionId }, data: {
    primaryColor: text(fd, "primaryColor") || "#111827", secondaryColor: text(fd, "secondaryColor") || "#64748b",
    timezone: text(fd, "timezone") || "Asia/Kolkata", currency: text(fd, "currency") || "INR", academicYear: text(fd, "academicYear") || null
  } });
  const value = { permissions: text(fd, "permissions"), notifications: text(fd, "notifications"), integrations: text(fd, "integrations"), subscription: text(fd, "subscription") };
  await prisma.setting.upsert({ where: { institutionId_key: { institutionId, key: "institution.preferences" } }, create: { institutionId, key: "institution.preferences", value }, update: { value } });
  refresh();
}
export async function saveDepartmentAction(fd: FormData) {
  const { institutionId } = await access(); const id = text(fd, "id");
  const data = { name: text(fd, "name"), code: text(fd, "code") || null, status: text(fd, "status") === "INACTIVE" ? "INACTIVE" as const : "ACTIVE" as const };
  if (id) await prisma.department.updateMany({ where: { id, institutionId }, data }); else await prisma.department.create({ data: { institutionId, ...data } });
  refresh();
}
export async function deleteDepartmentAction(fd: FormData) {
  const { institutionId } = await access(); await prisma.department.deleteMany({ where: { id: text(fd, "id"), institutionId, courses: { none: {} } } }); refresh();
}
export async function saveAcademicYearAction(fd: FormData) {
  const { institutionId } = await access(); const id = text(fd, "id"); const current = fd.get("isCurrent") === "on";
  if (current) await prisma.academicYear.updateMany({ where: { institutionId }, data: { isCurrent: false } });
  const data = { name: text(fd, "name"), startDate: new Date(text(fd, "startDate")), endDate: new Date(text(fd, "endDate")), isCurrent: current, status: current ? "CURRENT" as const : "PLANNED" as const };
  if (id) await prisma.academicYear.updateMany({ where: { id, institutionId }, data }); else await prisma.academicYear.create({ data: { institutionId, ...data } }); refresh();
}
export async function saveTermAction(fd: FormData) {
  const { institutionId } = await access(); const academicYearId = text(fd, "academicYearId");
  const year = await prisma.academicYear.findFirst({ where: { id: academicYearId, institutionId } }); if (!year) throw new Error("Academic year not found.");
  await prisma.academicTerm.create({ data: { academicYearId, name: text(fd, "name"), startDate: new Date(text(fd, "startDate")), endDate: new Date(text(fd, "endDate")), order: Number(text(fd, "order") || 1) } }); refresh();
}
export async function saveClassAction(fd: FormData) {
  const { institutionId } = await access(); const courseId = text(fd, "courseId"); const course = await prisma.course.findFirst({ where: { id: courseId, institutionId } }); if (!course) throw new Error("Course not found.");
  const batch = await prisma.batch.create({ data: { courseId, name: text(fd, "name"), capacity: Number(text(fd, "capacity") || 30), maximumStrength: Number(text(fd, "capacity") || 30), status: "RUNNING" } });
  await prisma.classroom.create({ data: { institutionId, courseId, batchId: batch.id, title: text(fd, "title") || `${course.name} · ${batch.name}` } }); refresh();
}
export async function deleteClassAction(fd: FormData) {
  const { institutionId } = await access(); const classroom = await prisma.classroom.findFirst({ where: { id: text(fd, "id"), institutionId }, select: { batchId: true } }); if (classroom) await prisma.batch.delete({ where: { id: classroom.batchId } }); refresh();
}
export async function assignFacultyAction(fd: FormData) {
  const { institutionId } = await access(); const batchId = text(fd, "batchId"), facultyId = text(fd, "facultyId");
  await requireAcademicReferences(institutionId, { batchId, facultyId });
  await prisma.batchFaculty.upsert({ where: { batchId_facultyId: { batchId, facultyId } }, create: { batchId, facultyId, isLead: fd.get("isLead") === "on" }, update: { isLead: fd.get("isLead") === "on" } }); refresh();
}
export async function saveTimetableAction(fd: FormData) {
  const { institutionId } = await access(); const batchId = text(fd, "batchId"), timeSlotId = text(fd, "timeSlotId"), subjectId = text(fd, "subjectId") || null, facultyId = text(fd, "facultyId") || null, roomId = text(fd, "roomId") || null;
  const refs = await requireAcademicReferences(institutionId, { batchId, timeSlotId, subjectId, facultyId, roomId });
  if (!refs.batch) throw new Error("Class not found.");
  await prisma.timetableEntry.create({ data: { batchId, courseId: refs.batch.courseId, day: text(fd, "day") as never, timeSlotId, subjectId, facultyId, roomId } }); refresh();
}
export async function deleteTimetableAction(fd: FormData) {
  const { institutionId } = await access(); await prisma.timetableEntry.deleteMany({ where: { id: text(fd, "id"), course: { institutionId } } }); refresh();
}
export async function saveAnnouncementAction(fd: FormData) {
  const { institutionId, userId } = await access(); const id = text(fd, "id");
  const data = { title: text(fd, "title"), body: text(fd, "body"), kind: "ANNOUNCEMENT" as const, priority: text(fd, "priority") as "LOW"|"NORMAL"|"HIGH"|"URGENT", status: text(fd, "scheduledAt") ? "SCHEDULED" as const : "SENT" as const, roleKey: text(fd, "audience") || null, attachmentUrl: text(fd, "attachmentUrl") || null, scheduledAt: text(fd, "scheduledAt") ? new Date(text(fd, "scheduledAt")) : null, publishedAt: text(fd, "scheduledAt") ? null : new Date() };
  if (id) await prisma.communication.updateMany({ where: { id, institutionId }, data }); else await prisma.communication.create({ data: { institutionId, createdById: userId, channels: ["IN_APP"], ...data } }); refresh();
}
export async function archiveAnnouncementAction(fd: FormData) {
  const { institutionId } = await access(); await prisma.communication.updateMany({ where: { id: text(fd, "id"), institutionId }, data: { status: "EXPIRED" } }); refresh();
}
export async function deleteAnnouncementAction(fd: FormData) {
  const { institutionId } = await access(); await prisma.communication.deleteMany({ where: { id: text(fd, "id"), institutionId } }); refresh();
}
