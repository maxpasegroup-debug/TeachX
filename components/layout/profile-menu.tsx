import Link from "next/link";
import { CircleHelp, LogOut, Settings, Store, UserRound } from "lucide-react";

import { logoutAction } from "@/features/auth/actions";
import { getInitials } from "@/lib/utils";

type ProfileMenuProps = {
  name?: string | null;
  email?: string | null;
  teacher?: boolean;
};

export function ProfileMenu({ name, email, teacher = false }: ProfileMenuProps) {
  return (
    <div className="group relative">
      <button className="flex h-11 items-center gap-3 rounded-lg border border-border bg-surface px-2 pr-3 text-left" type="button">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">{getInitials(name)}</span>
        <span className="hidden min-w-0 lg:block">
          <span className="block max-w-36 truncate text-sm font-medium">{name ?? "User"}</span>
          <span className="block max-w-36 truncate text-xs text-muted-foreground">{email}</span>
        </span>
      </button>
      <div className="invisible absolute right-0 top-14 z-20 w-64 rounded-lg border border-border bg-surface p-2 opacity-0 shadow-soft transition group-hover:visible group-hover:opacity-100">
        <Link className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted" href="/profile">
          <UserRound className="h-4 w-4" />
          Profile
        </Link>
        {teacher ? <>
          <Link className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted" href="/teacher/business/profile"><Store className="h-4 w-4" />Professional Profile</Link>
          <Link className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted" href="/teacher/settings"><Settings className="h-4 w-4" />Settings</Link>
          <Link className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted" href="/teacher/support"><CircleHelp className="h-4 w-4" />Help</Link>
        </> : null}
        <form action={logoutAction}>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50" type="submit">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}
