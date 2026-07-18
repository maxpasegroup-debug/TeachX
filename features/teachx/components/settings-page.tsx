import type { LucideIcon } from "lucide-react";
import { Bell, Languages, Lock, Monitor, Palette, Shield, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SwitchRow } from "@/features/teachx/components/switch-row";

type SettingsPageProps = {
  workspace: "Teacher" | "Student" | "Admin";
};

const sections: { title: string; description: string; icon: LucideIcon; rows: string[] }[] = [
  { title: "Account", description: "Name, email, phone, and account identity.", icon: UserRound, rows: ["Profile identity", "Email address", "Phone number"] },
  { title: "Notifications", description: "Choose what TeachX should surface in your workspace.", icon: Bell, rows: ["Platform updates", "Learning reminders", "Product tips"] },
  { title: "Appearance", description: "Keep the interface calm and readable.", icon: Palette, rows: ["Comfortable spacing", "Reduce motion", "High contrast"] },
  { title: "Language", description: "Set preferred language and regional defaults.", icon: Languages, rows: ["English", "Hindi ready", "Regional language ready"] },
  { title: "Privacy", description: "Control profile visibility and discovery preferences.", icon: Shield, rows: ["Profile discoverability", "Activity visibility", "Saved data"] },
  { title: "Security", description: "Protect sign-in and sensitive account actions.", icon: Lock, rows: ["Password", "Session security", "OTP architecture"] },
  { title: "Profile", description: "Complete the fields that make your workspace useful.", icon: Monitor, rows: ["Completion checklist", "Public profile", "Workspace defaults"] }
];

export function SettingsPage({ workspace }: SettingsPageProps) {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8">
        <Badge>{workspace} Settings</Badge>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">Settings</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">One shared settings architecture for account, notifications, appearance, language, privacy, security, and profile preferences.</p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <Card className="p-5 shadow-soft" key={section.title}>
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                  <p className="mt-1 leading-7 text-muted-foreground">{section.description}</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {section.rows.map((row, index) => (
                  <SwitchRow checked={index === 0} key={row} label={row} />
                ))}
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
