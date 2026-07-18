import { prisma } from "@/lib/db";

export async function getFeeOverview(institutionId?: string | null) {
  if (!institutionId) {
    return {
      feeHeads: [],
      feePlans: [],
      studentFees: [],
      totals: { expected: 0, collected: 0, outstanding: 0 }
    };
  }

  const [feeHeads, feePlans, studentFees, payments] = await Promise.all([
    prisma.feeHead.findMany({ where: { institutionId }, orderBy: { createdAt: "desc" } }),
    prisma.feePlan.findMany({
      where: { institutionId },
      include: { course: true, batch: true, subject: true, installments: { include: { feeHead: true }, orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.studentFee.findMany({
      where: { institutionId },
      include: { student: true, course: true, batch: true, feeHead: true, installment: true, payments: true },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }]
    }),
    prisma.payment.findMany({ where: { institutionId, status: "COMPLETED" } })
  ]);

  const expected = studentFees.reduce((total, fee) => total + Number(fee.amount) + Number(fee.fine) - Number(fee.discount) - Number(fee.scholarship) - Number(fee.waiver), 0);
  const collected = payments.reduce((total, payment) => total + Number(payment.amount), 0);

  return {
    feeHeads,
    feePlans,
    studentFees,
    totals: {
      expected,
      collected,
      outstanding: Math.max(expected - collected, 0)
    }
  };
}

export async function createFeeHead(input: { institutionId: string; name: string; type: "ADMISSION" | "COURSE" | "REGISTRATION" | "EXAM" | "MATERIAL" | "HOSTEL" | "TRANSPORT" | "CUSTOM"; description?: string }) {
  return prisma.feeHead.create({ data: input });
}

export async function createFeePlan(input: {
  institutionId: string;
  name: string;
  totalAmount: string;
  courseId?: string;
  batchId?: string;
  subjectId?: string;
  discount?: string;
  scholarship?: string;
}) {
  return prisma.feePlan.create({
    data: {
      institutionId: input.institutionId,
      name: input.name,
      totalAmount: input.totalAmount,
      courseId: input.courseId,
      batchId: input.batchId,
      subjectId: input.subjectId,
      discount: input.discount ?? "0",
      scholarship: input.scholarship ?? "0"
    }
  });
}

export async function assignStudentFee(input: {
  institutionId: string;
  studentId: string;
  amount: string;
  courseId?: string;
  batchId?: string;
  subjectId?: string;
  feePlanId?: string;
  feeHeadId?: string;
  installmentId?: string;
  dueDate?: Date;
}) {
  return prisma.studentFee.create({ data: input });
}
