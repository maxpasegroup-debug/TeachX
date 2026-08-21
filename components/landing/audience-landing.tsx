import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Bot, Brain, CircleDollarSign, Clock3, Heart, Sparkles } from "lucide-react";

import { MotionPrimitive } from "@/components/brand/motion-primitives";
import { TeachXPublicFooter, TeachXPublicHeader } from "@/components/landing/teachx-public-chrome";

type AudienceLandingConfig = {
  audience: "teacher" | "student";
  primaryHref: string;
  primaryLabel: string;
  loginHref: string;
};

export const teacherLanding: AudienceLandingConfig = { audience: "teacher", primaryHref: "/signup/teacher", primaryLabel: "Start Free", loginHref: "/login" };
export const studentLanding: AudienceLandingConfig = { audience: "student", primaryHref: "/signup/student", primaryLabel: "Start Free", loginHref: "/login" };

const worlds: { title: string; line: string; items: string; icon: LucideIcon; tone: string }[] = [
  { title: "Save Time", line: "Give your time back.", items: "Teaching · AI · Planning · Creation · Organization", icon: Clock3, tone: "border-sky-200 bg-sky-50 text-sky-950" },
  { title: "Earn More", line: "Give your knowledge more value.", items: "Teach 1:1 · Publish · Business · Opportunities", icon: CircleDollarSign, tone: "border-emerald-200 bg-emerald-50 text-emerald-950" },
  { title: "Learn More", line: "Invest in yourself.", items: "AI Skills · Audiobooks · Courses · Webinars", icon: Brain, tone: "border-amber-200 bg-amber-50 text-amber-950" },
  { title: "Enjoy More", line: "Life beyond the classroom.", items: "Travel · Family · Wellness · Experiences", icon: Heart, tone: "border-rose-200 bg-rose-50 text-rose-950" }
];

const taraPrompts = ["Plan tomorrow's lessons.", "Create a worksheet.", "Prepare a presentation.", "Help me build my teacher profile.", "Help me learn something new."];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "TeachX Guru",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  description: "A Teacher Life OS for planning, creation, professional growth and teacher business, with TARA as its intelligence layer.",
  offers: [
    { "@type": "Offer", name: "TeachX Basic", price: "199", priceCurrency: "INR" },
    { "@type": "Offer", name: "TeachX Pro", price: "499", priceCurrency: "INR" }
  ]
};

