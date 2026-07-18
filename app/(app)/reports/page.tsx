import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { OperationsReports } from "@/features/reports/components/operations-reports";
import { getOperationsReports } from "@/services/operations-report-service";

export default async function ReportsPage() {
  const session = await auth();
  const reports = await getOperationsReports(session?.user.institutionId);

  return (
    <>
      <PageHeader description="Admissions, collections, outstanding fees, expenses, payroll, staff, growth, batches and faculty workload in one quiet view." eyebrow="Operational reports" title="Reports" />
      <OperationsReports reports={reports} />
    </>
  );
}
