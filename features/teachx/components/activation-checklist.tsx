"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Circle, PartyPopper, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ActivationRole = "teacher" | "student";

type ActivationStep = {
  id: string;
  title: string;
  description: string;
  href: string;
};

type ActivationChecklistProps = {
  role: ActivationRole;
  name?: string | null;
  profileCompletionPercentage?: number;
};

const checklistCopy: Record<ActivationRole, { eyebrow: string; intro: string; steps: ActivationStep[] }> = {
  teacher: {
    eyebrow: "Teacher activation",
    intro: "Set up the essentials for teaching, creating, publishing, and inviting learners into your world.",
    steps: [
      { id: "profile", title: "Complete Profile", description: "Add your photo, bio, subjects, languages, and teaching mode.", href: "/profile" },
      { id: "lesson", title: "Create Your First Lesson", description: "Start a useful lesson outline from your workspace.", href: "/teacher/resources" },
      { id: "ai-lesson", title: "Generate Your First AI Lesson", description: "Open AI Studio and prepare your first AI-assisted lesson.", href: "/teacher/ai-studio" },
      { id: "resource", title: "Publish Your First Teaching Resource", description: "Save or publish a classroom-ready resource.", href: "/teacher/resources" },
      { id: "invite", title: "Invite Your First Student", description: "Prepare your teaching presence and share your profile.", href: "/teacher/marketplace" }
    ]
  },
  student: {
    eyebrow: "Student activation",
    intro: "Personalize learning, meet the right teacher, and begin your first AI-supported study session.",
    steps: [
      { id: "profile", title: "Complete Profile", description: "Add your class, board, language, and learning goals.", href: "/profile" },
      { id: "interests", title: "Choose Learning Interests", description: "Tell TeachX Guru what subjects and goals matter most.", href: "/profile" },
      { id: "teacher", title: "Find Your Favourite Teacher", description: "Explore teachers who match your learning style.", href: "/student/teachers" },
      { id: "ai-session", title: "Start Your First AI Learning Session", description: "Ask a doubt or make a topic easier with AI Tutor.", href: "/student/ask-ai" },
      { id: "activity", title: "Complete Your First Learning Activity", description: "Practice, revise, or study flashcards to build momentum.", href: "/student/practice" }
    ]
  }
};

function storageKey(role: ActivationRole) {
  return `teachx-guru.activation.${role}`;
}

function hiddenKey(role: ActivationRole) {
  return `teachx-guru.activation.${role}.complete`;
}

function readStoredSteps(role: ActivationRole) {
  try {
    const raw = window.localStorage.getItem(storageKey(role));
    return raw ? new Set<string>(JSON.parse(raw) as string[]) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

export function ActivationChecklist({ role, name, profileCompletionPercentage }: ActivationChecklistProps) {
  const [mounted, setMounted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(() => new Set());
  const [isHidden, setIsHidden] = useState(false);
  const copy = checklistCopy[role];

  useEffect(() => {
    const stored = readStoredSteps(role);
    if ((profileCompletionPercentage ?? 0) >= 100) {
      stored.add("profile");
    }

    setCompletedSteps(stored);
    setIsHidden(window.localStorage.getItem(hiddenKey(role)) === "true");
    setMounted(true);
  }, [profileCompletionPercentage, role]);

  useEffect(() => {
    if (!mounted) return;
    window.localStorage.setItem(storageKey(role), JSON.stringify(Array.from(completedSteps)));
  }, [completedSteps, mounted, role]);

  const firstName = name?.split(" ").filter(Boolean)[0] ?? "there";
  const completedCount = useMemo(() => copy.steps.filter((step) => completedSteps.has(step.id)).length, [completedSteps, copy.steps]);
  const progress = Math.round((completedCount / copy.steps.length) * 100);
  const isComplete = completedCount === copy.steps.length;

  if (!mounted || isHidden) {
    return null;
  }

  function toggleStep(stepId: string) {
    setCompletedSteps((current) => {
      const next = new Set(current);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  }

  function finishOnboarding() {
    window.localStorage.setItem(hiddenKey(role), "true");
    setIsHidden(true);
  }

  return (
    <section aria-labelledby={`${role}-activation-heading`}>
      <Card className="overflow-hidden border-sky-100 bg-gradient-to-br from-white via-sky-50/70 to-white shadow-soft">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[320px_1fr] lg:p-7">
          <div className="rounded-[1.5rem] border border-white/70 bg-white/85 p-5 shadow-sm">
            <Badge>{copy.eyebrow}</Badge>
            <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 shadow-sm">
              {isComplete ? <PartyPopper className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
            </div>
            <h2 id={`${role}-activation-heading`} className="mt-5 text-2xl font-semibold tracking-tight">
              Welcome to TeachX Guru, {firstName}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{isComplete ? "Your first-time setup is complete. Your workspace is ready for daily momentum." : copy.intro}</p>
            <div className="mt-6 rounded-2xl border border-border bg-background p-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold">{progress}%</p>
                  <p className="mt-1 text-sm text-muted-foreground">{isComplete ? "Activated" : "Getting Started"}</p>
                </div>
                <Badge>{completedCount}/{copy.steps.length} done</Badge>
              </div>
              <Progress className="mt-4" value={progress} />
            </div>
            {isComplete ? (
              <Button className="mt-5 w-full" onClick={finishOnboarding} type="button">
                Continue to Workspace
              </Button>
            ) : null}
          </div>

          <div className="grid gap-3">
            {copy.steps.map((step, index) => {
              const isDone = completedSteps.has(step.id);
              return (
                <div className={cn("group grid gap-4 rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 sm:grid-cols-[auto_1fr_auto] sm:items-center", isDone ? "border-sky-200" : "border-border")} key={step.id}>
                  <button
                    aria-label={`${isDone ? "Mark incomplete" : "Mark complete"}: ${step.title}`}
                    className={cn("flex h-10 w-10 items-center justify-center rounded-full border transition focus:outline-none focus:ring-2 focus:ring-primary", isDone ? "border-sky-200 bg-sky-50 text-sky-700" : "border-border bg-background text-muted-foreground hover:text-sky-700")}
                    onClick={() => toggleStep(step.id)}
                    type="button"
                  >
                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                  </button>
                  <div>
                    <p className="text-xs font-medium uppercase text-sky-700">Step {index + 1}</p>
                    <h3 className="mt-1 font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
                  </div>
                  <Link className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary" href={step.href}>
                    Open
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </section>
  );
}
