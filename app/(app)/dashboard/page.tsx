import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { resolveNavigationWorkspace } from "@/lib/constants/navigation";

export default async function DashboardPage() {
  const session = await auth();
  const workspace = resolveNavigationWorkspace(session?.user.roles ?? []);

  redirect(`/${workspace}`);
}
