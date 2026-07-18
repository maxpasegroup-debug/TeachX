import { prisma } from "@/lib/db";

export async function getApplicationsForInstitution(institutionId?: string | null) {
  if (!institutionId) return [];

  return prisma.application.findMany({
    where: { institutionId },
    include: { lead: true, course: true, batch: true, documents: true, admission: true },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getAdmissionsForInstitution(institutionId?: string | null) {
  if (!institutionId) return [];

  return prisma.admission.findMany({
    where: { institutionId },
    include: { lead: true, application: true, course: true, batch: true, student: true },
    orderBy: { updatedAt: "desc" }
  });
}
