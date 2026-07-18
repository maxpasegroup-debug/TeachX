import Link from "next/link";

import { Card } from "@/components/ui/card";

export function WorkspaceKpiCard({ label, value, href }: { label: string; value: string; href?: string }) {
  const body = (
    <Card className="p-6 transition-colors hover:bg-muted/40">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </Card>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

export function WorkspaceListWidget({ title, items, href }: { title: string; items: string[]; href?: string }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {href ? <Link className="text-sm font-medium text-muted-foreground hover:text-foreground" href={href}>Open</Link> : null}
      </div>
      <div className="mt-5 space-y-3">
        {items.length ? items.slice(0, 7).map((item) => <p className="rounded-lg bg-muted px-4 py-3 text-sm" key={item}>{item}</p>) : <p className="rounded-lg bg-muted px-4 py-8 text-center text-sm text-muted-foreground">Nothing pending.</p>}
      </div>
    </Card>
  );
}

export function WorkspaceTimeline({ items }: { items: { id: string; title: string; body?: string | null; createdAt: Date; link?: string }[] }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Recent Activities</h2>
      <div className="mt-5 space-y-3">
        {items.length ? items.map((item) => {
          const row = (
            <div className="rounded-lg bg-muted px-4 py-3">
              <p className="font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.body ?? item.createdAt.toLocaleString("en-IN")}</p>
            </div>
          );
          return item.link ? <Link href={item.link} key={item.id}>{row}</Link> : <div key={item.id}>{row}</div>;
        }) : <p className="rounded-lg bg-muted px-4 py-8 text-center text-sm text-muted-foreground">No activity yet.</p>}
      </div>
    </Card>
  );
}

export function WorkspaceQuickActions({ actions }: { actions: { label: string; href: string }[] }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Quick Actions</h2>
      <div className="mt-5 grid gap-3">
        {actions.length ? actions.map((action) => <Link className="rounded-lg bg-muted px-4 py-3 text-sm font-medium hover:bg-border" href={action.href} key={action.label}>{action.label}</Link>) : <p className="text-sm text-muted-foreground">No quick actions.</p>}
      </div>
    </Card>
  );
}
