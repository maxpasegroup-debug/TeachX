import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AIPlatformCommandCenter } from "@/features/adminx/components/ai-platform-command-center";
import { getAdminAIPlatformData } from "@/services/admin-ai-platform-service";

export default async function AIPlatformPage() {
  const session = await auth();
  if (!session?.user.roles.includes("ADMIN")) redirect("/dashboard");
  return <AIPlatformCommandCenter data={await getAdminAIPlatformData(session.user.id)} />;
}
