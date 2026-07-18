import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight, BadgeCheck, BookOpen, Bot, GraduationCap, Sparkles, Store, UsersRound, Wallet } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { MouseParallax } from "@/components/brand/mouse-parallax";
import { MotionPrimitive } from "@/components/brand/motion-primitives";

const navItems = [
  { label: "About", href: "#ecosystem" },
  { label: "Teachers", href: "#ecosystem" },
  { label: "Students", href: "#ecosystem" },
  { label: "Resources", href: "/resources" },
  { label: "Marketplace", href: "/marketplace" }
];

const floatingCards = [
  { label: "AI Lesson Plans", className: "left-[8%] top-[19%] hidden xl:flex", icon: Bot },
  { label: "AI Tutor", className: "right-[10%] top-[18%] hidden xl:flex", icon: Sparkles },
  { label: "Worksheets", className: "left-[3%] top-[52%] hidden lg:flex", icon: BookOpen },
  { label: "Practice Daily", className: "right-[4%] top-[53%] hidden lg:flex", icon: GraduationCap },
  { label: "Marketplace", className: "left-[18%] bottom-[14%] hidden xl:flex", icon: Store },
  { label: "Earn by Teaching", className: "right-[17%] bottom-[13%] hidden xl:flex", icon: Wallet },
  { label: "Certified Programs", className: "left-1/2 top-[9%] hidden -translate-x-1/2 lg:flex", icon: BadgeCheck }
];

const storySteps = [
  { label: "Teachers", icon: UsersRound },
  { label: "AI", icon: Bot },
  { label: "Students", icon: GraduationCap },
  { label: "Growth", icon: Sparkles },
  { label: "Learning", icon: BookOpen },
  { label: "Earning", icon: Wallet }
];

