import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { sentenceCase } from "@/lib/format";
import { getPlannerData } from "@/services/planner-service";

export default async function PlannerPrintPage() {
  const session = await auth();
  const planner = await getPlannerData(session?.user.institutionId);

  return (
    <>
      <PageHeader description="A quiet print-ready view of the default weekly planner." eyebrow="Planner export" title="Print view" />
      <Card className="p-6">
        <div className="space-y-3">
          {planner.entries.length ? (
            planner.entries.map((entry) => (
              <div className="grid gap-3 border-b border-border py-3 text-sm md:grid-cols-[0.8fr_0.8fr_1fr_1fr_1fr]" key={entry.id}>
                <p className="font-medium">{sentenceCase(entry.day)}</p>
                <p>{entry.timeSlot.name}</p>
                <p>{entry.batch.name}</p>
                <p>{entry.subject?.name ?? "Subject not set"}</p>
                <p>{entry.faculty?.name ?? "Faculty not set"} · {entry.room?.name ?? "Room not set"}</p>
              </div>
            ))
          ) : (
            <p className="py-10 text-center text-muted-foreground">No timetable entries yet.</p>
          )}
        </div>
      </Card>
    </>
  );
}
