"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function markCloudNotificationReadAction(formData: FormData) {
  const session = await auth();
  const id = String(formData.get("id") ?? "");
  if (!session?.user.id || !id) return;
  await prisma.notification.updateMany({ where: { id, OR: [{ userId: session.user.id }, { institutionId: session.user.institutionId ?? undefined, userId: null }] }, data: { status: "READ", readAt: new Date() } });
  revalidatePath("/cloud");
}

export async function saveCloudPreferencesAction(formData: FormData) {
  const session = await auth();
  if (!session?.user.id) return;
  const value = { theme: String(formData.get("theme") ?? "system"), language: String(formData.get("language") ?? "English"), privacy: String(formData.get("privacy") ?? "institution") };
  await prisma.userPreference.upsert({ where: { userId_key: { userId: session.user.id, key: "edux.cloud.settings" } }, create: { userId: session.user.id, key: "edux.cloud.settings", value }, update: { value } });
  revalidatePath("/cloud");
}
