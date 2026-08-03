import { auth } from "@/auth";
import { TenantOperatingSystem } from "@/features/adminx/components/tenant-operating-system";
import { getAdminTenantOperatingSystem } from "@/services/admin-tenant-service";

export default async function AdminTenantOperatingSystemPage() {
  const session = await auth();
  if (!session?.user.roles.includes("ADMIN")) return null;
  return <TenantOperatingSystem data={await getAdminTenantOperatingSystem(session.user.id)} />;
}
