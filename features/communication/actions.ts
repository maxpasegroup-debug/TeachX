"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { userHasPermission } from "@/lib/rbac";
import { createCommunication } from "@/services/communication-service";

function text(value: FormDataEntryValue | null) {
  const data = value?.toString().trim();
  return data || undefined;
}

export async function createCommunicationAction(_: string | undefined, formData: FormData) {
  const session = await auth();
  const institutionId = session?.user.institutionId;
  if (!session?.user || !institutionId) return "Institution is required.";
  if (!userHasPermission(session.user.roles, "operations.view") && !userHasPermission(session.user.roles, "classrooms.manage")) return "You do not have communication access.";
  const title = text(formData.get("title"));
  const body = text(formData.get("body"));
  if (!title || !body) return "Title and message are required.";

  await createCommunication({
    institutionId,
    createdById: session.user.id,
    kind: (text(formData.get("kind")) ?? "ANNOUNCEMENT") as never,
    title,
    body,
    priority: (text(formData.get("priority")) ?? "NORMAL") as never,
    channels: ["IN_APP"],
    roleKey: text(formData.get("roleKey")),
    courseId: text(formData.get("courseId")),
    batchId: text(formData.get("batchId")),
    scheduledAt: text(formData.get("scheduledAt")) ? new Date(text(formData.get("scheduledAt")) as string) : undefined,
    expiresAt: text(formData.get("expiresAt")) ? new Date(text(formData.get("expiresAt")) as string) : undefined,
    attachmentUrl: text(formData.get("attachmentUrl"))
  });
  revalidatePath("/communication");
  revalidatePath("/dashboard");
  return "Message prepared.";
}
