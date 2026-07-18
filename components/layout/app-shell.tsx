import type { CSSProperties, ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import type { RoleKey } from "@/lib/constants/roles";
import { colorToHslVariable, type WhiteLabelConfig } from "@/services/white-label-service";

export function AppShell({ children, institutionName, roles, whiteLabel }: { children: ReactNode; institutionName: string; roles?: RoleKey[]; whiteLabel?: WhiteLabelConfig }) {
  const style = whiteLabel
    ? ({
        "--primary": colorToHslVariable(whiteLabel.primaryColor),
        "--secondary": colorToHslVariable(whiteLabel.secondaryColor),
        "--accent": colorToHslVariable(whiteLabel.accentColor)
      } as CSSProperties)
    : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground" style={style}>
      <div className="flex">
        <Sidebar institutionName={institutionName} logoUrl={whiteLabel?.logoUrl} roles={roles ?? []} />
        <div className="min-w-0 flex-1">
          <TopHeader institutionName={institutionName} roles={roles ?? []} />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
