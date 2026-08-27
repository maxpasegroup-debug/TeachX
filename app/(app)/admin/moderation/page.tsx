import { AdminCommunityManagement } from "@/features/community/components/community-os";
import { getCommunityOS } from "@/services/community-service";

export default async function AdminModerationPage() {
  const data = await getCommunityOS();

  return <AdminCommunityManagement data={data} section="moderation" />;
}
