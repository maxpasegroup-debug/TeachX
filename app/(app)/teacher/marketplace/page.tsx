import { auth } from "@/auth";
import { TeacherMarketplaceEditor } from "@/features/marketplace/components/marketplace-components";
import { getTeacherMarketplaceDashboard } from "@/services/marketplace-service";

export default async function TeacherMarketplacePage() {
  const session = await auth();
  const data = await getTeacherMarketplaceDashboard(session?.user.id);

  return <TeacherMarketplaceEditor data={data} />;
}
