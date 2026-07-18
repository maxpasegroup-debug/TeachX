import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { AcademicSetupBoard } from "@/features/academic/components/academic-setup-board";
import { getAcademicSetup } from "@/services/academic-setup-service";

export default async function OperationsPage() {
  const session = await auth();
  const setup = await getAcademicSetup(session?.user.institutionId);

  return (
    <>
      <PageHeader
        description="Set up the academic structure that courses, batches, planner, attendance, exams, and reports will use."
        eyebrow="Academic foundation"
        title="Operations"
      />
      <AcademicSetupBoard {...setup} />
    </>
  );
}
