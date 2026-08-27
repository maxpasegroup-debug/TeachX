import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveNavigationWorkspace } from "@/lib/constants/navigation";

export default async function PersonalSettingsPage() {
  const user = await getCurrentUser();
  const workspace = resolveNavigationWorkspace(user?.roles ?? []);
  const destination = {
    student: "/student/settings",
    teacher: "/teacher/settings",
    parent: "/parent?section=settings",
    director: "/director/settings",
    campus: "/campus?module=settings",
    admin: "/admin/settings",
    denied: "/access-denied"
  }[workspace];

  redirect(destination);
}
