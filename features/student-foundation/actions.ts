"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const text = (data: FormData, key: string) => String(data.get(key) ?? "").trim();
const list = (data: FormData, key: string) => text(data, key).split(",").map((item) => item.trim()).filter(Boolean);
async function student() {
  const session = await auth();
  if (!session?.user.id || !session.user.roles.includes("STUDENT")) throw new Error("Student access is required.");
  return session.user;
}
async function preference(userId: string, key: string, value: Prisma.InputJsonValue) {
  await prisma.userPreference.upsert({ where: { userId_key: { userId, key } }, create: { userId, key, value }, update: { value } });
}
function refresh() {
  revalidatePath("/student");
  revalidatePath("/student/onboarding");
  revalidatePath("/student/profile");
  revalidatePath("/student/goals");
  revalidatePath("/student/connections");
  revalidatePath("/student/personalization");
  revalidatePath("/student/settings");
}

export async function saveOnboardingAction(data: FormData) {
  const user = await student();
  const profile = {
    grade: text(data, "grade"), board: text(data, "board"), school: text(data, "school"),
    subjects: list(data, "subjects"), targetExam: text(data, "targetExam"), dailyStudyTime: text(data, "dailyStudyTime"),
    language: text(data, "language"), careerGoal: text(data, "careerGoal"), learningStyle: text(data, "learningStyle")
  };
  if (!profile.grade || !profile.board || !profile.subjects.length || !profile.dailyStudyTime || !profile.language || !profile.learningStyle) throw new Error("Complete every required learning-map field.");
  await prisma.$transaction([
    prisma.studentProfile.upsert({ where: { userId: user.id }, create: { userId: user.id, learningGoal: profile.careerGoal || profile.targetExam, interests: profile.subjects, onboardingStep: "complete" }, update: { learningGoal: profile.careerGoal || profile.targetExam, interests: profile.subjects, onboardingStep: "complete" } }),
    prisma.userPreference.upsert({ where: { userId_key: { userId: user.id, key: "learnx.profile" } }, create: { userId: user.id, key: "learnx.profile", value: profile }, update: { value: profile } }),
    prisma.userPreference.upsert({ where: { userId_key: { userId: user.id, key: "learnx.personalization" } }, create: { userId: user.id, key: "learnx.personalization", value: { favoriteSubjects: profile.subjects, weakSubjects: [], learningSpeed: "steady", studyPattern: "focused-sprints", preferredDifficulty: "adaptive", preferredStudyTime: profile.dailyStudyTime, learningStyle: profile.learningStyle, revisionFrequency: "weekly" } }, update: { value: { favoriteSubjects: profile.subjects, weakSubjects: [], learningSpeed: "steady", studyPattern: "focused-sprints", preferredDifficulty: "adaptive", preferredStudyTime: profile.dailyStudyTime, learningStyle: profile.learningStyle, revisionFrequency: "weekly" } } })
  ]);
  refresh();
}

export async function saveStudentProfileAction(data: FormData) {
  const user = await student();
  const profile = {
    grade: text(data, "grade"), school: text(data, "school"), board: text(data, "board"), language: text(data, "language"),
    dateOfBirth: text(data, "dateOfBirth"), parentInformation: text(data, "parentInformation"), academicInterests: list(data, "academicInterests"),
    careerGoal: text(data, "careerGoal"), learningStyle: text(data, "learningStyle")
  };
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { name: text(data, "name") || user.name || "Student" } }),
    prisma.profile.upsert({ where: { userId: user.id }, create: { userId: user.id, avatarUrl: text(data, "avatarUrl") || null, phone: text(data, "phone") || null }, update: { avatarUrl: text(data, "avatarUrl") || null, phone: text(data, "phone") || null } }),
    prisma.studentProfile.upsert({ where: { userId: user.id }, create: { userId: user.id, learningGoal: profile.careerGoal, interests: profile.academicInterests }, update: { learningGoal: profile.careerGoal, interests: profile.academicInterests } }),
    prisma.userPreference.upsert({ where: { userId_key: { userId: user.id, key: "learnx.profile" } }, create: { userId: user.id, key: "learnx.profile", value: profile }, update: { value: profile } })
  ]);
  refresh();
}

