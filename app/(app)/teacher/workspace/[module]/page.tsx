import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { TeacherWorkspacePage } from "@/features/teacher-workspace/components/teacher-workspace-page";
import { TeacherNotificationCenter } from "@/features/teacher-settings/components/teacher-notification-center";
import { getTeacherNotificationCenter } from "@/services/teacher-notification-service";
import { getTeacherWorkspaceData, teacherWorkspaceModules } from "@/services/teacher-workspace-service";

export default async function TeacherWorkspaceModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  if (!teacherWorkspaceModules.includes(module as (typeof teacherWorkspaceModules)[number])) notFound();
  const session = await auth();
  if (module === "notifications") {
    const notifications = await getTeacherNotificationCenter(session?.user.id, session?.user.institutionId);
    if (!notifications) notFound();
    return <TeacherNotificationCenter data={notifications} />;
  }
  const data = await getTeacherWorkspaceData({
    userId: session?.user.id,
    institutionId: session?.user.institutionId,
    roles: session?.user.roles ?? []
  });

  return <TeacherWorkspacePage data={data} module={module as (typeof teacherWorkspaceModules)[number]} />;
}
