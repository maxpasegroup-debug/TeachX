"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { userHasPermission } from "@/lib/rbac";
import { createLeaveApplication } from "@/services/leave-service";
import { createPayroll } from "@/services/payroll-service";

function text(value: FormDataEntryValue | null) {
  const data = value?.toString().trim();
  return data || undefined;
}

async function getStaffSession(permission: "staff.manage" | "leave.manage") {
  const session = await auth();
  const institutionId = session?.user.institutionId;
  if (!session?.user || !institutionId) throw new Error("Institution is required.");
  if (!userHasPermission(session.user.roles, permission)) throw new Error("You do not have staff access.");
  return { session, institutionId };
}

export async function createStaffProfileAction(_: string | undefined, formData: FormData) {
  await getStaffSession("staff.manage");
  const userId = text(formData.get("userId"));
  if (!userId) return "Select a staff user.";

  await prisma.staffProfile.upsert({
    where: { userId },
    update: {
      department: text(formData.get("department")),
      designation: text(formData.get("designation"))
    },
    create: {
      userId,
      department: text(formData.get("department")),
      designation: text(formData.get("designation")),
      joiningDate: text(formData.get("joiningDate")) ? new Date(text(formData.get("joiningDate")) as string) : undefined
    }
  });
  revalidatePath("/staff");
  return "Staff profile saved.";
}

export async function createPayrollAction(_: string | undefined, formData: FormData) {
  const { institutionId } = await getStaffSession("staff.manage");
  const name = text(formData.get("name"));
  const month = Number(text(formData.get("month")));
  const year = Number(text(formData.get("year")));
  if (!name || !month || !year) return "Enter payroll month and year.";

  await createPayroll({ institutionId, name, month, year });
  revalidatePath("/staff");
  return "Payroll draft created.";
}

export async function applyLeaveAction(_: string | undefined, formData: FormData) {
  const { session } = await getStaffSession("leave.manage");
  const fromDate = text(formData.get("fromDate"));
  const toDate = text(formData.get("toDate"));
  if (!fromDate || !toDate) return "Select leave dates.";

  await createLeaveApplication({ applicantId: session.user.id, fromDate: new Date(fromDate), toDate: new Date(toDate), reason: text(formData.get("reason")) });
  revalidatePath("/staff");
  return "Leave application submitted.";
}
