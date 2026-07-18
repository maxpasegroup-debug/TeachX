"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { userHasPermission } from "@/lib/rbac";

function optionalText(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  return text || undefined;
}

async function getPartnerSession() {
  const session = await auth();
  const institutionId = session?.user.institutionId;
  if (!session?.user || !institutionId) throw new Error("Institution is required.");
  if (!userHasPermission(session.user.roles, "partners.manage")) throw new Error("You do not have partner access.");
  return { session, institutionId };
}

export async function createPartnerAction(_: string | undefined, formData: FormData) {
  const { institutionId } = await getPartnerSession();
  const name = optionalText(formData.get("name"));
  if (!name) return "Partner name is required.";
  const referralCode = (optionalText(formData.get("referralCode")) ?? name.slice(0, 5)).toUpperCase().replaceAll(" ", "");

  await prisma.partner.create({
    data: {
      institutionId,
      name,
      email: optionalText(formData.get("email")),
      phone: optionalText(formData.get("phone")),
      referralCode,
      referralLink: `/guest-portal?ref=${referralCode}`,
      status: "ACTIVE"
    }
  });
  revalidatePath("/partners");
  return "Partner created.";
}

export async function createCommissionAction(_: string | undefined, formData: FormData) {
  await getPartnerSession();
  const partnerId = optionalText(formData.get("partnerId"));
  if (!partnerId) return "Partner is required.";

  await prisma.partnerCommission.create({
    data: {
      partnerId,
      courseId: optionalText(formData.get("courseId")),
      type: (optionalText(formData.get("type")) ?? "FIXED") as never,
      amount: optionalText(formData.get("amount")) ?? "0",
      percentage: optionalText(formData.get("percentage")),
      remarks: optionalText(formData.get("remarks"))
    }
  });
  revalidatePath("/partners");
  return "Commission rule created.";
}