export async function savePersonalizationAction(data: FormData) {
  const user = await student();
  await preference(user.id, "learnx.personalization", {
    favoriteSubjects: list(data, "favoriteSubjects"), weakSubjects: list(data, "weakSubjects"),
    learningSpeed: text(data, "learningSpeed"), studyPattern: text(data, "studyPattern"), preferredDifficulty: text(data, "preferredDifficulty"),
    preferredStudyTime: text(data, "preferredStudyTime"), learningStyle: text(data, "learningStyle"), revisionFrequency: text(data, "revisionFrequency")
  });
  refresh();
}

export async function saveGoalAction(data: FormData) {
  const user = await student();
  const current = await prisma.userPreference.findUnique({ where: { userId_key: { userId: user.id, key: "learnx.goals" } } });
  const goals = Array.isArray(current?.value) ? current.value as Array<Record<string, unknown>> : [];
  const title = text(data, "title");
  if (!title) throw new Error("Add a goal title.");
  goals.unshift({ id: crypto.randomUUID(), type: text(data, "type") || "Weekly", title, targetDate: text(data, "targetDate"), completed: false });
  await preference(user.id, "learnx.goals", goals as Prisma.InputJsonValue);
  refresh();
}

export async function deleteGoalAction(data: FormData) {
  const user = await student();
  const current = await prisma.userPreference.findUnique({ where: { userId_key: { userId: user.id, key: "learnx.goals" } } });
  const goals = Array.isArray(current?.value) ? current.value as Array<Record<string, unknown>> : [];
  await preference(user.id, "learnx.goals", goals.filter((goal) => goal.id !== text(data, "id")) as Prisma.InputJsonValue);
  refresh();
}

export async function updateGoalAction(data: FormData) {
  const user = await student();
  const current = await prisma.userPreference.findUnique({ where: { userId_key: { userId: user.id, key: "learnx.goals" } } });
  const goals = Array.isArray(current?.value) ? current.value as Array<Record<string, unknown>> : [];
  const id = text(data, "id");
  const updated = goals.map((goal) => goal.id === id ? { ...goal, title: text(data, "title") || goal.title, type: text(data, "type") || goal.type, targetDate: text(data, "targetDate"), completed: data.get("completed") === "true" ? !Boolean(goal.completed) : goal.completed } : goal);
  await preference(user.id, "learnx.goals", updated as Prisma.InputJsonValue);
  refresh();
}

export async function inviteParentAction(data: FormData) {
  const user = await student();
  const email = text(data, "email").toLowerCase();
  const parent = await prisma.user.findUnique({ where: { email } });
  if (!parent) throw new Error("That parent needs an account before an invitation can be sent.");
  const existing = await prisma.userPreference.findUnique({ where: { userId_key: { userId: user.id, key: "learnx.parent-invitations" } } });
  const invitations = Array.isArray(existing?.value) ? existing.value as Prisma.JsonArray : [];
  const invitation = { id: crypto.randomUUID(), parentId: parent.id, email: parent.email, name: parent.name, relation: text(data, "relation") || "Parent", isPrimary: data.get("isPrimary") === "on", status: "PENDING" };
  await prisma.$transaction([
    prisma.userPreference.upsert({ where: { userId_key: { userId: user.id, key: "learnx.parent-invitations" } }, create: { userId: user.id, key: "learnx.parent-invitations", value: [...invitations.filter((item) => typeof item === "object" && item && !Array.isArray(item) && item.parentId !== parent.id), invitation] as Prisma.InputJsonValue }, update: { value: [...invitations.filter((item) => typeof item === "object" && item && !Array.isArray(item) && item.parentId !== parent.id), invitation] as Prisma.InputJsonValue } }),
    prisma.notification.create({ data: { userId: parent.id, title: "LearnX parent invitation", body: `${user.name} invited you to connect as their ${invitation.relation}. Approval is required.`, link: "/student-parent-invitations" } })
  ]);
  refresh();
}

