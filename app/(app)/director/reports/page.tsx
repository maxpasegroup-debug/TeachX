import { auth } from "@/auth";
import { userHasPermission } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { getDirectorReportingIntelligence } from "@/services/director-reporting-service";
import { DirectorReportCenter } from "./workspace";

export default async function DirectorReportsPage() {
  const session = await auth();
  if (!session?.user || !userHasPermission(session.user.roles, "director.view")) redirect("/access-denied");
  return <DirectorReportCenter data={await getDirectorReportingIntelligence({ institutionId: session.user.institutionId })} />;
}
