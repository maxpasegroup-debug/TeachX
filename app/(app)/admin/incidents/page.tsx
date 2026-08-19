import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { IncidentCommandCenter } from "@/features/operations/components/incident-command-center";
import { userHasPermission } from "@/lib/rbac";
import { getOperationsCommandData } from "@/services/operations-service";

export const dynamic = "force-dynamic";

export default async function IncidentCommandPage() {
  const session = await auth();
  if (!session?.user || !userHasPermission(session.user.roles, "settings.manage")) redirect("/access-denied");
  const data = await getOperationsCommandData();
  return <IncidentCommandCenter data={JSON.parse(JSON.stringify(data))} />;
}
