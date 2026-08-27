"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { requireAcademicReferences } from "@/services/academic-integrity-service";

function optionalText(value: FormDataEntryValue | null) {
  const text = value?.toString().trim();
  return text || undefined;
}

async function getPartnerSession() {
  const user = await requireCurrentUser("partners.manage");
  if (!user.institutionId) throw new Error("Institution is required.");
  return { session: { user }, institutionId: user.institutionId };
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
  const { institutionId } = await getPartnerSession();
  const partnerId = optionalText(formData.get("partnerId"));
  if (!partnerId) return "Partner is required.";
  const courseId = optionalText(formData.get("courseId"));
  const partner = await prisma.partner.findFirst({ where: { id: partnerId, institutionId }, select: { id: true } });
  if (!partner) throw new Error("Partner was not found in your institution.");
  await requireAcademicReferences(institutionId, { courseId });

  await prisma.partnerCommission.create({
    data: {
      partnerId,
      courseId,
      type: (optionalText(formData.get("type")) ?? "FIXED") as never,
      amount: optionalText(formData.get("amount")) ?? "0",
      percentage: optionalText(formData.get("percentage")),
      remarks: optionalText(formData.get("remarks"))
    }
  });
  revalidatePath("/partners");
  return "Commission rule created.";
}
