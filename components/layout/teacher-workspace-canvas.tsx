"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function TeacherWorkspaceCanvas({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isFocusedWorkspace =
    pathname.startsWith("/teacher/workspace/") ||
    pathname === "/teacher/ai-studio/create/parent-communication" ||
    pathname === "/teacher/settings";

  if (isFocusedWorkspace) {
    return <div className="w-full min-w-0 px-4 py-6 sm:px-6 lg:px-8">{children}</div>;
  }

  return <div className="mx-auto w-full max-w-7xl">{children}</div>;
}
