import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { StatCard } from "@/components/ui/stat-card";

type WorkspacePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  stats: { label: string; value: string; detail: string; icon: LucideIcon }[];
  actions: { label: string; href: string; icon: LucideIcon }[];
  panels: { title: string; items: string[] }[];
};

export function WorkspacePage({ eyebrow, title, description, stats, actions, panels }: WorkspacePageProps) {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-soft">
        <div className="bg-gradient-to-br from-sky-50 via-white to-blue-50 px-5 py-8 sm:px-8 lg:px-10">
          <Badge>{eyebrow}</Badge>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p>
            </div>
            <SearchInput placeholder="Search TeachX" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return <StatCard detail={stat.detail} icon={<Icon className="h-5 w-5" />} key={stat.label} label={stat.label} value={stat.value} />;
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5 shadow-soft">
          <h2 className="text-xl font-semibold">Quick actions</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {actions.map((action) => {
              const Icon = action.icon;

              return (
                <Link className="group flex items-center justify-between rounded-2xl border border-border bg-background p-4 transition hover:border-sky-200 hover:bg-sky-50" href={action.href} key={action.label}>
                  <span className="flex items-center gap-3 font-medium">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-sky-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    {action.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-sky-700" />
                </Link>
              );
            })}
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {panels.map((panel) => (
            <Card className="p-5 shadow-soft" key={panel.title}>
              <h2 className="text-xl font-semibold">{panel.title}</h2>
              <div className="mt-5 space-y-3">
                {panel.items.map((item) => (
                  <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm leading-6 text-muted-foreground" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
