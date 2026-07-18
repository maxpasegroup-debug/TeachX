import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { PartnerBoard } from "@/features/partners/components/partner-board";
import { getCoursesForInstitution } from "@/services/course-service";
import { getPartnerDashboard } from "@/services/partner-service";

export default async function PartnersPage() {
  const session = await auth();
  const [dashboard, courses] = await Promise.all([
    getPartnerDashboard(session?.user.institutionId),
    getCoursesForInstitution(session?.user.institutionId)
  ]);

  return (
    <>
      <PageHeader description="Manage referral partners, admissions, commissions, settlements, and performance." eyebrow="B2B admissions" title="Partners" />
      <PartnerBoard courses={courses} dashboard={dashboard} />
    </>
  );
}
