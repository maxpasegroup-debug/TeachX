import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { TeacherWorkspacePage } from "@/features/teacher-workspace/components/teacher-workspace-page";
import { getTeacherWorkspaceData, teacherWorkspaceModules } from "@/services/teacher-workspace-service";

export default async function TeacherWorkspaceModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  if (!teacherWorkspaceModules.includes(module as (typeof teacherWorkspaceModules)[number])) notFound();
  const session = await auth();
  const data = await getTeacherWorkspaceData({
    userId: session?.user.id,
    institutionId: session?.user.institutionId,
    roles: session?.user.roles ?? []
  });

  return <TeacherWorkspacePage data={data} module={module as (typeof teacherWorkspaceModules)[number]} />;
}
