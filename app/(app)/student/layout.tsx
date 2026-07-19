import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { resolveNavigationWorkspace } from "@/lib/constants/navigation";

// Future ClassTutor Frontend: protected student workspace is retained for the
// future student product and is no longer exposed by TeachX Guru public pages.
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <StudentGuard>{children}</StudentGuard>;
}

async function StudentGuard({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (resolveNavigationWorkspace(session?.user.roles ?? []) !== "student") redirect("/dashboard");

  return <div className="mx-auto w-full max-w-7xl">{children}</div>;
}
