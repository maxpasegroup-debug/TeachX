"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getMarketplaceTeacher } from "@/services/marketplace-service";

const teacherRoles = ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"];

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function list(formData: FormData, key: string) {
  return value(formData, key).split(",").map((item) => item.trim()).filter(Boolean).slice(0, 30);
}
function record(input: unknown) { return input && typeof input === "object" && !Array.isArray(input) ? input as Record<string, unknown> : {}; }
function rate(formData: FormData, key: string) { const amount = Number(value(formData, key)); return Number.isFinite(amount) && amount >= 0 && amount <= 10_000_000 ? amount : 0; }

export async function updateTeacherMarketplaceProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user.id || !session.user.institutionId) return;
  const teacher = await prisma.user.findFirst({ where: { id: session.user.id, institutionId: session.user.institutionId, status: "ACTIVE", roles: { some: { role: { key: { in: teacherRoles } } } } }, select: { id: true, teacherProfile: { select: { availability: true } } } });
  if (!teacher) return;
  const availability = { ...record(teacher.teacherProfile?.availability), summary: value(formData, "availability").slice(0, 1000) };

  await prisma.teacherProfile.upsert({
    where: { userId: session.user.id },
    update: {
      headline: value(formData, "headline") || undefined,
      bio: value(formData, "bio") || undefined,
      qualification: value(formData, "qualification") || undefined,
      experienceYears: Number(value(formData, "experienceYears") || 0) || undefined,
      subjects: list(formData, "subjects"),
      classes: list(formData, "classes"),
      boards: list(formData, "boards"),
      languages: list(formData, "languages"),
      teachingMode: value(formData, "teachingMode") || undefined,
      hourlyRate: rate(formData, "hourlyRate"),
      weeklyRate: rate(formData, "weeklyRate"),
      monthlyRate: rate(formData, "monthlyRate"),
      location: value(formData, "location") || undefined,
      teachingStyle: value(formData, "teachingStyle") || undefined,
      certificates: list(formData, "certificates"),
      achievements: list(formData, "achievements"),
      isMarketplaceListed: formData.get("isMarketplaceListed") === "on",
      availability
    },
    create: {
      userId: session.user.id,
      headline: value(formData, "headline") || undefined,
      bio: value(formData, "bio") || undefined,
      qualification: value(formData, "qualification") || undefined,
      experienceYears: Number(value(formData, "experienceYears") || 0) || undefined,
      subjects: list(formData, "subjects"),
      classes: list(formData, "classes"),
      boards: list(formData, "boards"),
      languages: list(formData, "languages"),
      teachingMode: value(formData, "teachingMode") || undefined,
      hourlyRate: rate(formData, "hourlyRate"),
      weeklyRate: rate(formData, "weeklyRate"),
      monthlyRate: rate(formData, "monthlyRate"),
      location: value(formData, "location") || undefined,
      teachingStyle: value(formData, "teachingStyle") || undefined,
      certificates: list(formData, "certificates"),
      achievements: list(formData, "achievements"),
      isMarketplaceListed: formData.get("isMarketplaceListed") === "on",
      availability
    }
  });

  revalidatePath("/teacher/business/marketplace");
  revalidatePath("/marketplace");
}

export async function favoriteTeacherAction(formData: FormData) {
  const session = await auth();
  const teacherProfileId = value(formData, "teacherProfileId");
  if (!session?.user.id || !teacherProfileId) return;
  const teacher = await getMarketplaceTeacher(teacherProfileId);
  if (!teacher) return;
  const title = teacher.user.name || "TeachX Teacher";

  await prisma.favoriteItem.upsert({
    where: { userId_type_entityId: { userId: session.user.id, type: "marketplace-teacher", entityId: teacherProfileId } },
    update: { title, link: `/marketplace/teachers/${teacherProfileId}` },
    create: { userId: session.user.id, type: "marketplace-teacher", entityId: teacherProfileId, title, link: `/marketplace/teachers/${teacherProfileId}` }
  });

  if (teacher.userId) {
    await prisma.notification.create({
      data: {
        userId: teacher.userId,
        institutionId: teacher.user.institutionId,
        title: "Your profile was saved",
        body: `${session.user.name ?? "A student"} saved your teacher profile.`,
        link: "/teacher/business/marketplace"
      }
    });
  }

  revalidatePath("/marketplace");
}

export async function createTeacherBookingRequestAction(formData: FormData) {
  const session = await auth();
  const teacherProfileId = value(formData, "teacherProfileId");
  const teacher = teacherProfileId ? await getMarketplaceTeacher(teacherProfileId) : null;
  if (!session?.user.id || !teacher) return;
  const requester = await prisma.user.findFirst({ where: { id: session.user.id, status: "ACTIVE" }, select: { id: true } });
  if (!requester || teacher.userId === requester.id) return;
  const preferredDateValue = value(formData, "preferredDate");
  const preferredDate = preferredDateValue ? new Date(preferredDateValue) : undefined;
  if (preferredDate && Number.isNaN(preferredDate.getTime())) return;

  await prisma.teacherBookingRequest.create({
    data: {
      teacherProfileId: teacher.id,
      teacherId: teacher.userId,
      studentId: requester.id,
      studentName: session.user.name ?? "Student",
      studentEmail: session.user.email ?? undefined,
      preferredDate,
      preferredTime: value(formData, "preferredTime") || undefined,
      subject: value(formData, "subject") || "General learning",
      className: value(formData, "className") || undefined,
      learningGoal: value(formData, "learningGoal") || undefined,
      message: value(formData, "message") || undefined
    }
  });

  await prisma.notification.create({
    data: {
      userId: teacher.userId,
      institutionId: teacher.user.institutionId,
      title: "New booking request",
      body: `${session.user.name ?? "A student"} requested a class for ${value(formData, "subject") || "learning support"}.`,
      link: "/teacher/business/marketplace"
    }
  });

  revalidatePath("/marketplace");
  redirect("/student/teachers");
}
