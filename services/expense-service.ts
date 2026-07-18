import { prisma } from "@/lib/db";

export async function getExpenseOverview(institutionId?: string | null) {
  if (!institutionId) return { categories: [], expenses: [] };

  const [categories, expenses] = await Promise.all([
    prisma.expenseCategory.findMany({ where: { institutionId }, orderBy: { name: "asc" } }),
    prisma.expense.findMany({ where: { institutionId }, include: { category: true }, orderBy: { spentAt: "desc" } })
  ]);

  return { categories, expenses };
}

export async function createExpense(input: { institutionId: string; title: string; amount: string; categoryId?: string; remarks?: string }) {
  return prisma.expense.create({ data: input });
}