const journeys = [
  {
    title: "Teacher",
    words: ["Teach", "Create", "Grow", "Earn"],
    href: "/signup/teacher",
    button: "Continue as Teacher",
    icon: UsersRound
  },
  {
    title: "Student",
    words: ["Learn", "Practice", "Achieve", "Grow"],
    href: "/signup/student",
    button: "Continue as Student",
    icon: GraduationCap
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-surface text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46rem] bg-[radial-gradient(circle_at_50%_6%,rgba(37,99,235,0.16),transparent_56%)]" />
      <div className="pointer-events-none absolute left-10 top-36 -z-10 h-72 w-72 rounded-full bg-brand-blue/10 blur-3xl motion-soft-glow" />
      <div className="pointer-events-none absolute right-0 top-28 -z-10 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl motion-soft-glow" />

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <BrandLogo />
        <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition duration-brand ease-brand hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href={item.href} key={item.label}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition duration-brand ease-brand hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:inline-flex" href="/login">
            Login
          </Link>
          <Link className="inline-flex h-11 items-center justify-center rounded-brand-button bg-brand-ink px-5 text-sm font-semibold text-white shadow-brand-soft transition duration-brand ease-brand hover:-translate-y-0.5 hover:bg-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href="/welcome">
            Get Started
          </Link>
        </div>
      </header>

      <section aria-labelledby="hero-title" className="cinematic-scroll relative mx-auto w-full max-w-[92rem] px-5 pb-16 pt-8 sm:px-8 lg:pb-24 lg:pt-12">
        <MouseParallax className="cinematic-stage relative min-h-[720px] rounded-[2.4rem] border border-white/70 bg-white/72 px-4 py-8 shadow-brand backdrop-blur-xl sm:px-8 lg:px-10">
          <div className="pointer-events-none absolute inset-0 rounded-[2.4rem] bg-[linear-gradient(115deg,rgba(239,246,255,0.9),rgba(255,255,255,0.52)_42%,rgba(219,234,254,0.68))]" />
          <div className="journey-door journey-door-left pointer-events-none absolute inset-y-6 left-6 hidden w-[calc(50%-1.5rem)] rounded-[2rem] border border-white/50 bg-white/20 backdrop-blur-sm lg:block" />
          <div className="journey-door journey-door-right pointer-events-none absolute inset-y-6 right-6 hidden w-[calc(50%-1.5rem)] rounded-[2rem] border border-white/50 bg-white/20 backdrop-blur-sm lg:block" />
          <div className="platform-ring pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full border border-brand-blue/10 motion-rotate" />
          <div className="platform-glow pointer-events-none absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-blue/10 blur-3xl motion-soft-glow" />

          {floatingCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <div className={`ecosystem-float absolute z-20 items-center gap-2 rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm font-semibold text-foreground shadow-brand-soft backdrop-blur motion-float transition duration-brand ease-brand hover:-translate-y-1 ${card.className}`} key={card.label} style={{ animationDelay: `${index * 120}ms` }}>
                <Icon className="h-4 w-4 text-brand-blue" />
                {card.label}
              </div>
            );
          })}

          <div className="relative z-10 grid min-h-[650px] items-end gap-6 lg:grid-cols-[0.86fr_1.18fr_0.86fr] lg:items-center">
            <MotionPrimitive className="scroll-teacher order-1 mx-auto w-full max-w-[21rem] self-end lg:order-none lg:max-w-none" variant="fade-right">
              <div className="relative h-[25rem] overflow-hidden rounded-[2rem] border border-white/80 bg-white/65 shadow-brand-soft sm:h-[31rem] lg:h-[35rem]">
                <Image alt="Confident modern teacher facing TeachX Guru" className="object-cover object-[42%_center]" fill priority sizes="(max-width: 1024px) 90vw, 28vw" src="/brand/hero-teacher.png" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/20 to-transparent p-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-2 text-xs font-semibold text-brand-blue shadow-sm backdrop-blur">
                    <UsersRound className="h-3.5 w-3.5" />
                    Teacher Growth
                  </div>
                </div>
              </div>
            </MotionPrimitive>

            <MotionPrimitive className="scroll-center order-2 text-center lg:order-none" variant="page">
              <div className="relative mx-auto min-h-[34rem] max-w-3xl">
                <div className="hero-copy absolute inset-x-0 top-1/2 -translate-y-1/2">
                  <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-blue shadow-sm backdrop-blur">
                    <Sparkles className="h-4 w-4" />
                    AI Powered Ecosystem
                  </div>
                  <BrandLogo className="mx-auto mb-8 justify-center" markClassName="h-14 w-14" textClassName="text-center" />
                  <h1 className="mx-auto max-w-3xl text-5xl font-semibold leading-[0.98] tracking-normal text-foreground sm:text-6xl lg:text-7xl" id="hero-title">
                    Where teachers and students grow together.
                  </h1>
                  <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                    Create lessons. Learn faster. Connect together. Grow careers. Earn through knowledge. One AI-powered ecosystem.
                  </p>
                  <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-brand-button bg-brand-ink px-7 text-base font-semibold text-white shadow-brand transition duration-brand ease-brand hover:-translate-y-1 hover:bg-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto" href="/welcome">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link className="inline-flex h-14 w-full items-center justify-center rounded-brand-button border border-border bg-white/80 px-7 text-base font-semibold text-foreground shadow-sm backdrop-blur transition duration-brand ease-brand hover:-translate-y-1 hover:border-brand-blue/30 hover:bg-brand-blue-soft focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto" href="#ecosystem">
                      Explore Platform
                    </Link>
                  </div>

                  <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-3">
                    {storySteps.map((step) => {
                      const Icon = step.icon;

                      return (
                        <div className="rounded-2xl border border-white/80 bg-white/70 px-3 py-3 text-sm font-semibold text-muted-foreground shadow-sm backdrop-blur" key={step.label}>
                          <Icon className="mx-auto mb-2 h-4 w-4 text-brand-blue" />
                          {step.label}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div aria-labelledby="journey-title" className="journey-selection absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-[2rem] border border-white/80 bg-white/72 p-5 text-left shadow-brand backdrop-blur-2xl sm:p-7">
                  <div className="mx-auto max-w-xl text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.26em] text-brand-blue">TeachX Guru</p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl" id="journey-title">Choose Your Journey</h2>
                    <p className="mt-3 leading-7 text-muted-foreground">Step into the ecosystem as a creator of learning or as a learner ready to grow.</p>
                  </div>
                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    {journeys.map((journey) => {
                      const Icon = journey.icon;

                      return (
                        <Link className="journey-card group rounded-[1.5rem] border border-white/80 bg-white/82 p-5 shadow-brand-soft outline-none backdrop-blur transition duration-brand ease-brand hover:-translate-y-2 hover:bg-white focus:ring-2 focus:ring-primary focus:ring-offset-2" href={journey.href} key={journey.title}>
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue-soft text-brand-blue transition duration-brand ease-brand group-hover:scale-105">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="mt-5 text-2xl font-semibold tracking-normal text-foreground">{journey.title}</h3>
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            {journey.words.map((word) => (
                              <span className="rounded-full bg-muted px-3 py-2 text-center text-sm font-semibold text-muted-foreground" key={word}>{word}</span>
                            ))}
                          </div>
                          <span className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-brand-button bg-brand-ink px-4 text-sm font-semibold text-white shadow-brand-soft transition duration-brand ease-brand group-hover:bg-foreground">
                            {journey.button}
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </MotionPrimitive>

            <MotionPrimitive className="scroll-student order-3 mx-auto w-full max-w-[21rem] self-end lg:order-none lg:max-w-none" delay="sm" variant="fade-left">
              <div className="relative h-[25rem] overflow-hidden rounded-[2rem] border border-white/80 bg-white/65 shadow-brand-soft sm:h-[31rem] lg:h-[35rem]">
                <Image alt="Excited student facing TeachX Guru" className="object-cover object-[55%_center]" fill priority sizes="(max-width: 1024px) 90vw, 28vw" src="/brand/hero-student.png" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/20 to-transparent p-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-2 text-xs font-semibold text-brand-blue shadow-sm backdrop-blur">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Student Learning
                  </div>
                </div>
              </div>
            </MotionPrimitive>
          </div>

          <a aria-label="Scroll to explore TeachX Guru" className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground transition duration-brand ease-brand hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href="#ecosystem">
            Scroll
            <span className="flex h-10 w-6 items-start justify-center rounded-full border border-border bg-white/70 p-1 shadow-sm">
              <ArrowDown className="h-3.5 w-3.5 animate-bounce text-brand-blue" />
            </span>
          </a>
        </MouseParallax>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8" id="ecosystem">
        <MotionPrimitive className="grid gap-4 border-t border-border pt-10 sm:grid-cols-3" delay="lg">
          {["AI Powered", "Teacher Marketplace", "Student Learning"].map((item) => (
            <p className="rounded-brand-card bg-muted/60 px-5 py-4 text-sm font-medium text-muted-foreground" key={item}>
              {item}
            </p>
          ))}
        </MotionPrimitive>
      </section>
    </main>
  );
}
