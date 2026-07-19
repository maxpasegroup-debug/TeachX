"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";

import { getNavigationForRoles } from "@/lib/constants/navigation";
import type { RoleKey } from "@/lib/constants/roles";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Sidebar({ institutionName, logoUrl, roles }: { institutionName: string; logoUrl?: string; roles: RoleKey[] }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const navigation = getNavigationForRoles(roles);

  return (
    <aside className={cn("hidden min-h-screen border-r border-border bg-surface/95 shadow-soft transition-all duration-200 md:flex md:flex-col", collapsed ? "w-20" : "w-72")}>
      <div className="flex h-20 items-center gap-3 px-5">
        {logoUrl ? <Image alt={`${institutionName} logo`} className="h-11 w-11 shrink-0 rounded-2xl object-cover" height={44} src={logoUrl} unoptimized width={44} /> : <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-base font-semibold text-white">TX</div>}
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">TeachX</p>
            <p className="truncate text-sm text-muted-foreground">Professional AI Workspace</p>
          </div>
        ) : null}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              className={cn(
                "flex h-12 items-center gap-3 rounded-lg px-3 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                active && "bg-muted text-foreground"
              )}
              href={item.href}
              key={item.href}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        {!collapsed ? <p className="mb-3 truncate px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{institutionName}</p> : null}
        <Button className="w-full justify-center px-3" onClick={() => setCollapsed((value) => !value)} type="button" variant="ghost">
          {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          {!collapsed ? <span className="ml-2">Collapse</span> : null}
        </Button>
      </div>
    </aside>
  );
}
