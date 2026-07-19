import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { resolveNavigationWorkspace } from "@/lib/constants/navigation";

// Teacher Workspace: TeachX Guru V1 owns this protected frontend surface.
export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <TeacherGuard>{children}</TeacherGuard>;
}

async function TeacherGuard({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (resolveNavigationWorkspace(session?.user.roles ?? []) !== "teacher") redirect("/dashboard");

  return <div className="mx-auto w-full max-w-7xl">{children}</div>;
}
