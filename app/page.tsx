import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight, BadgeCheck, BookOpen, Bot, CheckCircle2, GraduationCap, HelpCircle, School, ShieldCheck, Sparkles, Store, UsersRound, Wallet } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { MouseParallax } from "@/components/brand/mouse-parallax";
import { MotionPrimitive } from "@/components/brand/motion-primitives";

const navItems = [
  { label: "About", href: "#ecosystem" },
  { label: "Teachers", href: "#why-teachx-guru" },
  { label: "Students", href: "#why-teachx-guru" },
  { label: "Resources", href: "/resources" },
  { label: "Marketplace", href: "/marketplace" }
];

const floatingCards = [
  { label: "AI Lesson Plans", className: "left-[18%] top-[14%] hidden xl:flex", icon: Bot },
  { label: "AI Tutor", className: "right-[18%] top-[14%] hidden xl:flex", icon: Sparkles },
  { label: "Worksheets", className: "left-[1.5rem] top-[44%] hidden lg:flex", icon: BookOpen },
  { label: "Practice Daily", className: "right-[1.5rem] top-[44%] hidden lg:flex", icon: GraduationCap },
  { label: "Marketplace", className: "left-[20%] bottom-[10%] hidden xl:flex", icon: Store },
  { label: "Earn by Teaching", className: "right-[20%] bottom-[10%] hidden xl:flex", icon: Wallet },
  { label: "Certified Programs", className: "left-1/2 top-[5%] hidden -translate-x-1/2 lg:flex", icon: BadgeCheck }
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

const trustItems = ["AI Powered", "Teacher Marketplace", "Student Learning", "Secure Platform", "Mobile Friendly", "Built for Schools"];

const whyCards = [
  {
    title: "Teach Smarter",
    description: "Create lessons, worksheets, assessments and classroom resources with AI assistance.",
    icon: Bot
  },
  {
    title: "Learn Better",
    description: "Students receive personalized learning support, practice, and progress tracking.",
    icon: GraduationCap
  },
  {
    title: "Grow Together",
    description: "Connect teachers, students, and learning communities in one ecosystem.",
    icon: UsersRound
  }
];

const workFlows = [
  { audience: "Teacher", steps: ["Create", "Share", "Earn"], icon: UsersRound },
  { audience: "Student", steps: ["Learn", "Practice", "Achieve"], icon: GraduationCap }
];

const audienceCards = [
  { title: "Teachers", description: "Build lessons, resources, profiles, and earning paths.", icon: UsersRound },
  { title: "Students", description: "Learn, practice, save resources, and find teachers.", icon: GraduationCap },
  { title: "Schools", description: "Create a modern AI-ready teaching and learning layer.", icon: School },
  { title: "Parents", description: "Family learning visibility is planned for a later release.", icon: ShieldCheck, soon: true },
  { title: "Institutions", description: "Institution-wide growth tools are coming soon.", icon: Store, soon: true }
];

const platformHighlights = ["AI Studio", "Teacher Marketplace", "Learning Resources", "Communities", "Assessments", "Certificates", "Progress Tracking", "Wallet"];

const previewMetrics = [
  { label: "AI Resources Created", value: "Preview" },
  { label: "Teachers Onboarded", value: "Early Access" },
  { label: "Students Learning", value: "Demo Ready" },
  { label: "Countries Supported", value: "Global Ready" }
];

const testimonials = [
  {
    quote: "TeachX Guru feels like a complete education ecosystem, not another isolated teaching tool.",
    name: "Sample Teacher",
    role: "Sample testimonial"
  },
  {
    quote: "The student journey is clear, calm, and designed around learning progress.",
    name: "Sample Student",
    role: "Sample testimonial"
  },
  {
    quote: "The platform brings AI, resources, and communities into one clean experience.",
    name: "Sample Institution Lead",
    role: "Sample testimonial"
  }
];

const faqs = [
  { question: "What is TeachX Guru?", answer: "TeachX Guru is an AI powered teaching and learning ecosystem for teachers, students, resources, and growth." },
  { question: "Who can join?", answer: "Teachers and students can start today. Schools and institutions can use the platform foundation as their needs expand." },
  { question: "Is it free?", answer: "The platform includes free entry paths. Premium commerce, subscriptions, and provider integrations are prepared separately." },
  { question: "Can schools use it?", answer: "Yes. TeachX Guru is built to support modern teaching, learning, content, and community workflows." },
  { question: "Can teachers earn?", answer: "The ecosystem includes marketplace and commerce architecture so teachers can grow toward earning through knowledge." },
  { question: "How does AI help?", answer: "AI supports lesson creation, study help, practice, summaries, resources, and learning workflows." }
];

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.26em] text-brand-blue">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl lg:text-5xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-surface text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] bg-[radial-gradient(circle_at_50%_6%,rgba(37,99,235,0.12),transparent_58%)]" />
      <div className="pointer-events-none absolute left-10 top-36 -z-10 h-56 w-56 rounded-full bg-brand-blue/10 blur-2xl motion-soft-glow" />
      <div className="pointer-events-none absolute right-0 top-28 -z-10 h-60 w-60 rounded-full bg-brand-gold/10 blur-2xl motion-soft-glow" />

      <header className="brand-header sticky top-0 z-50 mx-auto flex w-full max-w-7xl items-center justify-between bg-surface/84 px-5 py-4 backdrop-blur-xl sm:px-8">
        <BrandLogo />
        <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link className="nav-link rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition duration-brand ease-brand hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href={item.href} key={item.label}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link className="nav-link hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition duration-brand ease-brand hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:inline-flex" href="/login">
            Login
          </Link>
          <Link className="premium-button inline-flex h-11 items-center justify-center rounded-brand-button bg-brand-ink px-5 text-sm font-semibold text-white shadow-brand-soft transition duration-brand ease-brand focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href="/welcome">
            Get Started
          </Link>
        </div>
      </header>

      <section aria-labelledby="hero-title" className="cinematic-scroll relative mx-auto w-full max-w-[92rem] scroll-mt-24 px-5 pb-8 pt-4 sm:px-8 lg:pb-10 lg:pt-6">
        <MouseParallax className="cinematic-stage parallax-depth relative min-h-[620px] rounded-[2rem] border border-white/70 bg-white/78 px-4 py-6 shadow-brand backdrop-blur-md sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 rounded-[2.4rem] bg-[linear-gradient(115deg,rgba(239,246,255,0.9),rgba(255,255,255,0.52)_42%,rgba(219,234,254,0.68))]" />
          <div className="journey-door journey-door-left pointer-events-none absolute inset-y-6 left-6 hidden w-[calc(50%-1.5rem)] rounded-[2rem] border border-white/50 bg-white/20 backdrop-blur-sm lg:block" />
          <div className="journey-door journey-door-right pointer-events-none absolute inset-y-6 right-6 hidden w-[calc(50%-1.5rem)] rounded-[2rem] border border-white/50 bg-white/20 backdrop-blur-sm lg:block" />
          <div className="platform-ring pointer-events-none absolute left-1/2 top-8 h-60 w-60 -translate-x-1/2 rounded-full border border-brand-blue/10 motion-rotate" />
          <div className="platform-glow pointer-events-none absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-blue/10 blur-2xl motion-soft-glow" />

          {floatingCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <div className={`ecosystem-float premium-glass-card absolute z-20 items-center gap-1.5 rounded-xl border border-white/80 bg-white/82 px-3 py-2 text-xs font-semibold text-foreground shadow-brand-soft backdrop-blur motion-float transition duration-brand ease-brand ${card.className}`} key={card.label} style={{ animationDelay: `${index * 173}ms`, animationDuration: `${6.4 + index * 0.37}s` }}>
                <Icon className="h-3.5 w-3.5 text-brand-blue transition-transform duration-brand ease-brand" />
                {card.label}
              </div>
            );
          })}

          <div className="relative z-10 grid min-h-[560px] items-end gap-5 lg:grid-cols-[0.95fr_1.1fr_0.95fr] lg:items-center">
            <MotionPrimitive className="scroll-teacher order-1 mx-auto w-full max-w-[22rem] self-end lg:order-none lg:max-w-none" variant="fade-right">
              <div className="premium-glass-card relative h-[25rem] overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/70 shadow-brand-soft sm:h-[32rem] lg:h-[37rem]">
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
              <div className="relative mx-auto min-h-[31rem] max-w-3xl">
                <div className="hero-copy absolute inset-x-0 top-1/2 -translate-y-1/2">
                  <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-white/90 px-4 py-2 text-sm font-semibold text-brand-blue shadow-sm backdrop-blur">
                    <Sparkles className="h-4 w-4" />
                    AI Powered Ecosystem
                  </div>
                  <BrandLogo className="mx-auto mb-6 justify-center" markClassName="h-14 w-14" textClassName="text-center" />
                  <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-[1.02] tracking-normal text-foreground sm:text-6xl lg:text-6xl xl:text-7xl" id="hero-title">
                    Where teachers and students grow together.
                  </h1>
                  <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                    Create lessons. Learn faster. Connect together. Grow careers. Earn through knowledge. One AI-powered ecosystem.
                  </p>
                  <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link className="premium-button inline-flex h-14 w-full items-center justify-center gap-2 rounded-brand-button bg-brand-ink px-7 text-base font-semibold text-white shadow-brand transition duration-brand ease-brand focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto" href="/welcome">
                      Get Started
                      <ArrowRight className="h-4 w-4 transition-transform duration-brand ease-brand" />
                    </Link>
                    <Link className="premium-button-light inline-flex h-14 w-full items-center justify-center rounded-brand-button border border-border bg-white/80 px-7 text-base font-semibold text-foreground shadow-sm backdrop-blur transition duration-brand ease-brand focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto" href="#ecosystem">
                      Explore Platform
                    </Link>
                  </div>

                  <div className="mx-auto mt-7 grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-3">
                    {storySteps.map((step) => {
                      const Icon = step.icon;

                      return (
                        <div className="premium-soft-tile rounded-2xl border border-white/80 bg-white/70 px-3 py-3 text-sm font-semibold text-muted-foreground shadow-sm backdrop-blur" key={step.label}>
                          <Icon className="mx-auto mb-2 h-4 w-4 text-brand-blue transition-transform duration-brand ease-brand" />
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
                        <Link className="journey-card premium-glass-card group rounded-[1.5rem] border border-white/80 bg-white/82 p-5 shadow-brand-soft outline-none backdrop-blur transition duration-brand ease-brand focus:ring-2 focus:ring-primary focus:ring-offset-2" href={journey.href} key={journey.title}>
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
                            <ArrowRight className="h-4 w-4 transition-transform duration-brand ease-brand group-hover:translate-x-1" />
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </MotionPrimitive>

            <MotionPrimitive className="scroll-student order-3 mx-auto w-full max-w-[22rem] self-end lg:order-none lg:max-w-none" delay="sm" variant="fade-left">
              <div className="premium-glass-card relative h-[25rem] overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/70 shadow-brand-soft sm:h-[32rem] lg:h-[37rem]">
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

          <a aria-label="Scroll to explore TeachX Guru" className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground transition duration-brand ease-brand hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href="#ecosystem">
            Scroll
            <span className="flex h-10 w-6 items-start justify-center rounded-full border border-border bg-white/70 p-1 shadow-sm">
              <ArrowDown className="h-3.5 w-3.5 animate-bounce text-brand-blue" />
            </span>
          </a>
        </MouseParallax>
      </section>

      <section aria-label="TeachX Guru trust signals" className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 pb-10 sm:px-8" id="ecosystem">
        <MotionPrimitive className="grid gap-3 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-6" delay="lg">
          {trustItems.map((item) => (
            <div className="premium-soft-tile flex items-center justify-center gap-2 rounded-brand-card bg-muted/60 px-4 py-4 text-sm font-semibold text-muted-foreground" key={item}>
              <CheckCircle2 className="h-4 w-4 text-brand-blue" />
              {item}
            </div>
          ))}
        </MotionPrimitive>
      </section>

      <section className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-10 sm:px-8" id="why-teachx-guru">
        <SectionHeader eyebrow="Why TeachX Guru" title="Built for the full learning relationship." description="TeachX Guru connects creation, learning, community, and growth without making education feel complicated." />
        <div className="grid gap-5 lg:grid-cols-3">
          {whyCards.map((card) => {
            const Icon = card.icon;

            return (
              <article className="premium-glass-card rounded-[2rem] border border-white/80 bg-white/76 p-7 shadow-brand-soft backdrop-blur" key={card.title}>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue-soft text-brand-blue">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-semibold tracking-normal text-foreground">{card.title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{card.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-10 sm:px-8" id="how-it-works">
        <SectionHeader eyebrow="How It Works" title="Simple journeys. Serious outcomes." description="Teachers and students move through clear paths designed around progress, not platform complexity." />
        <div className="grid gap-5 lg:grid-cols-2">
          {workFlows.map((flow) => {
            const Icon = flow.icon;

            return (
              <article className="premium-glass-card rounded-[2rem] border border-white/80 bg-white/76 p-7 shadow-brand-soft backdrop-blur" key={flow.audience}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue-soft text-brand-blue">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-semibold tracking-normal text-foreground">{flow.audience}</h3>
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {flow.steps.map((step, index) => (
                    <div className="premium-soft-tile rounded-2xl border border-white/80 bg-white/70 p-4 text-center shadow-sm" key={step}>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue">Step {index + 1}</p>
                      <p className="mt-2 text-xl font-semibold text-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-10 sm:px-8" id="who-is-it-for">
        <SectionHeader eyebrow="Who Is It For" title="One ecosystem for every learning role." description="TeachX Guru starts with teachers and students, with future expansion clearly marked." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {audienceCards.map((card) => {
            const Icon = card.icon;

            return (
              <article className="premium-glass-card relative rounded-[1.75rem] border border-white/80 bg-white/76 p-5 shadow-brand-soft backdrop-blur" key={card.title}>
                {card.soon ? <span className="absolute right-4 top-4 rounded-full bg-brand-gold/15 px-3 py-1 text-xs font-semibold text-amber-700">Coming Soon</span> : null}
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-blue-soft text-brand-blue">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-10 sm:px-8" id="platform-highlights">
        <SectionHeader eyebrow="Platform Highlights" title="A concise view of the ecosystem." description="The public experience points toward a connected platform without overwhelming visitors with every feature." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {platformHighlights.map((item) => (
            <div className="premium-soft-tile rounded-2xl border border-white/80 bg-white/70 px-5 py-4 text-sm font-semibold text-muted-foreground shadow-sm backdrop-blur" key={item}>
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-10 sm:px-8" id="preview-metrics">
        <SectionHeader eyebrow="Preview Metrics" title="Launch signals, clearly labeled." description="These are preview and demo readiness indicators until production customer metrics are available." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {previewMetrics.map((metric) => (
            <article className="premium-glass-card rounded-[1.75rem] border border-white/80 bg-white/76 p-6 text-center shadow-brand-soft backdrop-blur" key={metric.label}>
              <p className="text-2xl font-semibold text-brand-blue">{metric.value}</p>
              <p className="mt-3 text-sm font-semibold text-muted-foreground">{metric.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-10 sm:px-8" id="testimonials">
        <SectionHeader eyebrow="Sample Testimonials" title="Designed for future customer stories." description="Placeholder testimonials are clearly marked until real TeachX Guru stories are available." />
        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure className="premium-glass-card rounded-[2rem] border border-white/80 bg-white/76 p-7 shadow-brand-soft backdrop-blur" key={testimonial.name}>
              <blockquote className="text-lg leading-8 text-foreground">
                <span aria-hidden="true">&ldquo;</span>
                {testimonial.quote}
                <span aria-hidden="true">&rdquo;</span>
              </blockquote>
              <figcaption className="mt-6">
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl scroll-mt-24 px-5 py-10 sm:px-8" id="faq">
        <SectionHeader eyebrow="FAQ" title="Clear answers before visitors begin." description="Simple, honest answers help new teachers, students, and institutions understand the ecosystem." />
        <div className="grid gap-3">
          {faqs.map((faq) => (
            <details className="premium-glass-card group rounded-[1.5rem] border border-white/80 bg-white/76 p-5 shadow-sm backdrop-blur" key={faq.question}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-lg font-semibold text-foreground">
                <span>{faq.question}</span>
                <HelpCircle className="h-5 w-5 shrink-0 text-brand-blue transition-transform duration-brand ease-brand group-open:rotate-45" />
              </summary>
              <p className="mt-4 leading-7 text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 pb-14 pt-10 sm:px-8" id="start">
        <div className="premium-glass-card overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/78 p-8 text-center shadow-brand backdrop-blur-2xl sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-brand-blue">Begin</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">Ready to Transform Teaching and Learning?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Start with a teacher or student journey and enter the TeachX Guru ecosystem with clarity and confidence.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link className="premium-button inline-flex h-14 items-center justify-center gap-2 rounded-brand-button bg-brand-ink px-7 text-base font-semibold text-white shadow-brand transition duration-brand ease-brand focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href="/welcome">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link className="premium-button-light inline-flex h-14 items-center justify-center rounded-brand-button border border-border bg-white/80 px-7 text-base font-semibold text-foreground shadow-sm backdrop-blur transition duration-brand ease-brand focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href="#platform-highlights">
              Explore Platform
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/80 bg-white/70 px-5 py-10 backdrop-blur sm:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <BrandLogo />
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">TeachX Guru is an AI powered teaching and learning ecosystem for teachers, students, and education communities.</p>
            <p className="mt-4 text-sm font-medium text-muted-foreground">teachx.guru</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Explore</h2>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <Link className="hover:text-foreground" href="#why-teachx-guru">Why TeachX Guru</Link>
              <Link className="hover:text-foreground" href="#how-it-works">How It Works</Link>
              <Link className="hover:text-foreground" href="#platform-highlights">Platform</Link>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Start</h2>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <Link className="hover:text-foreground" href="/signup/teacher">Teacher Signup</Link>
              <Link className="hover:text-foreground" href="/signup/student">Student Signup</Link>
              <Link className="hover:text-foreground" href="/login">Login</Link>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Connect</h2>
            <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
              <span>Social links coming soon</span>
              <span>Contact: hello@teachx.guru</span>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-3 border-t border-border/70 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 TeachX Guru. All rights reserved.</p>
          <p>Learn &bull; Teach &bull; Earn</p>
        </div>
      </footer>
    </main>
  );
}
