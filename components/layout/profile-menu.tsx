"use client";

import Link from "next/link";
import { CircleHelp, LogOut, Settings, Store, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { logoutAction } from "@/features/auth/actions";
import { getInitials } from "@/lib/utils";

type ProfileMenuProps = {
  name?: string | null;
  email?: string | null;
  teacher?: boolean;
};

export function ProfileMenu({ name, email, teacher = false }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsideInteraction(event: MouseEvent | TouchEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideInteraction);
    document.addEventListener("touchstart", closeOnOutsideInteraction);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideInteraction);
      document.removeEventListener("touchstart", closeOnOutsideInteraction);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Open profile menu"
        className="flex h-11 items-center gap-3 rounded-lg border border-border bg-surface px-2 pr-3 text-left focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">{getInitials(name)}</span>
        <span className="hidden min-w-0 lg:block">
          <span className="block max-w-36 truncate text-sm font-medium">{name ?? "User"}</span>
          <span className="block max-w-36 truncate text-xs text-muted-foreground">{email}</span>
        </span>
      </button>
      <div aria-label="Profile menu" className={`absolute right-0 top-[calc(100%+0.5rem)] z-20 w-64 rounded-lg border border-border bg-surface p-2 shadow-soft transition ${isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"}`} role="menu">
        <Link className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary" href="/profile" onClick={() => setIsOpen(false)} role="menuitem">
          <UserRound className="h-4 w-4" />
          Profile
        </Link>
        {teacher ? <>
          <Link className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary" href="/teacher/business/profile" onClick={() => setIsOpen(false)} role="menuitem"><Store className="h-4 w-4" />Professional Profile</Link>
          <Link className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary" href="/teacher/settings" onClick={() => setIsOpen(false)} role="menuitem"><Settings className="h-4 w-4" />Settings</Link>
          <Link className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary" href="/teacher/support" onClick={() => setIsOpen(false)} role="menuitem"><CircleHelp className="h-4 w-4" />Help</Link>
        </> : null}
        <form action={logoutAction}>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-primary" role="menuitem" type="submit">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}
