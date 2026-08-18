import Link from "next/link";
import { AlertTriangle, CheckCircle2, Gauge, LifeBuoy, Rocket, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { getLaunchReadiness } from "@/services/launch-readiness-service";

type LaunchReadiness = Awaited<ReturnType<typeof getLaunchReadiness>>;

function tone(status: "ready" | "attention" | "blocked") {
  if (status === "ready") return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (status === "attention") return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-red-700 bg-red-50 border-red-200";
}

export function LaunchReadinessPage({ data }: { data: LaunchReadiness }) {
  return (
    <section className="space-y-6">
      <Card className="overflow-hidden shadow-soft">
        <div className="grid gap-6 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6 lg:grid-cols-[1fr_280px] lg:items-end">
          <div>
            <Badge>Phase 5 Launch Command</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">Launch readiness board</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              A practical go-live view for teacher onboarding, AI activation, pricing, billing, support, and runtime configuration.
            </p>
          </div>
          <Card className="border-sky-200 bg-white/80 p-5">
            <div className="flex items-center justify-between gap-3">
              <Gauge className="h-6 w-6 text-sky-700" />
              <Badge>{data.status}</Badge>
            </div>
            <p className="mt-5 text-5xl font-semibold">{data.score}%</p>
            <Progress className="mt-4" value={data.score} />
          </Card>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Teachers" value={data.metrics.teachers} />
        <Metric label="Profiles Ready" value={data.metrics.profileReady} />
        <Metric label="AI Uses" value={data.metrics.aiUsage} />
        <Metric label="Feedback/Bugs" value={data.metrics.feedbackTickets} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {data.checks.map((item) => (
          <Card className={`border p-5 ${tone(item.status)}`} key={item.area}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{item.area}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.message}</p>
              </div>
              {item.status === "ready" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
            </div>
            <Progress className="mt-4" value={item.score} />
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <Rocket className="h-5 w-5 text-sky-700" />
            <h2 className="text-xl font-semibold">Next launch actions</h2>
          </div>
          <div className="mt-5 space-y-3">
            {data.nextActions.length ? data.nextActions.map((action) => <p className="rounded-xl border border-border bg-background px-4 py-3 text-sm leading-6" key={action}>{action}</p>) : <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">All launch checks are currently ready.</p>}
          </div>
        </Card>
        <Card className="p-5 shadow-soft">
          <ShieldCheck className="h-5 w-5 text-sky-700" />
          <h2 className="mt-4 text-xl font-semibold">Ops shortcuts</h2>
          <div className="mt-5 grid gap-3">
            <Link className="rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted" href="/admin/support"><LifeBuoy className="mr-2 inline h-4 w-4" />Support queue</Link>
            <Link className="rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted" href="/admin/subscriptions">Subscriptions</Link>
            <Link className="rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted" href="/admin/orders">Orders</Link>
            <Link className="rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted" href="/trust">Public trust center</Link>
          </div>
        </Card>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-5 shadow-soft">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </Card>
  );
}
