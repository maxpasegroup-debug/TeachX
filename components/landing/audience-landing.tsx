import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BookOpen, Bot, BriefcaseBusiness, Clock3, Heart } from "lucide-react";

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

const worlds: { title: string; line: string; detail: string; href: string; icon: LucideIcon; tone: string; iconTone: string }[] = [
  { title: "Save Time", line: "Give your time back.", detail: "Teaching, creation, planning and organization.", href: "/save-time", icon: Clock3, tone: "border-[#b8d8df] bg-[#e8f3f4] text-[#123b46]", iconTone: "bg-[#c9e5e9]" },
  { title: "Earn More", line: "Give your knowledge more value.", detail: "Teaching, publishing and professional growth.", href: "/earn-more", icon: BriefcaseBusiness, tone: "border-[#c6dcc8] bg-[#edf4eb] text-[#244b34]", iconTone: "bg-[#d8e9d8]" },
  { title: "Learn More", line: "Invest in yourself.", detail: "AI skills, courses, books and webinars.", href: "/learn-more", icon: BookOpen, tone: "border-[#e8d59f] bg-[#faf2d9] text-[#624c17]", iconTone: "bg-[#f1e1b4]" },
  { title: "Enjoy More", line: "Life beyond the classroom.", detail: "Future teacher experiences, clearly coming soon.", href: "/enjoy-more", icon: Heart, tone: "border-[#e6c7cb] bg-[#f8e9e9] text-[#6b3038]", iconTone: "bg-[#efd5d8]" },
];

const taraRoles = ["Co-Teacher", "Co-Creator", "Planner", "Business Partner", "Learning Companion", "Future Travel Buddy"];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "TeachX Guru",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  description: "The Teacher Life OS for teaching, creation, planning, professional growth and learning, with TARA as its intelligence layer.",
  offers: [
    { "@type": "Offer", name: "TeachX Basic", price: "199", priceCurrency: "INR" },
    { "@type": "Offer", name: "TeachX Pro", price: "499", priceCurrency: "INR" },
  ],
};

