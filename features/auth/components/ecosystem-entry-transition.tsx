"use client";

import { useEffect } from "react";
import { BadgeCheck, BookOpen, Bot, CheckCircle2, GraduationCap, Sparkles, UsersRound } from "lucide-react";

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

export function EcosystemEntryTransition({ name, mode = "login", journey = "dashboard", nextPath }: EcosystemEntryTransitionProps) {
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.location.replace(nextPath);
    }, 950);

    return () => window.clearTimeout(timeout);
  }, [nextPath]);

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

      <section className="motion-scale w-full max-w-xl rounded-[2.25rem] border border-white/80 bg-white/76 p-7 text-center shadow-brand backdrop-blur-2xl sm:p-9">
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
              <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/68 px-4 py-3 text-sm font-semibold text-muted-foreground shadow-sm" key={item}>
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
