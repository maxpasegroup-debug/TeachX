import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BadgeCheck, BookOpen, Bot, CircleDollarSign, GraduationCap, MessageCircle, Sparkles, Target, Trophy, UsersRound } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { MotionPrimitive } from "@/components/brand/motion-primitives";
import { SwitchJourneyLink } from "@/components/landing/journey-preference";

type LandingSection = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

export type AudienceLandingConfig = {
  audience: "teacher" | "student";
  eyebrow: string;
  headline: string;
  tagline: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  loginHref: string;
  heroImage: string;
  heroAlt: string;
  heroBadge: string;
  sections: LandingSection[];
  testimonials: Testimonial[];
  finalTitle: string;
  finalDescription: string;
};

const iconMap = {
  Bot,
  BookOpen,
  CircleDollarSign,
  GraduationCap,
  MessageCircle,
  Sparkles,
  Target,
  Trophy,
  UsersRound,
  BadgeCheck
};

export const teacherLanding: AudienceLandingConfig = {
  audience: "teacher",
  eyebrow: "Teacher Journey",
  headline: "Find Your Favourite Student.",
  tagline: "Teach with AI. Inspire learners. Build your teaching brand.",
  description: "Create lessons, publish learning resources, connect with students, and grow a premium teaching presence inside one calm AI ecosystem.",
  primaryHref: "/signup/teacher",
  primaryLabel: "Sign Up as Teacher",
  loginHref: "/login",
  heroImage: "/brand/hero-teacher.png",
  heroAlt: "Modern teacher ready to teach with TeachX Guru",
  heroBadge: "AI powered teaching",
  sections: [
    { title: "Why TeachX Guru", description: "A focused teaching ecosystem for content, students, visibility, and growth without ERP complexity.", icon: iconMap.Sparkles },
    { title: "AI Teaching Tools", description: "Prepare lesson plans, worksheets, question papers, rubrics, notes, and classroom materials faster.", icon: iconMap.Bot },
    { title: "Teacher Marketplace", description: "Build a trusted profile so students can discover your subjects, style, language, and availability.", icon: iconMap.UsersRound },
    { title: "Earn by Teaching", description: "Create a foundation for resource sales, teaching requests, and future paid learning experiences.", icon: iconMap.CircleDollarSign },
    { title: "Community", description: "Share announcements, build relationships, and stay connected with learners and teaching communities.", icon: iconMap.MessageCircle }
  ],
  testimonials: [
    { quote: "TeachX Guru gives teachers a polished place to create, teach, and grow their reputation.", name: "Sample Teacher", role: "Sample testimonial" },
    { quote: "The teacher journey feels focused, modern, and much easier than traditional education software.", name: "Sample Academic Lead", role: "Sample testimonial" }
  ],
  finalTitle: "Ready to grow your teaching brand?",
  finalDescription: "Start your teacher journey and enter a workspace built for creation, connection, and long-term growth."
};

export const studentLanding: AudienceLandingConfig = {
  audience: "student",
  eyebrow: "Student Journey",
  headline: "Find Your Favourite Teacher.",
  tagline: "Learn with AI. Practice daily. Achieve your goals.",
  description: "Discover inspiring teachers, ask AI for help, practice smarter, save resources, and build momentum every day.",
  primaryHref: "/signup/student",
  primaryLabel: "Sign Up as Student",
  loginHref: "/login",
  heroImage: "/brand/hero-student.png",
  heroAlt: "Excited student learning with TeachX Guru",
  heroBadge: "AI powered learning",
  sections: [
    { title: "Discover Great Teachers", description: "Find teachers by subject, class, language, teaching style, and availability.", icon: iconMap.UsersRound },
    { title: "Learn with AI", description: "Ask doubts, simplify topics, translate explanations, and learn at your own pace.", icon: iconMap.Bot },
    { title: "Daily Practice", description: "Build confidence with quizzes, revision, flashcards, homework help, and guided practice.", icon: iconMap.Target },
    { title: "Progress & Achievements", description: "Track learning momentum, strengths, weak areas, streaks, and achievements.", icon: iconMap.Trophy },
    { title: "Learning Community", description: "Stay connected through resources, announcements, discussions, and learning activity.", icon: iconMap.BookOpen }
  ],
  testimonials: [
    { quote: "TeachX Guru makes learning feel guided, simple, and exciting instead of overwhelming.", name: "Sample Student", role: "Sample testimonial" },
    { quote: "The student journey clearly connects AI help, practice, and real teachers.", name: "Sample Parent", role: "Sample testimonial" }
  ],
  finalTitle: "Ready to learn with more confidence?",
  finalDescription: "Start your student journey and enter a learning ecosystem built around practice, support, and progress."
};

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.26em] text-brand-blue">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-normal text-foreground sm:text-4xl lg:text-5xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{description}</p>
    </div>
  );
}

