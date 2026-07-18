import { prisma } from "@/lib/db";

export async function getPaymentOverview(institutionId?: string | null) {
  if (!institutionId) return { methods: [], payments: [] };

  const [methods, payments] = await Promise.all([
    prisma.paymentMethod.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.payment.findMany({
      where: { institutionId },
      include: { student: true, studentFee: { include: { feeHead: true } }, method: true, receipt: true },
      orderBy: { paidAt: "desc" }
    })
  ]);

  return { methods, payments };
}

export async function receivePayment(input: {
  institutionId: string;
  studentId: string;
  amount: string;
  studentFeeId?: string;
  methodId?: string;
  reference?: string;
}) {
  return prisma.payment.create({
    data: {
      institutionId: input.institutionId,
      studentId: input.studentId,
      studentFeeId: input.studentFeeId,
      methodId: input.methodId,
      amount: input.amount,
      reference: input.reference
    }
  });
}
