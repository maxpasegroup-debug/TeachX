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
    <main className="min-h-screen overflow-x-hidden bg-[#fbfaf7] text-[#0b2230]">
      <TeachXPublicHeader />

      <section className={`border-b border-[#0b2230]/10 ${pillar.heroTone}`} aria-labelledby="pillar-title">
        <MotionPrimitive className="mx-auto flex min-h-[34rem] max-w-[90rem] flex-col justify-end px-5 py-14 sm:px-8 lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-16 lg:px-10 lg:py-20" variant="fade-up">
          <div>
            <span className={`grid h-12 w-12 place-items-center rounded-md ${pillar.accentTone}`}><Icon className="h-6 w-6" aria-hidden="true" /></span>
            <p className="mt-8 text-xs font-semibold uppercase">{pillar.eyebrow}</p>
            <h1 className="mt-4 max-w-[13ch] text-4xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl" id="pillar-title">{pillar.title}</h1>
          </div>
          <div className="mt-8 lg:mt-0">
            <p className="max-w-xl text-lg leading-8 text-[#40575f]">{pillar.description}</p>
            {pillar.comingSoon ? <p className="mt-6 inline-flex min-h-9 items-center border-y border-current/25 py-2 text-xs font-semibold uppercase">Coming soon</p> : <Link className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-md bg-[#0b2230] px-5 text-sm font-semibold text-white hover:bg-[#0d6174] focus:outline-none focus:ring-2 focus:ring-[#0d6174] focus:ring-offset-2" href="/signup/teacher">Start Free<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
          </div>
        </MotionPrimitive>
      </section>

      <section className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8 lg:px-10 lg:py-24" aria-labelledby="capabilities-title">
        <MotionPrimitive className="grid gap-5 border-b border-[#0b2230]/15 pb-10 lg:grid-cols-[0.8fr_1.2fr]" variant="fade-up">
          <p className="text-xs font-semibold uppercase text-[#66767d]">Inside {pillar.eyebrow}</p>
          <h2 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl" id="capabilities-title">{pillar.statement}</h2>
        </MotionPrimitive>
        <div className="grid md:grid-cols-2 lg:grid-cols-3">
          {pillar.categories.map((category, index) => (
            <MotionPrimitive className="border-b border-[#0b2230]/12 py-8 md:px-7 md:first:pl-0 lg:border-r lg:last:border-r-0" delay={index === 0 ? "none" : "sm"} key={category.title} variant="fade-up">
              <p className="text-xs font-semibold text-[#53666d]">0{index + 1}</p><h3 className="mt-5 text-2xl font-semibold">{category.title}</h3><p className="mt-3 min-h-12 text-sm leading-6 text-[#617078]">{category.description}</p>
              <ul className="mt-7 space-y-3">{category.items.map((item) => <li className="flex gap-3 text-sm" key={item}><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0d6174]" aria-hidden="true" /><span>{item}</span></li>)}</ul>
            </MotionPrimitive>
          ))}
        </div>
      </section>

      <section className="border-y border-[#0b2230]/10 bg-[#dbece9]">
        <MotionPrimitive className="mx-auto flex max-w-[90rem] flex-col gap-7 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10" variant="fade-up">
          <div className="flex gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-[#0b2230] text-[#a9ded7]"><Bot className="h-5 w-5" aria-hidden="true" /></span><div><p className="text-xs font-semibold uppercase text-[#0d6174]">TARA in {pillar.eyebrow}</p><p className="mt-2 max-w-2xl text-xl font-semibold sm:text-2xl">&ldquo;{pillar.taraPrompt}&rdquo;</p></div></div>
          <Link className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md border border-[#0b2230]/25 px-5 text-sm font-semibold hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-[#0d6174]" href="/tara">Meet TARA<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </MotionPrimitive>
      </section>

      <section className="bg-[#0b2230] text-white">
        <MotionPrimitive className="mx-auto flex max-w-[90rem] flex-col gap-6 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10" variant="fade-up">
          <div><p className="text-xs font-semibold uppercase text-[#9ed9d2]">The Teacher Life OS</p><h2 className="mt-3 text-3xl font-semibold">More time for the life you teach for.</h2></div>
          <Link className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-[#f2cd6b] px-6 text-sm font-semibold text-[#102b33] hover:bg-[#ffe19a] focus:outline-none focus:ring-2 focus:ring-white" href="/signup/teacher">Start Free<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </MotionPrimitive>
      </section>

      <TeachXPublicFooter />
    </main>
  );
}
