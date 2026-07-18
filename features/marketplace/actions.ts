"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getMarketplaceTeacher } from "@/services/marketplace-service";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function list(formData: FormData, key: string) {
  return value(formData, key).split(",").map((item) => item.trim()).filter(Boolean);
}

export async function updateTeacherMarketplaceProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user.id) return;

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
      hourlyRate: value(formData, "hourlyRate") || undefined,
      weeklyRate: value(formData, "weeklyRate") || undefined,
      monthlyRate: value(formData, "monthlyRate") || undefined,
      location: value(formData, "location") || undefined,
      teachingStyle: value(formData, "teachingStyle") || undefined,
      certificates: list(formData, "certificates"),
      achievements: list(formData, "achievements"),
      isMarketplaceListed: formData.get("isMarketplaceListed") === "on",
      availability: {
        summary: value(formData, "availability"),
        documentsPlaceholder: true,
        portfolioPlaceholder: true
      }
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
      hourlyRate: value(formData, "hourlyRate") || undefined,
      weeklyRate: value(formData, "weeklyRate") || undefined,
      monthlyRate: value(formData, "monthlyRate") || undefined,
      location: value(formData, "location") || undefined,
      teachingStyle: value(formData, "teachingStyle") || undefined,
      certificates: list(formData, "certificates"),
      achievements: list(formData, "achievements"),
      isMarketplaceListed: formData.get("isMarketplaceListed") === "on",
      availability: { summary: value(formData, "availability"), documentsPlaceholder: true, portfolioPlaceholder: true }
    }
  });

  revalidatePath("/teacher/marketplace");
  revalidatePath("/marketplace");
}

export async function favoriteTeacherAction(formData: FormData) {
  const session = await auth();
  const teacherProfileId = value(formData, "teacherProfileId");
  const title = value(formData, "title");
  if (!session?.user.id || !teacherProfileId) return;

  await prisma.favoriteItem.upsert({
    where: { userId_type_entityId: { userId: session.user.id, type: "marketplace-teacher", entityId: teacherProfileId } },
    update: { title, link: `/marketplace/teachers/${teacherProfileId}` },
    create: { userId: session.user.id, type: "marketplace-teacher", entityId: teacherProfileId, title, link: `/marketplace/teachers/${teacherProfileId}` }
  });

  const teacher = await getMarketplaceTeacher(teacherProfileId);
  if (teacher?.userId) {
    await prisma.notification.create({
      data: {
        userId: teacher.userId,
        institutionId: session.user.institutionId,
        title: "Your profile was saved",
        body: `${session.user.name ?? "A student"} saved your teacher profile.`,
        link: "/teacher/marketplace"
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

  await prisma.teacherBookingRequest.create({
    data: {
      teacherProfileId: teacher.id,
      teacherId: teacher.userId,
      studentId: session.user.id,
      studentName: session.user.name ?? "Student",
      studentEmail: session.user.email ?? undefined,
      preferredDate: value(formData, "preferredDate") ? new Date(value(formData, "preferredDate")) : undefined,
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
      institutionId: session.user.institutionId,
      title: "New booking request",
      body: `${session.user.name ?? "A student"} requested a class for ${value(formData, "subject") || "learning support"}.`,
      link: "/teacher/marketplace"
    }
  });

  revalidatePath("/marketplace");
  redirect("/student/teachers");
}
