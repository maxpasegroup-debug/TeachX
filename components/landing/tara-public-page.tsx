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
    <main className="tx-public-page min-h-screen" data-world="TARA">
      <TeachXPublicHeader />
      <section className="tx-hero-band" aria-labelledby="tara-public-title">
        <span className="tx-blob tx-blob-orange" aria-hidden="true" />
        <span className="tx-blob tx-blob-violet" aria-hidden="true" />
        <MotionPrimitive className="mx-auto grid min-h-[34rem] max-w-[90rem] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-20" variant="fade-up">
          <div className="tx-hero-copy">
            <p className="tx-public-kicker text-2xl">TARA <span aria-hidden="true">&middot;</span> The intelligence inside TeachX</p>
            <h1 className="mt-4 max-w-[12ch] text-5xl font-semibold leading-[1.05] text-[#6f3b90] sm:text-6xl" id="tara-public-title">One AI. Many ways to help.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#4c3d58]">One intelligence. Different roles. One teacher ecosystem.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="tx-public-pill inline-flex min-h-12 items-center justify-center gap-2 px-6 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#fcaa1d] focus:ring-offset-2" href="/signup/teacher">Start Free<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link className="tx-public-ghost inline-flex min-h-12 items-center justify-center px-6 text-sm font-semibold" href="/save-time">See TARA at work</Link>
            </div>
          </div>
          <div className="tx-hero-panel grid gap-3">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <div className="tx-swatch" key={role.title}>
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{role.title}</span>
                </div>
              );
            })}
            <p className="px-1 pt-1 text-xs font-semibold uppercase text-[#6f3b90]">Context aware <span aria-hidden="true">&middot;</span> Permission aware</p>
          </div>
        </MotionPrimitive>
      </section>

      <section className="tx-section-lilac" aria-labelledby="tara-roles-title">
        <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <MotionPrimitive className="mx-auto max-w-3xl pb-10 text-center" variant="fade-up">
            <p className="tx-public-kicker text-lg">One intelligence</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#6f3b90] sm:text-5xl" id="tara-roles-title">The right kind of help for the work in front of you.</h2>
          </MotionPrimitive>
          <div className="tx-color-grid grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <MotionPrimitive className="tx-public-card p-6" delay={index > 1 ? "md" : "sm"} key={role.title} variant="fade-up">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#6f3b90] shadow-sm"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <h3 className="mt-5 text-lg font-semibold text-[#6f3b90]">{role.title}</h3>
                  <p className="tx-public-muted mt-3 text-sm leading-6">{role.description}</p>
                </MotionPrimitive>
              );
            })}
          </div>
        </div>
      </section>

      <section className="tx-section-cream">
        <MotionPrimitive className="mx-auto grid max-w-[90rem] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-24" variant="fade-up">
          <div>
            <span className="grid h-16 w-16 place-items-center rounded-3xl bg-[#6f3b90] text-white"><Bot className="h-8 w-8" aria-hidden="true" /></span>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-[#fcaa1d]">From thought to action</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#6f3b90] sm:text-5xl">TARA works with TeachX, not around it.</h2>
          </div>
          <ol className="grid gap-3">
            {["Understand what you need", "Create a useful result", "Move it into the right TeachX workflow"].map((step, index) => (
              <li className="tx-swatch" key={step}><span>0{index + 1}</span><span>{step}</span></li>
            ))}
          </ol>
        </MotionPrimitive>
      </section>

      <section className="tx-public-final">
        <MotionPrimitive className="mx-auto flex max-w-[90rem] flex-col gap-6 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10" variant="fade-up">
          <div>
            <p className="text-sm font-semibold">Your professional AI partner</p>
            <h2 className="mt-3 text-3xl font-semibold">Meet TARA inside TeachX.</h2>
          </div>
          <Link className="tx-public-final-btn inline-flex min-h-12 shrink-0 items-center justify-center gap-2 px-6 text-sm font-semibold" href="/signup/teacher">Start Free<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </MotionPrimitive>
      </section>
      <TeachXPublicFooter />
    </main>
  );
}
