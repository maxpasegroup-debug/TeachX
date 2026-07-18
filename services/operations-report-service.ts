import { prisma } from "@/lib/db";

export async function getOperationsReports(institutionId?: string | null) {
  if (!institutionId) return [];

  const [admissions, collections, outstandingFees, expenses, payroll, staff, students, batches, faculty] = await Promise.all([
    prisma.admission.count({ where: { institutionId } }),
    prisma.payment.findMany({ where: { institutionId, status: "COMPLETED" } }),
    prisma.studentFee.findMany({ where: { institutionId, status: { in: ["PENDING", "PARTIAL"] } } }),
    prisma.expense.findMany({ where: { institutionId } }),
    prisma.payroll.count({ where: { institutionId } }),
    prisma.staffProfile.count({ where: { user: { institutionId } } }),
    prisma.user.count({ where: { institutionId, roles: { some: { role: { key: "STUDENT" } } } } }),
    prisma.batch.count({ where: { course: { institutionId } } }),
    prisma.user.count({ where: { institutionId, roles: { some: { role: { key: { in: ["ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"] } } } } } })
  ]);

  return [
    { label: "Admissions", value: admissions.toString(), description: "Approved and pending admissions from the CRM." },
    { label: "Collections", value: money(collections.reduce((total, payment) => total + Number(payment.amount), 0)), description: "Completed student payments." },
    { label: "Outstanding Fees", value: money(outstandingFees.reduce((total, fee) => total + Number(fee.amount), 0)), description: "Pending and partial student fees." },
    { label: "Expenses", value: money(expenses.reduce((total, expense) => total + Number(expense.amount), 0)), description: "Approved, pending and paid operational expenses." },
    { label: "Payroll", value: payroll.toString(), description: "Payroll drafts and history foundation." },
    { label: "Staff", value: staff.toString(), description: "Employee directory profiles." },
    { label: "Student Growth", value: students.toString(), description: "Current student base." },
    { label: "Batch Utilization", value: batches.toString(), description: "Configured academic batches." },
    { label: "Faculty Workload", value: faculty.toString(), description: "Teaching staff available for workload reports." }
  ];
}

export async function searchOperations(institutionId: string, query: string) {
  const contains = { contains: query, mode: "insensitive" as const };
  const [students, receipts, invoices, expenses, employees] = await Promise.all([
    prisma.user.findMany({ where: { institutionId, name: contains, roles: { some: { role: { key: "STUDENT" } } } }, take: 8 }),
    prisma.receipt.findMany({ where: { institutionId, receiptNumber: contains }, include: { payment: { include: { student: true } } }, take: 8 }),
    prisma.invoice.findMany({ where: { institutionId, invoiceNumber: contains }, include: { student: true }, take: 8 }),
    prisma.expense.findMany({ where: { institutionId, title: contains }, take: 8 }),
    prisma.staffProfile.findMany({ where: { user: { institutionId, name: contains } }, include: { user: true }, take: 8 })
  ]);

  return { students, receipts, invoices, expenses, employees };
}

function money(value: number) {
  return `INR ${value.toLocaleString("en-IN")}`;
}
