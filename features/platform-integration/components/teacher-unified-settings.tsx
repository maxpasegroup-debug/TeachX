import Link from "next/link";
import { Bell, Bot, Languages, Lock, Palette, Shield, Store, UserRound, WifiOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { saveUnifiedTeacherSettingsAction } from "@/features/platform-integration/actions";
import { formatDate } from "@/lib/format";
import { localeFromLegacyLanguage, supportedLocales, supportedTimeZones } from "@/lib/i18n/config";
import type { getTeacherSettings } from "@/services/teacher-settings-service";

type Data = NonNullable<Awaited<ReturnType<typeof getTeacherSettings>>>;
const text = (value: unknown, fallback: string) => typeof value === "string" ? value : fallback;

export function TeacherUnifiedSettings({ data }: { data: Data }) {
  const enabled = new Set(data.notifications.filter((item) => item.enabled).map((item) => item.type));
  const locale = localeFromLegacyLanguage(text(data.settings.locale, text(data.settings.language, "en-IN")));
  const requestedTimeZone = text(data.settings.timeZone, "Asia/Kolkata");
  const timeZone = supportedTimeZones.find((item) => item === requestedTimeZone) ?? "Asia/Kolkata";

  return (
    <div className="space-y-8">
      <section className="border bg-sky-50 p-6 shadow-soft sm:p-8">
        <Badge>Unified Teacher Settings</Badge>
        <h1 className="mt-5 text-4xl font-semibold">Settings</h1>
        <p className="mt-3 max-w-3xl text-lg text-muted-foreground">Account, appearance, notifications, privacy, security, region, subscription, AI, marketplace, and offline preferences in one place.</p>
      </section>

      <form action={saveUnifiedTeacherSettingsAction} className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5"><Heading icon={UserRound} title="Account" /><p className="mt-4 font-medium">{data.user.name}</p><p className="text-sm text-muted-foreground">{data.user.email}</p><Link className="mt-4 inline-flex text-sm font-semibold text-sky-700" href="/profile">Open unified profile</Link></Card>
        <Card className="p-5"><Heading icon={Palette} title="Appearance" /><Label htmlFor="appearance">Theme</Label><Select defaultValue={text(data.settings.appearance, "system")} id="appearance" name="appearance"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option><option value="high-contrast">High contrast</option></Select><Check name="reducedMotion" defaultChecked={data.settings.reducedMotion === true}>Reduce interface motion</Check><Check name="highContrast" defaultChecked={data.settings.highContrast === true}>Use high contrast</Check></Card>
        <Card className="p-5"><Heading icon={Bell} title="Notifications" /><div className="mt-4 grid gap-3">{[["SYSTEM", "System and subscription"], ["CONTENT", "AI, resources, and marketplace"], ["ANNOUNCEMENT", "Institution and community"], ["ASSIGNMENT", "Assignments and orders"], ["PLANNER", "Calendar and planner"]].map(([type, label]) => <Check defaultChecked={enabled.has(type as never)} key={type} name="notificationTypes" value={type}>{label}</Check>)}</div></Card>
        <Card className="p-5"><Heading icon={Shield} title="Privacy and security" /><Label htmlFor="privacy">Profile visibility</Label><Select defaultValue={text(data.settings.privacy, "professional")} id="privacy" name="privacy"><option value="professional">Professional community</option><option value="marketplace">Marketplace public</option><option value="private">Private</option></Select><Check defaultChecked={data.settings.securityAlerts !== false} name="securityAlerts">Security and login alerts</Check></Card>
        <Card className="p-5"><Heading icon={Languages} title="Language and region" /><Label htmlFor="locale">Formatting locale</Label><Select defaultValue={locale} id="locale" name="locale">{supportedLocales.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</Select><Label className="mt-4" htmlFor="timeZone">Time zone</Label><Select defaultValue={timeZone} id="timeZone" name="timeZone">{supportedTimeZones.map((zone) => <option key={zone} value={zone}>{zone.replaceAll("_", " ")}</option>)}</Select><p className="mt-3 text-xs leading-5 text-muted-foreground">Regional formatting and right-to-left layout apply after saving. Interface translations are released only after human review.</p></Card>
        <Card className="p-5"><Heading icon={Bot} title="AI preferences" /><Label htmlFor="aiStyle">Response style</Label><Select defaultValue={text(data.settings.aiStyle, "balanced")} id="aiStyle" name="aiStyle"><option value="balanced">Balanced</option><option value="concise">Concise</option><option value="detailed">Detailed</option><option value="activity-first">Activity first</option></Select></Card>
        <Card className="p-5"><Heading icon={Store} title="Marketplace and community" /><Check defaultChecked={data.settings.marketplaceEmails !== false} name="marketplaceEmails">Marketplace, order, and resource updates</Check><Check defaultChecked={data.settings.communityDiscovery !== false} name="communityDiscovery">Professional discovery and collaboration</Check></Card>
        <Card className="p-5"><Heading icon={Lock} title="Subscription" /><p className="mt-4 font-semibold">{data.subscription?.plan.name ?? "No active plan"}</p><p className="text-sm text-muted-foreground">{data.subscription ? `${data.subscription.status} - renews ${data.subscription.currentPeriodEnd ? formatDate(data.subscription.currentPeriodEnd, { locale, timeZone }) : "on plan schedule"}` : "Choose a plan to unlock subscription features."}</p><Link className="mt-4 inline-flex text-sm font-semibold text-sky-700" href="/teacher/business/subscription">Manage subscription</Link></Card>
        <Card className="p-5 lg:col-span-2"><Heading icon={WifiOff} title="Offline experience" /><Check defaultChecked={data.settings.offlineHints !== false} name="offlineHints">Show offline-friendly guidance when files or live data are unavailable</Check></Card>
        <Button className="lg:col-span-2 lg:w-fit" type="submit">Save unified settings</Button>
      </form>
    </div>
  );
}

function Heading({ icon: Icon, title }: { icon: typeof UserRound; title: string }) {
  return <div className="mb-4 flex items-center gap-3"><span className="bg-sky-50 p-2 text-sky-700"><Icon className="h-5 w-5" /></span><h2 className="text-xl font-semibold">{title}</h2></div>;
}

function Check({ children, defaultChecked, name, value }: { children: React.ReactNode; defaultChecked: boolean; name: string; value?: string }) {
  return <label className="mt-3 flex items-center gap-3 text-sm"><input defaultChecked={defaultChecked} name={name} type="checkbox" value={value} />{children}</label>;
}
