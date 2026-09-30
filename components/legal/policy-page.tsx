import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ShieldCheck } from "lucide-react";

import { TeachXPublicFooter, TeachXPublicHeader } from "@/components/landing/teachx-public-chrome";

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
    <main className="tx-public-page min-h-screen" data-world={badge}>
      <TeachXPublicHeader />
      <section className="tx-hero-band" aria-labelledby="policy-title">
        <span className="tx-blob tx-blob-orange" aria-hidden="true" />
        <span className="tx-blob tx-blob-violet" aria-hidden="true" />
        <div className="tx-hero-copy mx-auto max-w-5xl px-5 py-16 sm:px-8">
          <span className="tx-public-icon bg-white"><Icon className="h-6 w-6" aria-hidden="true" /></span>
          <p className="tx-public-kicker mt-8 text-2xl">{badge}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-[#6f3b90] sm:text-6xl" id="policy-title">{title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4c3d58]">{description}</p>
          <p className="tx-public-muted mt-5 text-sm">Last updated: {updated}</p>
        </div>
      </section>

      <section className="tx-section-lilac" aria-label={title}>
        <div className="tx-color-grid mx-auto grid max-w-5xl gap-4 px-5 py-12 sm:px-8">
          {sections.map((section) => (
            <article className="tx-public-card p-6" key={section.title}>
              <h2 className="text-xl font-semibold text-[#6f3b90]">{section.title}</h2>
              <p className="tx-public-muted mt-3 text-sm leading-6">{section.body}</p>
              {section.items?.length ? (
                <ul className="mt-4 space-y-2 text-sm leading-6 text-[#4c3d58]">
                  {section.items.map((item) => (
                    <li className="flex gap-2" key={item}>
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#fcaa1d" }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="tx-section-cream">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
          <h2 className="text-2xl font-semibold text-[#6f3b90]">Need help?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4c3d58]">
            Contact <a className="font-semibold underline" href="mailto:support@teachx.guru" style={{ color: "#fcaa1d" }}>support@teachx.guru</a> for privacy, billing, account, or security questions.
          </p>
          {footnote ? <p className="tx-public-muted mt-3 max-w-2xl text-xs leading-5">{footnote}</p> : null}
          <Link className="tx-public-pill mt-6 inline-flex min-h-12 items-center px-6 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#fcaa1d] focus:ring-offset-2" href="/contact">Contact support</Link>
        </div>
      </section>
      <TeachXPublicFooter />
    </main>
  );
}