export async function cancelParentInvitationAction(data: FormData) {
  const user = await student();
  const current = await prisma.userPreference.findUnique({ where: { userId_key: { userId: user.id, key: "learnx.parent-invitations" } } });
  const invitations = Array.isArray(current?.value) ? current.value as Array<Record<string, unknown>> : [];
  await preference(user.id, "learnx.parent-invitations", invitations.filter((item) => item.id !== text(data, "id")) as Prisma.InputJsonValue);
  refresh();
}

export async function approveParentInvitationAction(data: FormData) {
  const session = await auth();
  if (!session?.user.id) throw new Error("Sign in to approve this invitation.");
  const studentId = text(data, "studentId");
  const invitationId = text(data, "invitationId");
  const record = await prisma.userPreference.findUnique({ where: { userId_key: { userId: studentId, key: "learnx.parent-invitations" } } });
  const invitations = Array.isArray(record?.value) ? record.value as Array<Record<string, unknown>> : [];
  const invitation = invitations.find((item) => item.id === invitationId && item.parentId === session.user.id);
  if (!invitation) throw new Error("This invitation is unavailable or no longer pending.");
  await prisma.$transaction([
    prisma.parentChildRelation.upsert({ where: { parentId_childId: { parentId: session.user.id, childId: studentId } }, create: { parentId: session.user.id, childId: studentId, relation: String(invitation.relation ?? "Parent"), isPrimary: Boolean(invitation.isPrimary) }, update: { relation: String(invitation.relation ?? "Parent"), isPrimary: Boolean(invitation.isPrimary) } }),
    prisma.userPreference.update({ where: { userId_key: { userId: studentId, key: "learnx.parent-invitations" } }, data: { value: invitations.filter((item) => item.id !== invitationId) as Prisma.InputJsonValue } }),
    prisma.notification.create({ data: { userId: studentId, title: "Parent connection approved", body: `${session.user.name ?? "Your parent"} approved your LearnX connection.`, link: "/student/connections" } })
  ]);
  revalidatePath("/student-parent-invitations");
}

export async function removeParentAction(data: FormData) {
  const user = await student();
  await prisma.parentChildRelation.deleteMany({ where: { id: text(data, "id"), childId: user.id } });
  refresh();
}

export async function requestInstitutionAction(data: FormData) {
  const user = await student();
  const institution = await prisma.institution.findUnique({ where: { id: text(data, "institutionId") }, select: { id: true, name: true } });
  if (!institution) throw new Error("Institution not found.");
  const admins = await prisma.user.findMany({ where: { institutionId: institution.id, roles: { some: { role: { key: { in: ["ADMIN", "DIRECTOR"] } } } } }, select: { id: true } });
  await prisma.$transaction([
    prisma.userPreference.upsert({ where: { userId_key: { userId: user.id, key: "learnx.institution-request" } }, create: { userId: user.id, key: "learnx.institution-request", value: { institutionId: institution.id, institutionName: institution.name, status: "PENDING" } }, update: { value: { institutionId: institution.id, institutionName: institution.name, status: "PENDING" } } }),
    ...admins.map((admin) => prisma.notification.create({ data: { userId: admin.id, institutionId: institution.id, title: "Student join request", body: `${user.name} requested to join ${institution.name}.`, link: "/institution/dashboard" } }))
  ]);
  refresh();
}

export async function cancelInstitutionRequestAction() {
  const user = await student();
  await prisma.userPreference.deleteMany({ where: { userId: user.id, key: "learnx.institution-request" } });
  refresh();
}

export async function saveStudentSettingsAction(data: FormData) {
  const user = await student();
  await preference(user.id, "learnx.settings", {
    appearance: text(data, "appearance"), language: text(data, "language"), privacy: text(data, "privacy"),
    notifications: data.get("notifications") === "on", securityAlerts: data.get("securityAlerts") === "on"
  });
  refresh();
}
