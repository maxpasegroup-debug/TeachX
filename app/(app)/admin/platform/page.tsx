import { auth } from "@/auth";
import { PlatformCommandCenter } from "@/features/adminx/components/platform-command-center";
import { getPlatformAdminData } from "@/services/platform-admin-service";

export default async function AdminPlatformCommandCenterPage() {
  const session = await auth();
  if (!session?.user.roles.includes("ADMIN")) return null;
  return <PlatformCommandCenter data={await getPlatformAdminData()} />;
}
