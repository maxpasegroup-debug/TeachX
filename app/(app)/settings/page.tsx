import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { resolveNavigationWorkspace } from "@/lib/constants/navigation";

export default async function PersonalSettingsPage() {
  const session = await auth();
  const workspace = resolveNavigationWorkspace(session?.user.roles ?? []);
  const destination = {
    student: "/student/settings",
    teacher: "/teacher/settings",
    parent: "/parent?section=settings",
    director: "/director/settings",
    campus: "/campus?module=settings",
    admin: "/admin/settings"
  }[workspace];

  redirect(destination);
}
