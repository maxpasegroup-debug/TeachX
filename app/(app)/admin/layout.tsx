import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { resolveNavigationWorkspace } from "@/lib/constants/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}

async function AdminGuard({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (resolveNavigationWorkspace(session?.user.roles ?? []) !== "admin") redirect("/dashboard");

  return <div className="mx-auto w-full max-w-7xl">{children}</div>;
}
