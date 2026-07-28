import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { InstitutionWorkspacePage } from "@/features/institution-workspace/components/institution-workspace-page";
import { userHasPermission } from "@/lib/rbac";
import { getInstitutionWorkspaceData, institutionModules } from "@/services/institution-workspace-service";

export default async function InstitutionModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  if (!institutionModules.includes(module as (typeof institutionModules)[number])) notFound();
  const session = await auth();
  if (!session?.user.institutionId || (!userHasPermission(session.user.roles, "institution.manage") && !userHasPermission(session.user.roles, "academic.setup.manage"))) notFound();
  const data = await getInstitutionWorkspaceData(session.user.institutionId);
  if (!data) notFound();
  return <InstitutionWorkspacePage data={data} module={module as (typeof institutionModules)[number]} />;
}
