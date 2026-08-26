import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveNavigationWorkspace } from "@/lib/constants/navigation";

// Future ClassTutor Frontend: protected student workspace is retained for the
// future student product and is no longer exposed by TeachX Guru public pages.
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <StudentGuard>{children}</StudentGuard>;
}

async function StudentGuard({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (resolveNavigationWorkspace(user?.roles ?? []) !== "student") redirect("/access-denied");

  return <div className="mx-auto w-full max-w-7xl">{children}</div>;
}
