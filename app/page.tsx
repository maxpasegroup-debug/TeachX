import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Sparkles, Store, UsersRound } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { MotionPrimitive } from "@/components/brand/motion-primitives";

const navItems = [
  { label: "About", href: "#about" },
  { label: "Teachers", href: "#teachers" },
  { label: "Students", href: "#students" },
  { label: "Resources", href: "/resources" },
  { label: "Marketplace", href: "/marketplace" }
];

const ecosystemCards = [
  { id: "teachers", title: "Teachers", description: "Create, publish, teach, and grow from one focused professional workspace.", icon: UsersRound },
  { id: "students", title: "Students", description: "Learn with guided practice, trusted resources, and calm AI-supported study flows.", icon: GraduationCap },
  { id: "resources", title: "Resources", description: "Discover reusable learning material, notes, worksheets, and classroom-ready content.", icon: BookOpen },
  { id: "marketplace", title: "Marketplace", description: "Connect learning demand with teaching talent through a premium education network.", icon: Store }
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-surface text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.14),transparent_58%)]" />
      <div className="pointer-events-none absolute right-0 top-28 -z-10 h-72 w-72 rounded-full bg-brand-blue/10 blur-3xl motion-soft-glow" />

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

      <section className="mx-auto grid w-full max-w-7xl gap-12 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.02fr_0.82fr] lg:items-center lg:pb-28 lg:pt-24">
        <MotionPrimitive className="max-w-4xl" variant="page">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-brand-blue-soft px-4 py-2 text-sm font-medium text-brand-blue">
            <Sparkles className="h-4 w-4" />
            TeachX Guru
          </div>
          <h1 className="text-5xl font-semibold leading-[1.02] tracking-normal text-foreground sm:text-6xl lg:text-7xl">
            A global education ecosystem for people who learn, teach, and earn.
          </h1>
          <p className="mt-6 text-2xl font-medium text-brand-blue">Learn &bull; Teach &bull; Earn</p>
          <p className="mt-6 max-w-2xl text-xl leading-9 text-muted-foreground">The AI Powered Teaching &amp; Learning Ecosystem built around teachers, students, resources, and opportunity.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex h-14 items-center justify-center gap-2 rounded-brand-button bg-brand-ink px-7 text-base font-semibold text-white shadow-brand transition duration-brand ease-brand hover:-translate-y-1 hover:bg-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href="/welcome">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link className="inline-flex h-14 items-center justify-center rounded-brand-button border border-border bg-surface px-7 text-base font-semibold text-foreground shadow-sm transition duration-brand ease-brand hover:-translate-y-1 hover:border-brand-blue/30 hover:bg-brand-blue-soft focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href="/login">
              Login
            </Link>
          </div>
        </MotionPrimitive>

        <MotionPrimitive className="relative" delay="md" variant="scale">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-brand-gold/20 blur-2xl" />
          <div className="rounded-brand-shell border border-border bg-white/90 p-4 shadow-brand backdrop-blur">
            <div className="rounded-[1.6rem] bg-gradient-to-br from-white via-brand-blue-soft to-white p-5">
              <div className="grid gap-4">
                {ecosystemCards.map((card, index) => {
                  const Icon = card.icon;

                  return (
                    <a className="group rounded-brand-card border border-white/80 bg-white/90 p-5 shadow-sm transition duration-brand ease-brand hover:-translate-y-1 hover:shadow-brand-soft focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href={`#${card.id}`} key={card.title} style={{ animationDelay: `${120 + index * 70}ms` }}>
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-blue-soft text-brand-blue transition duration-brand ease-brand group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h2 className="text-lg font-semibold tracking-normal">{card.title}</h2>
                      <p className="mt-2 leading-7 text-muted-foreground">{card.description}</p>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </MotionPrimitive>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8" id="about">
        <MotionPrimitive className="grid gap-4 border-t border-border pt-10 sm:grid-cols-3" delay="lg">
          {["Premium identity", "Human ecosystem", "AI powered foundation"].map((item) => (
            <p className="rounded-brand-card bg-muted/60 px-5 py-4 text-sm font-medium text-muted-foreground" key={item}>
              {item}
            </p>
          ))}
        </MotionPrimitive>
      </section>
    </main>
  );
}
