import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Bot, Check } from "lucide-react";

import { MotionPrimitive } from "@/components/brand/motion-primitives";
import { TeachXPublicFooter, TeachXPublicHeader } from "@/components/landing/teachx-public-chrome";

export type PublicPillar = {
  eyebrow: string;
  title: string;
  description: string;
  statement: string;
  icon: LucideIcon;
  heroTone: string;
  accentTone: string;
  categories: { title: string; description: string; items: string[] }[];
  taraPrompt: string;
  comingSoon?: boolean;
};

export function PublicPillarPage({ pillar }: { pillar: PublicPillar }) {
  const Icon = pillar.icon;
  return (
    <main className="tx-public-page min-h-screen" data-world={pillar.eyebrow}>
      <TeachXPublicHeader />

      <section className="tx-hero-band" aria-labelledby="pillar-title">
        <span className="tx-blob tx-blob-orange" aria-hidden="true" />
        <span className="tx-blob tx-blob-violet" aria-hidden="true" />
        <MotionPrimitive className="mx-auto grid min-h-[34rem] max-w-[90rem] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-20" variant="fade-up">
          <div className="tx-hero-copy">
            <span className="tx-public-icon bg-white"><Icon className="h-6 w-6" aria-hidden="true" /></span>
            <p className="tx-public-kicker mt-8 text-2xl">{pillar.eyebrow}</p>
            <h1 className="mt-4 max-w-[13ch] text-4xl font-semibold leading-[1.05] text-[#6f3b90] sm:text-6xl" id="pillar-title">{pillar.title}</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#4c3d58]">{pillar.description}</p>
            {pillar.comingSoon ? <p className="mt-6 inline-flex min-h-9 items-center rounded-full px-4 text-xs font-semibold uppercase" style={{ background: "#fff1d6", color: "#fcaa1d" }}>Coming soon</p> : <Link className="tx-public-pill mt-7 inline-flex min-h-12 items-center gap-2 px-6 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#fcaa1d] focus:ring-offset-2" href="/signup/teacher">Start Free<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
          </div>
          <div className="tx-hero-panel">
            <p className="text-lg font-semibold text-[#6f3b90]">{pillar.statement}</p>
            <div className="mt-5 grid gap-3">
              {pillar.categories.map((category, index) => (
                <div className="tx-swatch" key={category.title}>
                  <span className="text-sm text-[#6f3b90]">0{index + 1}</span>
                  <span>{category.title}</span>
                </div>
              ))}
            </div>
          </div>
        </MotionPrimitive>
      </section>

      <section className="tx-section-lilac" aria-labelledby="capabilities-title">
        <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <MotionPrimitive className="mx-auto max-w-3xl pb-10 text-center" variant="fade-up">
            <p className="tx-public-kicker text-lg">Inside {pillar.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#6f3b90] sm:text-5xl" id="capabilities-title">{pillar.statement}</h2>
          </MotionPrimitive>
          <div className="tx-color-grid grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pillar.categories.map((category, index) => (
              <MotionPrimitive className="tx-public-card p-7" delay={index === 0 ? "none" : "sm"} key={category.title} variant="fade-up">
                <p className="tx-public-kicker text-sm">0{index + 1}</p>
                <h3 className="mt-4 text-2xl font-semibold text-[#6f3b90]">{category.title}</h3>
                <p className="tx-public-muted mt-3 min-h-12 text-sm leading-6">{category.description}</p>
                <ul className="mt-7 space-y-3">{category.items.map((item) => <li className="flex gap-3 text-sm" key={item}><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#fcaa1d]" aria-hidden="true" /><span>{item}</span></li>)}</ul>
              </MotionPrimitive>
            ))}
          </div>
        </div>
      </section>

      <section className="tx-section-cream">
        <MotionPrimitive className="mx-auto flex max-w-[90rem] flex-col gap-7 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10" variant="fade-up">
          <div className="flex gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#6f3b90] text-white"><Bot className="h-6 w-6" aria-hidden="true" /></span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#fcaa1d]">TARA in {pillar.eyebrow}</p>
              <p className="mt-2 max-w-2xl text-xl font-semibold text-[#6f3b90] sm:text-2xl">&ldquo;{pillar.taraPrompt}&rdquo;</p>
            </div>
          </div>
          <Link className="tx-public-pill inline-flex min-h-12 shrink-0 items-center justify-center gap-2 px-5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#fcaa1d]" href="/tara">Meet TARA<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </MotionPrimitive>
      </section>

      <section className="tx-public-final">
        <MotionPrimitive className="mx-auto flex max-w-[90rem] flex-col gap-6 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10" variant="fade-up">
          <div>
            <p className="text-sm font-semibold">The Teacher Life OS</p>
            <h2 className="mt-3 text-3xl font-semibold">More time for the life you teach for.</h2>
          </div>
          <Link className="tx-public-final-btn inline-flex min-h-12 shrink-0 items-center justify-center gap-2 px-6 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white" href="/signup/teacher">Start Free<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </MotionPrimitive>
      </section>

      <TeachXPublicFooter />
    </main>
  );
}
