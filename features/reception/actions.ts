"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { userHasPermission } from "@/lib/rbac";
import { createAppointment, createVisitor } from "@/services/reception-service";

function text(value: FormDataEntryValue | null) {
  const data = value?.toString().trim();
  return data || undefined;
}

async function getReceptionSession() {
  const session = await auth();
  const institutionId = session?.user.institutionId;
  if (!session?.user || !institutionId) throw new Error("Institution is required.");
  if (!userHasPermission(session.user.roles, "reception.manage")) throw new Error("You do not have reception access.");
  return { institutionId };
}

export async function createVisitorAction(_: string | undefined, formData: FormData) {
  const { institutionId } = await getReceptionSession();
  const name = text(formData.get("name"));
  if (!name) return "Visitor name is required.";

  await createVisitor({ institutionId, name, phone: text(formData.get("phone")), purpose: text(formData.get("purpose")), remarks: text(formData.get("remarks")) });
  revalidatePath("/reception");
  return "Visitor added.";
}

export async function createAppointmentAction(_: string | undefined, formData: FormData) {
  const { institutionId } = await getReceptionSession();
  const visitorName = text(formData.get("visitorName"));
  const scheduledAt = text(formData.get("scheduledAt"));
  if (!visitorName || !scheduledAt) return "Name and time are required.";

  await createAppointment({ institutionId, visitorName, scheduledAt: new Date(scheduledAt), phone: text(formData.get("phone")), purpose: text(formData.get("purpose")) });
  revalidatePath("/reception");
  return "Appointment scheduled.";
}
