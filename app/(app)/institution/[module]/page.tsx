import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { InstitutionWorkspacePage } from "@/features/institution-workspace/components/institution-workspace-page";
import { userHasPermission } from "@/lib/rbac";
import { getInstitutionWorkspaceData, institutionModules } from "@/services/institution-workspace-service";

export default async function InstitutionModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  if (!institutionModules.includes(module as (typeof institutionModules)[number])) notFound();
  const user = await getCurrentUser();
  if (!user?.institutionId || (!userHasPermission(user.roles, "institution.manage") && !userHasPermission(user.roles, "academic.setup.manage"))) notFound();
  const data = await getInstitutionWorkspaceData(user.institutionId);
  if (!data) notFound();
  return <InstitutionWorkspacePage data={data} module={module as (typeof institutionModules)[number]} />;
}
