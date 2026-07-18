import { auth } from "@/auth";
import { AdminCommerceDashboard } from "@/features/commerce/components/commerce-components";
import { getAdminCommerceDashboard } from "@/services/commerce-service";

export default async function AdminOrdersPage() {
  const session = await auth();
  const data = await getAdminCommerceDashboard(session?.user.institutionId);

  return <AdminCommerceDashboard data={data} section="orders" />;
}
