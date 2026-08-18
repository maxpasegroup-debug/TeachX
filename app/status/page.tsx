import Link from "next/link";
import { Activity, ArrowLeft, CheckCircle2, CircleAlert, Clock3, LifeBuoy, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getPublicSystemStatus, type PublicComponentStatus } from "@/services/public-status-service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "System Status | TeachX Guru",
  description: "Current availability of TeachX Guru teacher, AI, billing, and support services."
};

const statusStyles: Record<PublicComponentStatus, { label: string; icon: typeof CheckCircle2; color: string }> = {
  operational: { label: "Operational", icon: CheckCircle2, color: "text-emerald-700" },
  degraded: { label: "Limited", icon: CircleAlert, color: "text-amber-700" },
  outage: { label: "Interrupted", icon: XCircle, color: "text-red-700" }
};

export default async function StatusPage() {
  const status = await getPublicSystemStatus();
  const overall = statusStyles[status.overall];
  const OverallIcon = overall.icon;

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-sky-50 px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground" href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to TeachX Guru
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Badge>Live status</Badge>
            <span className="text-sm text-muted-foreground">Release {status.version}</span>
          </div>
          <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">TeachX system status</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">A simple, privacy-safe view of the services teachers depend on.</p>
            </div>
            <div className={`flex items-center gap-3 text-sm font-semibold ${overall.color}`}>
              <OverallIcon className="h-6 w-6" />
              {overall.label}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="border-b border-border pb-7">
          <div className="flex items-center gap-3">
            <Activity className={`h-6 w-6 ${overall.color}`} />
            <h2 className="text-2xl font-semibold">{status.summary}</h2>
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock3 className="h-4 w-4" />
            Checked {new Date(status.checkedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC
          </p>
        </div>

        <div className="divide-y divide-border">
          {status.components.map((component) => {
            const display = statusStyles[component.status];
            const Icon = display.icon;
            return (
              <div className="grid gap-3 py-6 sm:grid-cols-[1fr_auto] sm:items-center" key={component.name}>
                <div>
                  <h2 className="font-semibold">{component.name}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{component.message}</p>
                </div>
                <span className={`flex items-center gap-2 text-sm font-semibold ${display.color}`}>
                  <Icon className="h-5 w-5" />
                  {display.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-7">
          <p className="text-sm text-muted-foreground">Still having trouble? Tell us what happened and which tool you were using.</p>
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline" href="/contact">
            <LifeBuoy className="h-4 w-4" />
            Contact support
          </Link>
        </div>
      </section>
    </main>
  );
}

