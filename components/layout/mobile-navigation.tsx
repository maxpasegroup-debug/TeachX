"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getNavigationForRoles } from "@/lib/constants/navigation";
import type { RoleKey } from "@/lib/constants/roles";

export function MobileNavigation({ institutionName, roles }: { institutionName: string; roles: RoleKey[] }) {
  const [open, setOpen] = useState(false);
  const navigation = getNavigationForRoles(roles);
  const groupedItems = navigation.items.reduce<Record<string, typeof navigation.items>>((groups, item) => {
    const group = item.group ?? "Workspace";
    groups[group] = [...(groups[group] ?? []), item];
    return groups;
  }, {});

  return (
    <div className="md:hidden">
      <Button aria-label="Open navigation" className="h-11 w-11 px-0" onClick={() => setOpen(true)} type="button" variant="secondary">
        <Menu className="h-5 w-5" />
      </Button>
      {open ? (
        <div className="fixed inset-0 z-30 flex flex-col bg-background">
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-border px-6">
            <div>
              <p className="font-semibold">TeachX</p>
              <p className="text-sm text-muted-foreground">Learn • Teach • Earn</p>
            </div>
            <Button aria-label="Close navigation" className="h-11 w-11 px-0" onClick={() => setOpen(false)} type="button" variant="secondary">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav aria-label="Workspace navigation" className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
            {Object.entries(groupedItems).map(([group, items]) => <section key={group}>
              {navigation.workspace === "teacher" ? <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{group}</p> : null}
              {items.map((item) => {
              const Icon = item.icon;

              return (
                <Link className="flex h-14 items-center gap-3 rounded-lg px-4 text-lg font-medium hover:bg-muted" href={item.href} key={item.href} onClick={() => setOpen(false)}>
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
              })}
            </section>)}
          </nav>
          <p className="shrink-0 px-8 py-4 text-sm text-muted-foreground">{institutionName}</p>
        </div>
      ) : null}
    </div>
  );
}
