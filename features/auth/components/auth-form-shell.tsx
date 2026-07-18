import type { ReactNode } from "react";
import { BadgeCheck, BookOpen, LockKeyhole, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { MotionPrimitive } from "@/components/brand/motion-primitives";

type AuthFormShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  journey?: "login" | "teacher" | "student" | "recovery";
};

const visualCopy = {
  login: {
    eyebrow: "Welcome Back",
    title: "Return to your TeachX Guru ecosystem.",
    description: "Pick up where learning, teaching, resources, and growth continue together.",
    icon: Sparkles
  },
  teacher: {
    eyebrow: "Teacher Journey",
    title: "Create, teach, grow, and earn with AI beside you.",
    description: "Build a professional education presence from a calm, premium workspace.",
    icon: UsersRound
  },
  student: {
    eyebrow: "Student Journey",
    title: "Learn faster with guidance that feels personal.",
    description: "Practice, discover teachers, save resources, and keep your goals moving.",
    icon: BookOpen
  },
  recovery: {
    eyebrow: "Secure Recovery",
    title: "A quiet reset back into the ecosystem.",
    description: "Recover access with a focused, privacy-first flow.",
    icon: LockKeyhole
  }
};

const trustItems = [
  { label: "Secure Authentication", icon: ShieldCheck },
  { label: "Privacy First", icon: LockKeyhole },
  { label: "Trusted by Teachers", icon: BadgeCheck },
  { label: "AI Powered Learning", icon: Sparkles }
];

export function AuthFormShell({ title, subtitle, children, journey = "login" }: AuthFormShellProps) {
  const copy = visualCopy[journey];
  const Icon = copy.icon;

  return (
    <main className="relative min-h-screen overflow-hidden bg-surface px-5 py-8 text-foreground sm:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem] bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.16),transparent_58%)]" />
      <div className="pointer-events-none absolute left-8 top-32 -z-10 h-72 w-72 rounded-full bg-brand-blue/10 blur-3xl motion-soft-glow" />
      <div className="pointer-events-none absolute right-0 bottom-24 -z-10 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl motion-soft-glow" />

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <BrandLogo />
        <a className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition duration-brand ease-brand hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href="/">
          Back Home
        </a>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-7rem)] w-full max-w-7xl items-center gap-10 py-10 lg:grid-cols-[0.95fr_0.8fr]">
        <MotionPrimitive className="order-2 lg:order-1" variant="fade-right">
          <div className="relative overflow-hidden rounded-[2.25rem] border border-white/75 bg-white/65 p-7 shadow-brand backdrop-blur-xl sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-blue/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-8 left-8 h-24 w-24 rounded-full border border-brand-blue/15 motion-rotate" />
            <div className="relative">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-white/80 px-4 py-2 text-sm font-semibold text-brand-blue shadow-sm">
                <Icon className="h-4 w-4" />
                {copy.eyebrow}
              </div>
              <h2 className="max-w-2xl text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl">{copy.title}</h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">{copy.description}</p>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {trustItems.map((item) => {
                  const TrustIcon = item.icon;

                  return (
                    <div className="rounded-2xl border border-white/80 bg-white/70 px-4 py-4 text-sm font-semibold text-muted-foreground shadow-sm backdrop-blur" key={item.label}>
                      <TrustIcon className="mb-3 h-5 w-5 text-brand-blue" />
                      {item.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </MotionPrimitive>

        <MotionPrimitive className="order-1 lg:order-2" variant="scale">
          <section aria-labelledby="auth-title" className="rounded-[2rem] border border-white/80 bg-white/78 p-6 shadow-brand backdrop-blur-2xl sm:p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-ink text-sm font-semibold text-white shadow-brand-soft">TX</div>
              <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl" id="auth-title">{title}</h1>
              <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </section>
        </MotionPrimitive>
      </section>
    </main>
  );
}
