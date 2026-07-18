import { prisma } from "@/lib/db";

export async function getReceptionOverview(institutionId?: string | null) {
  if (!institutionId) return { visitors: [], appointments: [] };

  const [visitors, appointments] = await Promise.all([
    prisma.visitor.findMany({ where: { institutionId }, orderBy: { visitedAt: "desc" } }),
    prisma.appointment.findMany({ where: { institutionId }, orderBy: { scheduledAt: "asc" } })
  ]);

  return { visitors, appointments };
}

export async function createVisitor(input: { institutionId: string; name: string; phone?: string; purpose?: string; remarks?: string }) {
  return prisma.visitor.create({ data: input });
}

export async function createAppointment(input: { institutionId: string; visitorName: string; scheduledAt: Date; phone?: string; purpose?: string }) {
  return prisma.appointment.create({ data: input });
}
