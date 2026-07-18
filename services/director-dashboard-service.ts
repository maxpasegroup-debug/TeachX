import { prisma } from "@/lib/db";

export async function getDirectorDashboard(institutionId?: string | null) {
  if (!institutionId) {
    return {
      kpis: [],
      recentPayments: [],
      pendingFees: [],
      partnerPerformance: []
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const [admissionsToday, collectionsToday, pendingFees, students, teachers, activeBatches, runningClasses, todaysExams, leadCount, partners, payments] = await Promise.all([
    prisma.admission.count({ where: { institutionId, createdAt: { gte: today, lt: tomorrow } } }),
    prisma.payment.findMany({ where: { institutionId, paidAt: { gte: today, lt: tomorrow }, status: "COMPLETED" } }),
    prisma.studentFee.findMany({ where: { institutionId, status: { in: ["PENDING", "PARTIAL"] } }, include: { student: true, feeHead: true }, take: 6, orderBy: { dueDate: "asc" } }),
    prisma.user.count({ where: { institutionId, roles: { some: { role: { key: "STUDENT" } } } } }),
    prisma.user.count({ where: { institutionId, roles: { some: { role: { key: { in: ["ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"] } } } } } }),
    prisma.batch.count({ where: { course: { institutionId }, status: "RUNNING" } }),
    prisma.timetableEntry.count({ where: { course: { institutionId } } }),
    prisma.exam.count({ where: { institutionId, startsAt: { gte: today, lt: tomorrow } } }),
    prisma.lead.count({ where: { institutionId } }),
    prisma.partner.findMany({ where: { institutionId }, include: { referrals: { include: { lead: true } }, commissions: true }, take: 5 }),
    prisma.payment.findMany({ where: { institutionId, status: "COMPLETED" }, include: { student: true, method: true }, take: 6, orderBy: { paidAt: "desc" } })
  ]);

  const revenue = payments.reduce((total, payment) => total + Number(payment.amount), 0);
  const todayCollection = collectionsToday.reduce((total, payment) => total + Number(payment.amount), 0);
  const outstanding = pendingFees.reduce((total, fee) => total + Number(fee.amount) + Number(fee.fine) - Number(fee.discount) - Number(fee.waiver), 0);

  return {
    kpis: [
      { label: "Today's Admissions", value: admissionsToday.toString() },
      { label: "Today's Collections", value: `INR ${todayCollection.toLocaleString("en-IN")}` },
      { label: "Pending Fees", value: pendingFees.length.toString() },
      { label: "Students", value: students.toString() },
      { label: "Teachers", value: teachers.toString() },
      { label: "Active Batches", value: activeBatches.toString() },
      { label: "Running Classes", value: runningClasses.toString() },
      { label: "Today's Exams", value: todaysExams.toString() },
      { label: "Lead Conversion", value: leadCount ? `${Math.round((admissionsToday / leadCount) * 100)}%` : "0%" },
      { label: "Revenue", value: `INR ${revenue.toLocaleString("en-IN")}` },
      { label: "Outstanding", value: `INR ${outstanding.toLocaleString("en-IN")}` }
    ],
    recentPayments: payments,
    pendingFees,
    partnerPerformance: partners
  };
}
