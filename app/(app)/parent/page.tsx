import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { ParentPortal } from "@/features/parent/components/parent-portal";
import { getParentPortal } from "@/services/parent-portal-service";

export default async function ParentPage() {
  const session = await auth();
  const portal = await getParentPortal(session?.user.id, session?.user.institutionId);

  return (
    <>
      <PageHeader description="Read-only child overview, attendance, assignments, fees, exams, announcements and communication." eyebrow="Parent workspace" title="Parent Portal" />
      <ParentPortal portal={portal} />
    </>
  );
}