export function AudienceLanding({ config }: { config: AudienceLandingConfig }) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fbfaf7] text-[#0b2230]">
      <TeachXPublicHeader />
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} type="application/ld+json" />

      <section className="relative h-[calc(100svh-8rem)] min-h-[32.5rem] max-h-[52rem] overflow-hidden bg-[#071820]" aria-labelledby="public-hero-title">
        <Image alt="A professional teacher planning with a tablet in a bright classroom" className="object-cover object-[61%_center] sm:object-[58%_center] lg:object-center" fill priority sizes="100vw" src="/teacher-life-os-home.webp" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(5,23,31,0.96)_0%,rgba(5,23,31,0.78)_47%,rgba(5,23,31,0.12)_100%)] md:bg-[linear-gradient(90deg,rgba(5,23,31,0.97)_0%,rgba(5,23,31,0.9)_39%,rgba(5,23,31,0.23)_72%,rgba(5,23,31,0.06)_100%)]" aria-hidden="true" />
        <MotionPrimitive className="relative z-10 mx-auto flex h-full max-w-[90rem] items-end px-5 pb-10 pt-10 sm:px-8 sm:pb-14 md:items-center lg:px-10" variant="fade-up">
          <div className="max-w-3xl text-white">
            <p className="text-xs font-semibold uppercase text-[#9ed9d2] sm:text-sm">The Teacher Life OS</p>
            <h1 className="mt-4 max-w-[13ch] text-4xl font-semibold leading-[1.06] sm:text-5xl lg:text-7xl" id="public-hero-title">More time for the life you teach for.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">Your teaching, AI, growth and learning in one intelligent workspace, powered by TARA.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#f2cd6b] px-6 text-sm font-semibold text-[#132b32] transition hover:bg-[#ffe19a] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#071820]" href={config.primaryHref}>{config.primaryLabel}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/45 bg-black/10 px-6 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white" href="#worlds">Explore TeachX</Link>
            </div>
            <p className="mt-4 text-xs text-white/60">7-day free trial <span aria-hidden="true">&middot;</span> Simple setup</p>
          </div>
        </MotionPrimitive>
      </section>

      <section className="mx-auto max-w-[90rem] px-5 pb-16 pt-6 sm:px-8 sm:py-16 lg:px-10 lg:py-24" id="worlds" aria-labelledby="worlds-title">
        <MotionPrimitive className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between" variant="fade-up">
          <div><p className="text-xs font-semibold uppercase text-[#0d6174]">One ecosystem, four worlds</p><h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight sm:text-5xl" id="worlds-title">Start with what matters to you now.</h2></div>
          <p className="max-w-sm text-base leading-7 text-[#617078]">TeachX brings the working life and wider ambitions of a teacher into one clear place.</p>
        </MotionPrimitive>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {worlds.map((world, index) => {
            const Icon = world.icon;
            return (
              <MotionPrimitive delay={index > 1 ? "md" : "sm"} key={world.title} variant="fade-up">
                <Link className={`group flex min-h-72 flex-col rounded-lg border p-6 shadow-[0_14px_35px_rgba(8,29,38,0.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(8,29,38,0.12)] focus:outline-none focus:ring-2 focus:ring-[#0d6174] motion-reduce:transform-none ${world.tone}`} href={world.href}>
                  <span className={`grid h-11 w-11 place-items-center rounded-md ${world.iconTone}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <p className="mt-10 text-xs font-semibold uppercase">{world.title}</p><h3 className="mt-2 text-2xl font-semibold">{world.line}</h3><p className="mt-4 text-sm leading-6">{world.detail}</p>
                  <span className="mt-auto flex items-center gap-2 pt-8 text-sm font-semibold">Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
                </Link>
              </MotionPrimitive>
            );
          })}
        </div>
      </section>

      <section className="border-y border-[#0b2230]/10 bg-[#dbece9]" id="tara" aria-labelledby="tara-title">
        <div className="mx-auto grid max-w-[90rem] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10 lg:py-24">
          <MotionPrimitive variant="fade-right">
            <span className="grid h-12 w-12 place-items-center rounded-md bg-[#0b2230] text-[#a9ded7]"><Bot className="h-6 w-6" aria-hidden="true" /></span>
            <p className="mt-7 text-xs font-semibold uppercase text-[#0d6174]">TARA</p><h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight sm:text-5xl" id="tara-title">Your professional AI partner.</h2><p className="mt-5 max-w-xl text-lg leading-8 text-[#4e676c]">One intelligence that understands where you are in TeachX and helps you move from an idea to real teaching work.</p>
            <Link className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-md bg-[#0b2230] px-5 text-sm font-semibold text-white hover:bg-[#0d6174] focus:outline-none focus:ring-2 focus:ring-[#0d6174] focus:ring-offset-2" href="/tara">Meet TARA<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </MotionPrimitive>
          <MotionPrimitive delay="sm" variant="fade-left">
            <div className="border-y border-[#0b2230]/15">
              {taraRoles.map((role, index) => <div className="flex min-h-14 items-center justify-between border-b border-[#0b2230]/10 py-3 last:border-b-0" key={role}><span className="text-sm text-[#4c6067]">0{index + 1}</span><span className="text-lg font-semibold text-[#0b2230]">{role}</span></div>)}
            </div>
          </MotionPrimitive>
        </div>
      </section>

      <section className="bg-[#fbfaf7]" aria-labelledby="teacher-life-title">
        <MotionPrimitive className="mx-auto grid max-w-[90rem] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:px-10 lg:py-24" variant="fade-up">
          <div><p className="text-xs font-semibold uppercase text-[#9a4f56]">Teacher life</p><h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl" id="teacher-life-title">Your classroom is part of your story. Not all of it.</h2></div>
          <div><p className="text-lg leading-8 text-[#617078]">Teachers give so much of their time to others. TeachX is designed to give some of it back, for better teaching, professional growth and more room for life.</p></div>
        </MotionPrimitive>
      </section>

      <section className="bg-[#f2cd6b] text-[#102b33]" aria-labelledby="final-cta-title">
        <MotionPrimitive className="mx-auto flex max-w-[90rem] flex-col gap-7 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-16" variant="fade-up">
          <div><p className="text-xs font-semibold uppercase">Built for teachers. Powered by TARA.</p><h2 className="mt-3 text-3xl font-semibold sm:text-4xl" id="final-cta-title">Make time for what comes next.</h2></div>
          <Link className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-[#0b2230] px-6 text-sm font-semibold text-white hover:bg-[#0d6174] focus:outline-none focus:ring-2 focus:ring-[#0b2230] focus:ring-offset-2 focus:ring-offset-[#f2cd6b]" href={config.primaryHref}>{config.primaryLabel}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </MotionPrimitive>
      </section>

      <TeachXPublicFooter />
    </main>
  );
}
