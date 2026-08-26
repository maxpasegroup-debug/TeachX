import type { CSSProperties, ReactNode } from "react";

import { AppShellFrame } from "@/components/layout/app-shell-frame";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { FeedbackWidget } from "@/features/launch-intelligence/components/feedback-widget";
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
      <AppShellFrame
        sidebar={<Sidebar institutionName={institutionName} logoUrl={whiteLabel?.logoUrl} roles={roles ?? []} />}
        topHeader={<TopHeader institutionName={institutionName} roles={roles ?? []} />}
      >
        {children}
      </AppShellFrame>
      <FeedbackWidget />
    </div>
  );
}