export function AudienceLanding({ config }: { config: AudienceLandingConfig }) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-foreground">
      <TeachXPublicHeader />
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} type="application/ld+json" />

      <section className="relative min-h-[72svh] overflow-hidden border-b" aria-labelledby="public-hero-title">
        <Image alt="A professional teacher planning in a bright modern classroom" className="object-cover object-[62%_center] sm:object-center lg:object-right" fill priority sizes="100vw" src="/teacher-life-os-home.webp" />
        <div className="absolute inset-y-0 left-0 w-full bg-white/88 md:w-[66%] lg:w-[56%]" aria-hidden="true" />
        <MotionPrimitive className="relative z-10 mx-auto flex min-h-[72svh] max-w-7xl items-center px-5 py-14 sm:px-8 lg:px-10" variant="fade-up">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-sky-800"><Sparkles className="h-4 w-4" aria-hidden="true" />Built specifically for teachers</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl" id="public-hero-title">TeachX for teachers.</h1>
            <p className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">Teach better. Work smarter. Live better.</p>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">Plan, create, teach, grow and make more room for life with one Teacher Life OS and TARA beside you.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-foreground px-6 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href={config.primaryHref}>{config.primaryLabel}<ArrowRight className="h-4 w-4" /></Link><Link className="inline-flex min-h-12 items-center justify-center rounded-md border border-foreground bg-white/90 px-6 text-sm font-semibold hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href="#worlds">Explore TeachX</Link></div>
            <p className="mt-4 text-xs text-muted-foreground">Teacher signup uses the existing secure TeachX account flow.</p>
          </div>
        </MotionPrimitive>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24" id="worlds" aria-labelledby="worlds-title">
        <MotionPrimitive variant="fade-up"><p className="text-sm font-semibold text-sky-700">Four worlds. One teacher life.</p><h2 className="mt-2 max-w-3xl text-3xl font-semibold sm:text-4xl" id="worlds-title">Start with what you want more of.</h2></MotionPrimitive>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{worlds.map((world, index) => { const Icon = world.icon; return <MotionPrimitive delay={index > 1 ? "md" : "sm"} key={world.title} variant="fade-up"><article className={`group min-h-64 rounded-md border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg motion-reduce:transform-none ${world.tone}`}><span className="grid h-12 w-12 place-items-center rounded-md bg-white/80"><Icon className="h-6 w-6" aria-hidden="true" /></span><h3 className="mt-8 text-2xl font-semibold">{world.title}</h3><p className="mt-2 font-semibold">{world.line}</p><p className="mt-7 text-sm leading-6 opacity-75">{world.items}</p>{world.title === "Enjoy More" ? <p className="mt-3 text-xs font-semibold uppercase text-rose-700">Coming soon</p> : null}</article></MotionPrimitive>; })}</div>
      </section>

      <section className="border-y bg-[#101c1a] text-white" id="tara" aria-labelledby="tara-title">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:py-24">
          <MotionPrimitive variant="fade-right"><span className="grid h-12 w-12 place-items-center rounded-md bg-[#76d5b2] text-[#101c1a]"><Bot className="h-6 w-6" /></span><p className="mt-6 text-sm font-semibold text-[#9fe3c9]">Meet TARA</p><h2 className="mt-2 text-3xl font-semibold sm:text-4xl" id="tara-title">The intelligence inside TeachX.</h2><p className="mt-5 max-w-xl leading-7 text-white/70">One professional AI partner that understands the teacher workflow and hands work into the TeachX tools already built for it.</p><Link className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-[#101c1a] focus:outline-none focus:ring-2 focus:ring-[#76d5b2] focus:ring-offset-2 focus:ring-offset-[#101c1a]" href={config.primaryHref}>Start with TARA<ArrowRight className="h-4 w-4" /></Link></MotionPrimitive>
          <MotionPrimitive delay="sm" variant="fade-left"><div className="rounded-md border border-white/15 bg-white/5 p-4 sm:p-6"><div className="flex items-center gap-3 border-b border-white/10 pb-4"><span className="grid h-9 w-9 place-items-center rounded-md bg-[#76d5b2] text-[#101c1a]"><Bot className="h-4 w-4" /></span><div><p className="font-semibold">TARA</p><p className="text-xs text-white/55">Professional teacher partner</p></div></div><div className="mt-4 space-y-2">{taraPrompts.map((prompt) => <div className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80" key={prompt}>{prompt}</div>)}</div><p className="mt-4 text-xs leading-5 text-white/50">Examples of supported requests. TARA uses existing TeachX workflows, permissions and AI credits after sign-in.</p></div></MotionPrimitive>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24" aria-labelledby="teacher-life-title">
        <MotionPrimitive className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end" variant="fade-up"><div><p className="text-sm font-semibold text-rose-700">Teacher life</p><h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl" id="teacher-life-title">Your classroom is only one part of your story.</h2></div><div><p className="text-lg leading-8 text-muted-foreground">Teachers give so much of their time to others. TeachX helps give some of that time back.</p><div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold"><span>Teach better.</span><span>Create more.</span><span>Grow professionally.</span><span>Earn from your knowledge.</span><span>Make time for life.</span></div></div></MotionPrimitive>
      </section>

      <section className="bg-sky-700 text-white" aria-labelledby="final-cta-title"><MotionPrimitive className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:py-16" variant="fade-up"><div><h2 className="text-3xl font-semibold sm:text-4xl" id="final-cta-title">Your next chapter starts here.</h2><p className="mt-3 text-white/90">Built for teachers. Powered by TARA.</p></div><Link className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-white px-6 text-sm font-semibold text-sky-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-sky-700" href={config.primaryHref}>{config.primaryLabel}<ArrowRight className="h-4 w-4" /></Link></MotionPrimitive></section>

      <TeachXPublicFooter />
    </main>
  );
}
