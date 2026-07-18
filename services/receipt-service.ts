import { prisma } from "@/lib/db";

export async function getReceiptsForInstitution(institutionId?: string | null) {
  if (!institutionId) return [];

  return prisma.receipt.findMany({
    where: { institutionId },
    include: { payment: { include: { student: true, method: true } }, invoice: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function createReceipt(input: { institutionId: string; paymentId: string; invoiceId?: string }) {
  const count = await prisma.receipt.count({ where: { institutionId: input.institutionId } });
  return prisma.receipt.create({
    data: {
      institutionId: input.institutionId,
      paymentId: input.paymentId,
      invoiceId: input.invoiceId,
      receiptNumber: `RCT-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`
    }
  });
}
