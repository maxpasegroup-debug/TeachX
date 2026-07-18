"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { archiveNotification, markNotificationRead } from "@/services/notification-service";

export async function markNotificationReadAction(formData: FormData) {
  const session = await auth();
  const notificationId = String(formData.get("notificationId") ?? "");
  if (!session?.user.id || !notificationId) return;

  await markNotificationRead(session.user.id, notificationId);
  revalidatePath("/");
}

export async function archiveNotificationAction(formData: FormData) {
  const session = await auth();
  const notificationId = String(formData.get("notificationId") ?? "");
  if (!session?.user.id || !notificationId) return;

  await archiveNotification(session.user.id, notificationId);
  revalidatePath("/");
}
