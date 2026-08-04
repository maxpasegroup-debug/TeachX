import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PlatformBrain } from "@/features/adminx/components/platform-brain";
import { resolveNavigationWorkspace } from "@/lib/constants/navigation";
import { getAdminPlatformBrainData } from "@/services/admin-platform-brain-service";

export default async function PlatformBrainPage() {
  const session = await auth();
  if (!session?.user || !session.user.roles.includes("ADMIN") || resolveNavigationWorkspace(session.user.roles) !== "admin") redirect("/dashboard");
  return <PlatformBrain data={await getAdminPlatformBrainData(session.user.id)} />;
}