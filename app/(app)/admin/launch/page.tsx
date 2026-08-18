import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LaunchReadinessPage } from "@/features/launch-intelligence/components/launch-readiness-page";
import { userHasPermission } from "@/lib/rbac";
import { getLaunchReadiness } from "@/services/launch-readiness-service";

export default async function AdminLaunchPage() {
  const session = await auth();
  if (!session?.user || (!session.user.roles.includes("ADMIN") && !userHasPermission(session.user.roles, "settings.manage"))) redirect("/access-denied");

  return <LaunchReadinessPage data={await getLaunchReadiness(session.user.institutionId)} />;
}
