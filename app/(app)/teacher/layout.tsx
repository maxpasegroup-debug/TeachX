import { redirect } from "next/navigation";

import { TeacherWorkspaceCanvas } from "@/components/layout/teacher-workspace-canvas";
import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveNavigationWorkspace } from "@/lib/constants/navigation";

// Teacher Workspace: TeachX Guru V1 owns this protected frontend surface.
export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <TeacherGuard>{children}</TeacherGuard>;
}

async function TeacherGuard({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (resolveNavigationWorkspace(user?.roles ?? []) !== "teacher") redirect("/access-denied");

  return <TeacherWorkspaceCanvas>{children}</TeacherWorkspaceCanvas>;
}
