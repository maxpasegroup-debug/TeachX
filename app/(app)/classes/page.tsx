import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { PlannerBoard } from "@/features/planner/components/planner-board";
import { getPlannerData } from "@/services/planner-service";

export default async function ClassesPage() {
  const session = await auth();
  const planner = await getPlannerData(session?.user.institutionId);

  return (
    <>
      <PageHeader description="Build the default timetable and manage today's changes without affecting future days." eyebrow="Academic planner" title="Planner" />
      <PlannerBoard {...planner} />
    </>
  );
}
