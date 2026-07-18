import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { FinanceBoard } from "@/features/finance/components/finance-board";
import { prisma } from "@/lib/db";
import { getBatchesForInstitution } from "@/services/batch-service";
import { getCoursesForInstitution } from "@/services/course-service";
import { getExpenseOverview } from "@/services/expense-service";
import { getFeeOverview } from "@/services/fee-service";
import { getInvoicesForInstitution } from "@/services/invoice-service";
import { getPaymentOverview } from "@/services/payment-service";
import { getReceiptsForInstitution } from "@/services/receipt-service";

export default async function FinancePage() {
  const session = await auth();
  const institutionId = session?.user.institutionId;

  const [feeOverview, paymentOverview, invoices, receipts, expenseOverview, courses, batches, subjects, students] = await Promise.all([
    getFeeOverview(institutionId),
    getPaymentOverview(institutionId),
    getInvoicesForInstitution(institutionId),
    getReceiptsForInstitution(institutionId),
    getExpenseOverview(institutionId),
    getCoursesForInstitution(institutionId),
    getBatchesForInstitution(institutionId),
    prisma.subject.findMany({ where: { course: { institutionId: institutionId ?? "" } }, orderBy: { order: "asc" } }),
    prisma.user.findMany({ where: { institutionId, roles: { some: { role: { key: "STUDENT" } } } }, orderBy: { name: "asc" } })
  ]);

  return (
    <>
      <PageHeader description="Collect fees, generate receipts, prepare invoices, and track simple expenses without an accounting-software feel." eyebrow="Institution operations" title="Finance" />
      <FinanceBoard batches={batches} courses={courses} expenseOverview={expenseOverview} feeOverview={feeOverview} invoices={invoices} paymentOverview={paymentOverview} receipts={receipts} students={students} subjects={subjects} />
    </>
  );
}
