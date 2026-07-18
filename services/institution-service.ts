import { prisma } from "@/lib/db";

export async function getInstitutionSettings(institutionId?: string | null) {
  if (!institutionId) return null;

  return prisma.institution.findUnique({
    where: { id: institutionId }
  });
}

export async function getDefaultInstitution() {
  return prisma.institution.findFirst({
    orderBy: { createdAt: "asc" }
  });
}
