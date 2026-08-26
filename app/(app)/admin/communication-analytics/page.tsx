import { AdminCommunityManagement } from "@/features/community/components/community-os";
import { getCommunityOS } from "@/services/community-service";

export default async function AdminCommunicationAnalyticsPage() {
  const data = await getCommunityOS();

  return <AdminCommunityManagement data={data} section="communication-analytics" />;
}
