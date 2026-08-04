"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

async function studentId() {
  const session = await auth();
  if (!session?.user.id || !session.user.roles.includes("STUDENT")) throw new Error("Student access is required.");
  return session.user.id;
}

async function save(userId: string, key: string, value: Prisma.InputJsonValue) {
  await prisma.userPreference.upsert({ where: { userId_key: { userId, key } }, create: { userId, key, value }, update: { value } });
  revalidatePath("/student");
}

function dailyMissionPreferenceKey() {
  return `learnx.daily-mission.${new Date().toISOString().slice(0, 10)}`;
}

export async function saveDashboardWidgetsAction(data: FormData) {
  await save(await studentId(), "learnx.dashboard", data.getAll("widgets").map(String).filter(Boolean));
}

export async function toggleDailyMissionItemAction(data: FormData) {
  const userId = await studentId();
  const id = String(data.get("id") ?? "");
  if (!id) return;
  const current = await prisma.userPreference.findUnique({ where: { userId_key: { userId, key: dailyMissionPreferenceKey() } } });
  const completed = Array.isArray(current?.value) ? current.value.filter((item): item is string => typeof item === "string") : [];
  await save(userId, dailyMissionPreferenceKey(), completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id]);
}
