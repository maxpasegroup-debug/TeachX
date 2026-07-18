import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { DirectorCommandCenter } from "@/features/director/components/director-command-center";
import { getDirectorDashboard } from "@/services/director-dashboard-service";

export default async function DirectorPage() {
  const session = await auth();
  const dashboard = await getDirectorDashboard(session?.user.institutionId);

  return (
    <>
      <PageHeader description="A quiet CEO dashboard for admissions, collections, students, teachers, exams, revenue and outstanding work." eyebrow="Command center" title="Director" />
      <DirectorCommandCenter dashboard={dashboard} />
    </>
  );
}
