"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";

export async function markCloudNotificationReadAction(formData: FormData) {
  const user = await getCurrentUser();
  const id = String(formData.get("id") ?? "");
  if (!user?.id || !id) return;
  await prisma.notification.updateMany({ where: { id, OR: [{ userId: user.id }, ...(user.institutionId ? [{ institutionId: user.institutionId, userId: null }] : [])] }, data: { status: "READ", readAt: new Date() } });
  revalidatePath("/cloud");
}

export async function saveCloudPreferencesAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user?.id) return;
  const value = { theme: String(formData.get("theme") ?? "system"), language: String(formData.get("language") ?? "English"), privacy: String(formData.get("privacy") ?? "institution") };
  await prisma.userPreference.upsert({ where: { userId_key: { userId: user.id, key: "edux.cloud.settings" } }, create: { userId: user.id, key: "edux.cloud.settings", value }, update: { value } });
  revalidatePath("/cloud");
}
