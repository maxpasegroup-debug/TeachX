import { Card } from "@/components/ui/card";
import type { getOperationsReports } from "@/services/operations-report-service";

type OperationsReportsProps = {
  reports: Awaited<ReturnType<typeof getOperationsReports>>;
};

export function OperationsReports({ reports }: OperationsReportsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {reports.map((report) => (
        <Card className="p-6" key={report.label}>
          <p className="text-sm text-muted-foreground">{report.label}</p>
          <p className="mt-3 text-3xl font-semibold">{report.value}</p>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{report.description}</p>
        </Card>
      ))}
    </section>
  );
}
