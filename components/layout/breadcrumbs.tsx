"use client";

import { usePathname } from "next/navigation";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>Home</span>
      {segments.map((segment) => (
        <span className="flex items-center gap-2 capitalize" key={segment}>
          <span>/</span>
          <span>{segment.replaceAll("-", " ")}</span>
        </span>
      ))}
    </div>
  );
}
