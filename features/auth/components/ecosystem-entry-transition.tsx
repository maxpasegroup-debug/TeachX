"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, BadgeCheck, BookOpen, Bot, Brain, CheckCircle2, Clock3, GraduationCap, Heart, Sparkles, UsersRound, WalletCards } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";

type EcosystemEntryTransitionProps = {
  name?: string | null;
  mode?: "login" | "signup";
  journey?: "teacher" | "student" | "dashboard";
  nextPath: string;
};

const statusByJourney = {
  teacher: [
    "Loading Teacher Workspace",
    "Connecting AI Assistant",
    "Preparing Teaching Resources",
    "Syncing Your Dashboard"
  ],
  student: [
    "Loading Student Workspace",
    "Preparing Learning Resources",
    "Connecting AI Tutor",
    "Syncing Your Progress"
  ],
  dashboard: [
    "Loading Your Workspace",
    "Connecting AI Assistant",
    "Preparing Resources",
    "Syncing Your Dashboard"
  ]
};

const icons = [UsersRound, Bot, BookOpen, GraduationCap];

const teacherFirstSteps = [
  { title: "Save Time", description: "Plan, create, teach, and organize.", href: "/teacher/life/save-time", icon: Clock3 },
  { title: "Earn More", description: "Build your profile and publish your knowledge.", href: "/teacher/life/earn-more", icon: WalletCards },
  { title: "Learn More", description: "Grow your AI and professional skills.", href: "/teacher/life/learn-more", icon: Brain },
  { title: "Enjoy More", description: "See what is coming beyond the classroom.", href: "/teacher/life/enjoy-more", icon: Heart },
  { title: "Ask TARA", description: "Start with your AI partner inside TeachX.", href: "/tara", icon: Bot }
];

export function EcosystemEntryTransition({ name, mode = "login", journey = "dashboard", nextPath }: EcosystemEntryTransitionProps) {
  const showTeacherWelcome = mode === "signup" && journey === "teacher";

  useEffect(() => {
    if (showTeacherWelcome) return;
    const timeout = window.setTimeout(() => {
      window.location.replace(nextPath);
    }, 950);

    return () => window.clearTimeout(timeout);
  }, [nextPath, showTeacherWelcome]);

  if (showTeacherWelcome) {
    return (
      <main className="min-h-screen bg-surface px-4 py-8 text-foreground sm:px-6 sm:py-12">
        <section className="mx-auto w-full max-w-4xl">
          <div className="flex justify-center"><BrandLogo markClassName="h-12 w-12" /></div>
          <div className="mx-auto mt-7 max-w-2xl text-center">
            <div className="inline-flex min-h-10 items-center gap-2 rounded-full border bg-background px-4 text-sm font-semibold text-brand-blue">
              <CheckCircle2 className="h-4 w-4" /> Your 7-day trial is active
            </div>
            <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Welcome{name ? `, ${name}` : ""}</h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground">What would you like to do first?</p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {teacherFirstSteps.map((item) => {
              const Icon = item.icon;
              return (
                <Link className="group flex min-h-28 items-center gap-4 rounded-lg border bg-background p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-blue/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue" href={item.href} key={item.title}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-blue-soft text-brand-blue"><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1 text-left"><strong className="block text-base">{item.title}</strong><span className="mt-1 block text-sm leading-5 text-muted-foreground">{item.description}</span></span>
                  <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-brand-blue" />
                </Link>
              );
            })}
            <Link className="flex min-h-12 items-center justify-center rounded-lg border bg-background px-4 text-sm font-semibold hover:border-brand-blue/40 sm:col-span-2" href="/teacher">Go to Teacher Home</Link>
          </div>
        </section>
      </main>
    );
  }

  const headline = mode === "signup" ? "Welcome to TeachX Guru" : "Welcome Back";
  const statusItems = statusByJourney[journey];

  return (
    <main aria-busy="true" aria-live="polite" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-5 py-10 text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem] bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.18),transparent_58%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/10 blur-3xl motion-soft-glow" />
      <div className="entry-orbit pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-blue/10" />
      <div className="entry-particle left-[18%] top-[24%]" />
      <div className="entry-particle right-[20%] top-[28%]" />
      <div className="entry-particle bottom-[22%] left-[25%]" />
      <div className="entry-particle bottom-[26%] right-[24%]" />

      <section className="premium-glass-card motion-scale w-full max-w-xl rounded-[2.25rem] border border-white/80 bg-white/76 p-7 text-center shadow-brand backdrop-blur-2xl sm:p-9">
        <div className="mx-auto mb-7 flex justify-center">
          <BrandLogo className="entry-logo-pulse" markClassName="h-16 w-16" textClassName="text-center" />
        </div>
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-brand-blue-soft px-4 py-2 text-sm font-semibold text-brand-blue">
          <Sparkles className="h-4 w-4" />
          Preparing Your Workspace
        </div>
        <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">{name ? `${headline}, ${name}` : headline}</h1>
        <p className="mx-auto mt-4 max-w-md leading-7 text-muted-foreground">Getting everything ready so you can step into the ecosystem without the usual hard page jump.</p>

        <div className="entry-progress mt-8 h-1.5 overflow-hidden rounded-full bg-muted">
          <span className="block h-full rounded-full bg-brand-blue" />
        </div>

        <div className="mt-8 grid gap-3 text-left">
          {statusItems.map((item, index) => {
            const Icon = icons[index] ?? BadgeCheck;

            return (
              <div className="premium-soft-tile flex items-center gap-3 rounded-2xl border border-white/80 bg-white/68 px-4 py-3 text-sm font-semibold text-muted-foreground shadow-sm" key={item}>
                <CheckCircle2 className="h-4 w-4 text-brand-blue" />
                <Icon className="h-4 w-4 text-brand-blue" />
                {item}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
