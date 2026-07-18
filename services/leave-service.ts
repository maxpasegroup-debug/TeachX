import { prisma } from "@/lib/db";

export async function getLeaveOverview(institutionId?: string | null) {
  if (!institutionId) return { applications: [], balances: [] };

  const [applications, balances] = await Promise.all([
    prisma.leaveApplication.findMany({ where: { applicant: { institutionId } }, include: { applicant: true, approver: true }, orderBy: { createdAt: "desc" } }),
    prisma.leaveBalance.findMany({ where: { staff: { user: { institutionId } } }, include: { staff: { include: { user: true } } }, orderBy: { leaveType: "asc" } })
  ]);

  return { applications, balances };
}

export async function createLeaveApplication(input: { applicantId: string; fromDate: Date; toDate: Date; reason?: string }) {
  return prisma.leaveApplication.create({ data: input });
}
