import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type PolicySection = {
  title: string;
  body: string;
  items?: string[];
};

type PolicyPageProps = {
  badge: string;
  title: string;
  description: string;
  updated: string;
  icon?: LucideIcon;
  sections: PolicySection[];
  footnote?: string;
};

export function PolicyPage({ badge, title, description, updated, icon: Icon = ShieldCheck, sections, footnote }: PolicyPageProps) {
  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-gradient-to-br from-sky-50 via-white to-emerald-50 px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground" href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to TeachX Guru
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Badge>{badge}</Badge>
            <span className="text-sm text-muted-foreground">Last updated: {updated}</span>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">{title}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
              <Icon className="h-8 w-8" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-5 py-10 sm:px-8">
        {sections.map((section) => (
          <Card className="p-5 shadow-soft" key={section.title}>
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{section.body}</p>
            {section.items?.length ? (
              <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
                {section.items.map((item) => (
                  <li className="flex gap-2" key={item}>
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>
        ))}
        <Card className="border-sky-200 bg-sky-50/70 p-5">
          <h2 className="font-semibold">Need help?</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Contact <a className="font-semibold text-foreground underline" href="mailto:support@teachx.guru">support@teachx.guru</a> for privacy, billing, account, or security questions.
          </p>
          {footnote ? <p className="mt-3 text-xs leading-5 text-muted-foreground">{footnote}</p> : null}
        </Card>
      </section>
    </main>
  );
}
