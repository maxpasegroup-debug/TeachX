import { Card } from "@/components/ui/card";
import type { getParentPortal } from "@/services/parent-portal-service";

type ParentPortalProps = {
  portal: Awaited<ReturnType<typeof getParentPortal>>;
};

export function ParentPortal({ portal }: ParentPortalProps) {
  const learning = portal.learning;
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <Kpi label="Children" value={portal.children.length.toString()} />
        <Kpi label="Today's Classes" value={(learning?.todaysClasses.length ?? 0).toString()} />
        <Kpi label="Assignments" value={(learning?.pendingAssignments.length ?? 0).toString()} />
        <Kpi label="Fees" value={portal.fees.filter((fee) => fee.status !== "PAID").length.toString()} />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Child Overview" items={portal.selectedChild ? [portal.selectedChild.name, portal.selectedChild.email] : []} />
        <Panel title="Attendance" items={learning?.classrooms.flatMap((classroom) => classroom.attendanceSessions.slice(0, 4).map((session) => `${classroom.batch.name} - ${session.records[0]?.status ?? "Not marked"}`)) ?? []} />
        <Panel title="Homework and Assignments" items={learning?.pendingAssignments.map((assignment) => assignment.title) ?? []} />
        <Panel title="Upcoming Exams" items={portal.exams.map((exam) => exam.name)} />
        <Panel title="Exam Results" items={portal.results.map((result) => `${result.exam.name} - ${String(result.percentage)}%`)} />
        <Panel title="Fee Status" items={portal.fees.map((fee) => `${fee.feeHead?.name ?? "Fee"} - ${fee.status} - INR ${Number(fee.amount).toLocaleString("en-IN")}`)} />
        <Panel title="Announcements" items={learning?.announcements.map((announcement) => announcement.title) ?? []} />
        <Panel title="Communication" items={portal.communications.map((item) => item.communication.title)} />
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return <Card className="p-6"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-semibold">{value}</p></Card>;
}

function Panel({ title, items }: { title: string; items: string[] }) {
  return <Card className="p-6"><h2 className="text-xl font-semibold">{title}</h2><div className="mt-5 space-y-3">{items.length ? items.slice(0, 6).map((item) => <p className="rounded-lg bg-muted px-4 py-3 text-sm" key={item}>{item}</p>) : <p className="rounded-lg bg-muted px-4 py-8 text-center text-sm text-muted-foreground">Nothing to show.</p>}</div></Card>;
}
