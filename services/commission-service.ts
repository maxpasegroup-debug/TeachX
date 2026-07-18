import { prisma } from "@/lib/db";

export async function getCommissionsForPartner(partnerId: string) {
  return prisma.partnerCommission.findMany({
    where: { partnerId },
    include: { course: true, campaign: true, settlement: true },
    orderBy: { createdAt: "desc" }
  });
}
