import { ArrowRight, BookOpen, GraduationCap, Sparkles, UsersRound } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { MotionPrimitive } from "@/components/brand/motion-primitives";
import { JourneyRedirect, PreferenceLink } from "@/components/landing/journey-preference";

const journeys = [
  {
    journey: "teacher" as const,
    eyebrow: "Teacher",
    headline: "I Teach",
    tagline: "Find Your Favourite Student.",
    description: ["Teach with AI.", "Inspire learners.", "Build your teaching brand.", "Earn through teaching."],
    href: "/teachers",
    button: "Continue as Teacher",
    icon: UsersRound
  },
  {
    journey: "student" as const,
    eyebrow: "Student",
    headline: "I Learn",
    tagline: "Find Your Favourite Teacher.",
    description: ["Discover inspiring teachers.", "Learn with AI.", "Practice every day.", "Achieve your goals."],
    href: "/students",
    button: "Continue as Student",
    icon: GraduationCap
  }
];

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-surface px-5 py-8 text-foreground sm:px-8">
      <JourneyRedirect />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem] bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.16),transparent_58%)]" />
      <div className="pointer-events-none absolute left-8 top-24 -z-10 h-72 w-72 rounded-full bg-brand-blue/10 blur-3xl motion-soft-glow" />
      <div className="pointer-events-none absolute right-0 bottom-20 -z-10 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl motion-soft-glow" />

      <section aria-labelledby="welcome-title" className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col">
        <header className="flex items-center justify-between">
          <BrandLogo />
          <div className="hidden items-center gap-2 rounded-full border border-white/80 bg-white/78 px-4 py-2 text-sm font-semibold text-brand-blue shadow-sm backdrop-blur sm:flex">
            <Sparkles className="h-4 w-4" />
            AI Powered Ecosystem
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <MotionPrimitive variant="fade-right">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-white/82 px-4 py-2 text-sm font-semibold text-brand-blue shadow-sm backdrop-blur">
              <BookOpen className="h-4 w-4" />
              Learn &bull; Teach &bull; Earn
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.02] tracking-normal text-foreground sm:text-6xl lg:text-7xl" id="welcome-title">
              Welcome to TeachX Guru
            </h1>
            <p className="mt-6 max-w-xl text-2xl font-semibold leading-9 text-foreground">
              One AI ecosystem.
              <br />
              Two unique journeys.
            </p>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">Choose the experience that matches why you are here today. TeachX Guru will remember your choice for future visits.</p>
          </MotionPrimitive>

          <MotionPrimitive className="premium-glass-card rounded-[2.5rem] border border-white/80 bg-white/76 p-5 shadow-brand backdrop-blur-2xl sm:p-7" delay="sm" variant="scale">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-brand-blue">Choose Your Journey</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">How do you want to begin?</h2>
            </div>

            <div className="mt-7 grid gap-4 lg:grid-cols-2">
              {journeys.map((journey) => {
                const Icon = journey.icon;

                return (
                  <PreferenceLink className="journey-card premium-glass-card group rounded-[2rem] border border-white/80 bg-white/82 p-6 shadow-brand-soft outline-none backdrop-blur transition duration-brand ease-brand focus:ring-2 focus:ring-primary focus:ring-offset-2" href={journey.href} journey={journey.journey} key={journey.journey}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue-soft text-brand-blue transition duration-brand ease-brand group-hover:scale-105">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{journey.eyebrow}</span>
                    </div>
                    <h3 className="mt-6 text-4xl font-semibold tracking-normal text-foreground">{journey.headline}</h3>
                    <p className="mt-3 text-lg font-semibold text-brand-blue">{journey.tagline}</p>
                    <div className="mt-5 grid gap-2 text-base leading-7 text-muted-foreground">
                      {journey.description.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                    <span className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-brand-button bg-brand-ink px-5 py-4 text-sm font-semibold text-white shadow-brand-soft transition duration-brand ease-brand group-hover:bg-foreground">
                      {journey.button}
                      <ArrowRight className="h-4 w-4 transition-transform duration-brand ease-brand group-hover:translate-x-1" />
                    </span>
                  </PreferenceLink>
                );
              })}
            </div>
          </MotionPrimitive>
        </div>
      </section>
    </main>
  );
}
