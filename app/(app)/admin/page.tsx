import { auth } from "@/auth";
import { AdminGrowthDashboard } from "@/features/admin-growth/components/admin-growth-dashboard";
import { getAdminGrowthOS } from "@/services/admin-growth-service";

export default async function AdminOverviewPage() {
  const session = await auth();
  const data = await getAdminGrowthOS(session?.user.institutionId);

  return <AdminGrowthDashboard data={data} />;
}
