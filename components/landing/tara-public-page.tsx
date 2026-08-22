import Link from "next/link";
import { ArrowRight, BookOpen, Bot, BriefcaseBusiness, CalendarDays, Presentation, School } from "lucide-react";

import { MotionPrimitive } from "@/components/brand/motion-primitives";
import { TeachXPublicFooter, TeachXPublicHeader } from "@/components/landing/teachx-public-chrome";

const roles = [
  { title: "Co-Teacher", description: "Prepare lessons, assessments and classroom work.", icon: School },
  { title: "Co-Creator", description: "Shape worksheets, presentations and resources.", icon: Presentation },
  { title: "Planner", description: "Turn priorities into an organized teaching week.", icon: CalendarDays },
  { title: "Business Partner", description: "Improve your profile, portfolio and publishing work.", icon: BriefcaseBusiness },
  { title: "Learning Companion", description: "Find a useful next step for professional growth.", icon: BookOpen },
];

export function TaraPublicPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbfaf7] text-[#0b2230]">
      <TeachXPublicHeader />
      <section className="border-b border-white/10 bg-[#071820] text-white" aria-labelledby="tara-public-title">
        <MotionPrimitive className="mx-auto grid min-h-[38rem] max-w-[90rem] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-10 lg:py-20" variant="fade-up">
          <div><p className="text-xs font-semibold uppercase text-[#9ed9d2]">TARA <span aria-hidden="true">&middot;</span> The intelligence inside TeachX</p><h1 className="mt-5 max-w-[10ch] text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-8xl" id="tara-public-title">One AI. Many ways to help.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-white/70">One intelligence. Different roles. One teacher ecosystem.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#f2cd6b] px-6 text-sm font-semibold text-[#102b33] hover:bg-[#ffe19a] focus:outline-none focus:ring-2 focus:ring-white" href="/signup/teacher">Start Free<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link><Link className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/30 px-6 text-sm font-semibold hover:bg-white/10" href="/save-time">See TARA at work</Link></div></div>
          <div className="relative flex min-h-72 items-center justify-center border-y border-white/15 py-12"><div className="grid h-32 w-32 place-items-center rounded-full border border-[#91d8cf]/45 bg-[#102f38] shadow-[0_0_70px_rgba(145,216,207,0.15)]"><Bot className="h-12 w-12 text-[#a9ded7]" aria-hidden="true" /></div><p className="absolute bottom-5 text-xs font-semibold uppercase text-white/65">Context aware <span aria-hidden="true">&middot;</span> Permission aware</p></div>
        </MotionPrimitive>
      </section>

      <section className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8 lg:px-10 lg:py-24" aria-labelledby="tara-roles-title">
        <MotionPrimitive className="grid gap-6 border-b border-[#0b2230]/15 pb-10 lg:grid-cols-[0.7fr_1.3fr]" variant="fade-up"><p className="text-xs font-semibold uppercase text-[#0d6174]">One intelligence</p><h2 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl" id="tara-roles-title">The right kind of help for the work in front of you.</h2></MotionPrimitive>
        <div className="grid md:grid-cols-2 lg:grid-cols-5">
          {roles.map((role, index) => { const Icon = role.icon; return <MotionPrimitive className="border-b border-[#0b2230]/10 py-7 md:px-5 md:first:pl-0 lg:border-r lg:last:border-r-0" delay={index > 1 ? "md" : "sm"} key={role.title} variant="fade-up"><span className="grid h-10 w-10 place-items-center rounded-md bg-[#dbece9] text-[#0d6174]"><Icon className="h-5 w-5" aria-hidden="true" /></span><h3 className="mt-6 text-lg font-semibold">{role.title}</h3><p className="mt-3 text-sm leading-6 text-[#617078]">{role.description}</p></MotionPrimitive>; })}
        </div>
      </section>

      <section className="bg-[#dbece9]">
        <MotionPrimitive className="mx-auto grid max-w-[90rem] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10 lg:py-24" variant="fade-up">
          <div><p className="text-xs font-semibold uppercase text-[#0d6174]">From thought to action</p><h2 className="mt-3 text-3xl font-semibold sm:text-5xl">TARA works with TeachX, not around it.</h2></div>
          <ol className="border-y border-[#0b2230]/15">{["Understand what you need", "Create a useful result", "Move it into the right TeachX workflow"].map((step, index) => <li className="flex min-h-16 items-center gap-5 border-b border-[#0b2230]/10 py-3 last:border-b-0" key={step}><span className="text-xs text-[#4c6067]">0{index + 1}</span><span className="font-semibold">{step}</span></li>)}</ol>
        </MotionPrimitive>
      </section>

      <section className="bg-[#f2cd6b]"><MotionPrimitive className="mx-auto flex max-w-[90rem] flex-col gap-6 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10" variant="fade-up"><div><p className="text-xs font-semibold uppercase">Your professional AI partner</p><h2 className="mt-3 text-3xl font-semibold">Meet TARA inside TeachX.</h2></div><Link className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-[#0b2230] px-6 text-sm font-semibold text-white hover:bg-[#0d6174]" href="/signup/teacher">Start Free<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></MotionPrimitive></section>
      <TeachXPublicFooter />
    </main>
  );
}
