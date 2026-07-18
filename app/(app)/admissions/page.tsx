import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { AdmissionsCrm } from "@/features/admissions/components/admissions-crm";
import { getBatchesForInstitution } from "@/services/batch-service";
import { getCampaignSetup } from "@/services/campaign-service";
import { getCoursesForInstitution } from "@/services/course-service";
import { getLeadDashboard } from "@/services/lead-service";

export default async function AdmissionsPage() {
  const session = await auth();
  const [dashboard, courses, batches, setup] = await Promise.all([
    getLeadDashboard(session?.user.institutionId),
    getCoursesForInstitution(session?.user.institutionId),
    getBatchesForInstitution(session?.user.institutionId),
    getCampaignSetup(session?.user.institutionId)
  ]);

  return (
    <>
      <PageHeader description="Admissions begin as leads and move through a clear journey from enquiry to student." eyebrow="Admissions CRM" title="Admissions" />
      <AdmissionsCrm batches={batches} campaigns={setup.campaigns} courses={courses} dashboard={dashboard} sources={setup.sources} />
    </>
  );
}
