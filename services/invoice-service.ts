import { prisma } from "@/lib/db";

export async function getInvoicesForInstitution(institutionId?: string | null) {
  if (!institutionId) return [];

  return prisma.invoice.findMany({
    where: { institutionId },
    include: { student: true, items: { include: { studentFee: { include: { student: true, feeHead: true } } } }, receipt: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function createInvoice(input: { institutionId: string; studentId: string; total: string; dueDate?: Date; studentFeeId?: string; description?: string }) {
  const count = await prisma.invoice.count({ where: { institutionId: input.institutionId } });
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

  return prisma.invoice.create({
    data: {
      institutionId: input.institutionId,
      studentId: input.studentId,
      invoiceNumber,
      subtotal: input.total,
      total: input.total,
      dueDate: input.dueDate,
      items: {
        create: {
          studentFeeId: input.studentFeeId,
          description: input.description ?? "Student fee",
          amount: input.total
        }
      }
    },
    include: { items: true }
  });
}
