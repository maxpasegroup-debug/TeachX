import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { ContentStudio } from "@/features/content/components/content-studio";
import type { RoleKey } from "@/lib/constants/roles";
import { getContentAnalytics } from "@/services/content-analytics-service";
import { getContentStudioOverview } from "@/services/content-service";
import { getApprovalQueues } from "@/services/review-service";
import { getStorageDashboard } from "@/services/storage-service";

export default async function ContentStudioPage() {
  const session = await auth();
  const roles = session?.user.roles ?? [];
  const readOnly = roles.includes("STUDENT" as RoleKey);
  const [overview, queues, analytics, storage] = await Promise.all([
    getContentStudioOverview(session?.user.institutionId, session?.user.id, readOnly),
    getApprovalQueues(session?.user.institutionId),
    getContentAnalytics(session?.user.institutionId),
    getStorageDashboard(session?.user.institutionId)
  ]);

  return (
    <>
      <PageHeader
        description="Prepare lessons, manage videos and materials, review content, publish to students, and understand engagement."
        eyebrow="Academic content"
        title="Content Studio"
      />
      <ContentStudio analytics={analytics} overview={overview} queues={queues} readOnly={readOnly} storage={storage} />
    </>
  );
}
