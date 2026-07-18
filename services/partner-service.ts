import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export type PartnerWithDetails = Prisma.PartnerGetPayload<{
  include: {
    referrals: { include: { lead: true; campaign: true } };
    commissions: true;
    settlements: true;
  };
}>;

export async function getPartnersForInstitution(institutionId?: string | null) {
  if (!institutionId) return [];

  return prisma.partner.findMany({
    where: { institutionId },
    include: {
      referrals: { include: { lead: true, campaign: true }, orderBy: { createdAt: "desc" } },
      commissions: { orderBy: { createdAt: "desc" } },
      settlements: { orderBy: { createdAt: "desc" } }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getPartnerDashboard(institutionId?: string | null) {
  const partners = await getPartnersForInstitution(institutionId);
  return {
    partners,
    studentsReferred: partners.reduce((count, partner) => count + partner.referrals.length, 0),
    admissions: partners.reduce((count, partner) => count + partner.referrals.filter((referral) => referral.lead?.stage === "ENROLLED" || referral.lead?.stage === "STUDENT_CREATED").length, 0),
    pendingCommission: partners.reduce((total, partner) => total + partner.commissions.filter((commission) => commission.status === "PENDING").length, 0),
    paidCommission: partners.reduce((total, partner) => total + partner.commissions.filter((commission) => commission.status === "PAID").length, 0)
  };
}