export function AudienceLanding({ config }: { config: AudienceLandingConfig }) {
  return (
    <main className="min-h-screen overflow-hidden bg-surface text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem] bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.14),transparent_58%)]" />
      <div className="pointer-events-none absolute left-6 top-40 -z-10 h-72 w-72 rounded-full bg-brand-blue/10 blur-3xl motion-soft-glow" />
      <div className="pointer-events-none absolute right-0 top-64 -z-10 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl motion-soft-glow" />

      <header className="brand-header sticky top-0 z-50 mx-auto flex w-full max-w-7xl items-center justify-between bg-surface/86 px-5 py-4 backdrop-blur-xl sm:px-8">
        <BrandLogo />
        <nav aria-label={`${config.audience} landing navigation`} className="flex items-center gap-2">
          <Link className="nav-link hidden rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition duration-brand ease-brand hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:inline-flex" href={config.loginHref}>
            Login
          </Link>
          <Link className="premium-button inline-flex h-11 items-center justify-center rounded-brand-button bg-brand-ink px-5 text-sm font-semibold text-white shadow-brand-soft transition duration-brand ease-brand focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href={config.primaryHref}>
            Sign Up
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.95fr_0.85fr] lg:py-16">
        <MotionPrimitive variant="fade-right">
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-brand-blue">{config.eyebrow}</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal text-foreground sm:text-6xl lg:text-7xl">{config.headline}</h1>
          <p className="mt-5 max-w-2xl text-xl font-semibold leading-8 text-foreground">{config.tagline}</p>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">{config.description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="premium-button inline-flex h-14 items-center justify-center gap-2 rounded-brand-button bg-brand-ink px-7 text-base font-semibold text-white shadow-brand transition duration-brand ease-brand focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href={config.primaryHref}>
              {config.primaryLabel}
              <ArrowRight className="h-4 w-4 transition-transform duration-brand ease-brand" />
            </Link>
            <Link className="premium-button-light inline-flex h-14 items-center justify-center rounded-brand-button border border-border bg-white/80 px-7 text-base font-semibold text-foreground shadow-sm backdrop-blur transition duration-brand ease-brand focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href={config.loginHref}>
              Login
            </Link>
          </div>
        </MotionPrimitive>

        <MotionPrimitive className="mx-auto w-full max-w-[28rem]" delay="sm" variant="scale">
          <div className="premium-glass-card relative h-[34rem] overflow-hidden rounded-[2rem] border border-white/80 bg-white/76 shadow-brand backdrop-blur">
            <Image alt={config.heroAlt} className="object-cover object-center" fill priority sizes="(max-width: 1024px) 90vw, 34vw" src={config.heroImage} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/30 to-transparent p-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/86 px-4 py-2 text-sm font-semibold text-brand-blue shadow-sm backdrop-blur">
                <Sparkles className="h-4 w-4" />
                {config.heroBadge}
              </div>
            </div>
          </div>
        </MotionPrimitive>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
        <SectionHeader eyebrow="Experience" title={config.audience === "teacher" ? "Everything a modern teacher needs to begin." : "Everything a modern learner needs to grow."} description="A focused public journey that explains the value clearly before visitors enter authentication." />
        <div className="grid gap-5 lg:grid-cols-3">
          {config.sections.map((section) => {
            const Icon = section.icon;

            return (
              <article className="premium-glass-card rounded-[2rem] border border-white/80 bg-white/76 p-7 shadow-brand-soft backdrop-blur" key={section.title}>
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue-soft text-brand-blue">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-semibold tracking-normal text-foreground">{section.title}</h2>
                <p className="mt-3 leading-7 text-muted-foreground">{section.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
        <SectionHeader eyebrow="Sample Testimonials" title="Built for real stories next." description="These testimonials are clearly marked as samples until launch users share production feedback." />
        <div className="grid gap-5 lg:grid-cols-2">
          {config.testimonials.map((testimonial) => (
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

      <section className="mx-auto w-full max-w-7xl px-5 pb-16 pt-8 sm:px-8">
        <div className="premium-glass-card overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/78 p-8 text-center shadow-brand backdrop-blur-2xl sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-brand-blue">Begin</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">{config.finalTitle}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{config.finalDescription}</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link className="premium-button inline-flex h-14 items-center justify-center gap-2 rounded-brand-button bg-brand-ink px-7 text-base font-semibold text-white shadow-brand transition duration-brand ease-brand focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href={config.primaryHref}>
              {config.primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link className="premium-button-light inline-flex h-14 items-center justify-center rounded-brand-button border border-border bg-white/80 px-7 text-base font-semibold text-foreground shadow-sm backdrop-blur transition duration-brand ease-brand focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href={config.loginHref}>
              Login
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/80 bg-white/70 px-5 py-8 backdrop-blur sm:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            <BrandLogo />
            <p className="mt-3">Learn &bull; Teach &bull; Earn</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link className="hover:text-foreground" href={config.loginHref}>Login</Link>
            <Link className="hover:text-foreground" href={config.primaryHref}>Sign Up</Link>
            <SwitchJourneyLink className="font-semibold text-brand-blue hover:text-foreground">Switch Journey</SwitchJourneyLink>
          </div>
        </div>
      </footer>
    </main>
  );
}
