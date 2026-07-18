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

  return (
    <div className="md:hidden">
      <Button aria-label="Open navigation" className="h-11 w-11 px-0" onClick={() => setOpen(true)} type="button" variant="secondary">
        <Menu className="h-5 w-5" />
      </Button>
      {open ? (
        <div className="fixed inset-0 z-30 bg-background">
          <div className="flex h-20 items-center justify-between border-b border-border px-6">
            <div>
              <p className="font-semibold">TeachX</p>
              <p className="text-sm text-muted-foreground">Learn • Teach • Earn</p>
            </div>
            <Button aria-label="Close navigation" className="h-11 w-11 px-0" onClick={() => setOpen(false)} type="button" variant="secondary">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="space-y-2 p-4">
            {navigation.items.map((item) => {
              const Icon = item.icon;

              return (
                <Link className="flex h-14 items-center gap-3 rounded-lg px-4 text-lg font-medium hover:bg-muted" href={item.href} key={item.href} onClick={() => setOpen(false)}>
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <p className="px-8 pt-2 text-sm text-muted-foreground">{institutionName}</p>
        </div>
      ) : null}
    </div>
  );
}
