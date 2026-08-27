"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function AppShellFrame({ sidebar, topHeader, children }: { sidebar: ReactNode; topHeader: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const immersiveTeacherExperience = pathname === "/teacher" || pathname.startsWith("/teacher/life/");

  if (immersiveTeacherExperience) {
    return <main className="min-h-screen bg-[#f7f4ec] text-[#111714]">{children}</main>;
  }

  return (
    <div className="flex">
      {sidebar}
      <div className="min-w-0 flex-1">
        {topHeader}
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
