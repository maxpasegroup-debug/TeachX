import { prisma } from "@/lib/db";

export async function getPayrollOverview(institutionId?: string | null) {
  if (!institutionId) return { payrolls: [], salaries: [] };

  const [payrolls, salaries] = await Promise.all([
    prisma.payroll.findMany({ where: { institutionId }, include: { payslips: true }, orderBy: [{ year: "desc" }, { month: "desc" }] }),
    prisma.employeeSalary.findMany({ where: { staff: { user: { institutionId } } }, include: { staff: { include: { user: true } } }, orderBy: { effectiveFrom: "desc" } })
  ]);

  return { payrolls, salaries };
}

export async function createPayroll(input: { institutionId: string; name: string; month: number; year: number }) {
  return prisma.payroll.create({ data: input });
}
