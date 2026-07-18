import type { getDirectorDashboard } from "@/services/director-dashboard-service";
import { Card } from "@/components/ui/card";

type DirectorCommandCenterProps = {
  dashboard: Awaited<ReturnType<typeof getDirectorDashboard>>;
};

export function DirectorCommandCenter({ dashboard }: DirectorCommandCenterProps) {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {dashboard.kpis.map((kpi) => (
          <Card className="p-6" key={kpi.label}>
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <p className="mt-3 text-3xl font-semibold">{kpi.value}</p>
          </Card>
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Recent Collections</h2>
          <div className="mt-5 space-y-3">
            {dashboard.recentPayments.map((payment) => <p className="rounded-lg bg-muted px-4 py-3 text-sm" key={payment.id}>{payment.student.name} - INR {Number(payment.amount).toLocaleString("en-IN")}</p>)}
            {!dashboard.recentPayments.length ? <p className="text-sm text-muted-foreground">No collections yet.</p> : null}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Pending Fees</h2>
          <div className="mt-5 space-y-3">
            {dashboard.pendingFees.map((fee) => <p className="rounded-lg bg-muted px-4 py-3 text-sm" key={fee.id}>{fee.student.name} - INR {Number(fee.amount).toLocaleString("en-IN")}</p>)}
            {!dashboard.pendingFees.length ? <p className="text-sm text-muted-foreground">No pending fees.</p> : null}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Partner Performance</h2>
          <div className="mt-5 space-y-3">
            {dashboard.partnerPerformance.map((partner) => <p className="rounded-lg bg-muted px-4 py-3 text-sm" key={partner.id}>{partner.name} - {partner.referrals.length} referrals</p>)}
            {!dashboard.partnerPerformance.length ? <p className="text-sm text-muted-foreground">No partner data yet.</p> : null}
          </div>
        </Card>
      </section>
      <section className="grid gap-4 md:grid-cols-4">
        {["Receive payment", "Review admissions", "Check exams", "View reports"].map((action) => (
          <Card className="p-5 text-center text-sm font-medium" key={action}>{action}</Card>
        ))}
      </section>
    </div>
  );
}
