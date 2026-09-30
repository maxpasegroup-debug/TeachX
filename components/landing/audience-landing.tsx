import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Bot, BriefcaseBusiness, CalendarDays, Clock3, Compass, Heart, LifeBuoy, LockKeyhole, MonitorSmartphone, PenLine, ShieldCheck, Sparkles, Wallet, type LucideIcon } from "lucide-react";

import { MotionPrimitive } from "@/components/brand/motion-primitives";
import { RevealOnView } from "@/components/landing/reveal-on-view";
import { TeachXPublicFooter, TeachXPublicHeader } from "@/components/landing/teachx-public-chrome";

type AudienceLandingConfig = {
  audience: "teacher" | "student";
  primaryHref: string;
  primaryLabel: string;
  loginHref: string;
};

export const teacherLanding: AudienceLandingConfig = { audience: "teacher", primaryHref: "/signup/teacher", primaryLabel: "Start Free", loginHref: "/login" };
export const studentLanding: AudienceLandingConfig = { audience: "student", primaryHref: "/signup/student", primaryLabel: "Start Free", loginHref: "/login" };

const worlds: { title: string; line: string; detail: string; href: string; icon: LucideIcon }[] = [
  { title: "Save Time", line: "Give your time back.", detail: "Teaching, creation, planning and organization.", href: "/save-time", icon: Clock3 },
  { title: "Earn More", line: "Give your knowledge more value.", detail: "Teaching, publishing and professional growth.", href: "/earn-more", icon: BriefcaseBusiness },
  { title: "Learn More", line: "Invest in yourself.", detail: "AI skills, courses, books and webinars.", href: "/learn-more", icon: BookOpen },
  { title: "Enjoy More", line: "Life beyond the classroom.", detail: "Future teacher experiences, clearly coming soon.", href: "/enjoy-more", icon: Heart },
];

const taraRoles = ["Co-Teacher", "Co-Creator", "Planner", "Business Partner", "Learning Companion", "Future Travel Buddy"];

const trustPoints: { title: string; body: string; icon: LucideIcon; href?: string; link?: string }[] = [
  { title: "Made for teaching professionals", body: "TeachX is one professional workspace for teachers.", icon: Sparkles },
  { title: "Mobile and desktop ready", body: "Core public and teacher pages use layouts for phones, tablets and larger screens.", icon: MonitorSmartphone },
  { title: "7-day free trial", body: "Teachers can begin with a 7-day free trial and choose a plan when they are ready.", icon: CalendarDays },
  { title: "No payment to begin", body: "Starting does not create a subscription or charge a card. Paid activation follows the existing billing workflow.", icon: Wallet },
  { title: "Teacher-controlled content", body: "Plans, materials and AI-assisted outputs stay with the teacher to review before classroom or marketplace use.", icon: PenLine },
  { title: "Privacy-conscious AI", body: "Teachers should keep unnecessary student personal data out of AI prompts, and review output before it is used or shared.", icon: LockKeyhole },
  { title: "One platform, four directions", body: "Save Time, Earn More and Learn More are open now. Enjoy More is clearly marked as coming soon.", icon: Compass },
  { title: "Help is accessible", body: "Teachers can reach the TeachX team through the public contact page when they need support.", icon: LifeBuoy, href: "/contact", link: "Open support" },
];

const faqs = [
  { question: "What is TeachX?", answer: "TeachX is the Teacher Life OS. It brings teaching, AI, professional growth and learning into one workspace, with TARA as the intelligence inside it." },
  { question: "How does the free trial work?", answer: "Teachers can start with a 7-day free trial. After that, TeachX Basic is ₹199 per month and TeachX Pro is ₹499 per month, plus applicable taxes." },
  { question: "Do I need a card to begin?", answer: "No. Starting does not create a subscription or charge a card. Paid activation follows the existing TeachX billing workflow after signup." },
  { question: "What can TARA help with?", answer: "TARA can help as a co-teacher, co-creator, planner, business partner and learning companion. It works inside TeachX, and teachers review the result before they use it." },
  { question: "Which parts are available now?", answer: "Save Time, Earn More and Learn More are open now. Enjoy More is a future destination and is clearly marked coming soon. There are no offers, bookings or prices there yet." },
  { question: "How do I get help?", answer: "Use the public contact page to reach the TeachX team. Privacy, trust and pricing details are also linked from the footer." },
];

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
    <main className="tx-page min-h-screen text-[#24182c]">
      <TeachXPublicHeader />
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} type="application/ld+json" />

      <section className="tx-hero relative overflow-hidden" aria-labelledby="public-hero-title">
        <style>{`
          .tx-page { background: #f7f4fc; color: #24182c; }
          .tx-page { overflow-x: clip; }
          .tx-hero { background: linear-gradient(180deg, #f3e9fb 0%, #f7f4fc 100%); min-height: calc(100svh - 4.5rem); display: flex; align-items: center; }
          .tx-float { position: absolute; z-index: 2; display: inline-flex; align-items: center; justify-content: center; min-height: 2.5rem; border-radius: 999px; background: #fcaa1d; color: #6f3b90; padding: 0.4rem 0.95rem; font-size: 0.875rem; font-weight: 600; line-height: 1; box-shadow: 0 12px 28px rgba(252, 170, 29, 0.28); white-space: nowrap; }
          .tx-float:hover { background: #fcaa1d; filter: brightness(0.92); }
          .tx-float-0 { top: 12%; left: 0; }
          .tx-float-1 { top: 12%; right: 0; }
          .tx-float-2 { bottom: 16%; left: 0; }
          .tx-float-3 { bottom: 16%; right: 0; }
          .tx-hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; margin-top: 2rem; }
          .tx-hero-actions a { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; min-height: 3rem; padding: 0.75rem 1.75rem; white-space: nowrap; }
          .tx-final-row { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; }
          @media (max-width: 767px) { .tx-final-row { flex-direction: column; align-items: flex-start; } }
          .tx-world { display: flex; min-height: 16rem; flex-direction: column; border-radius: 1.5rem; background: linear-gradient(160deg, #ffe7a3 0%, #fcaa1d 58%, #fcaa1d 100%); padding: 1.4rem; color: #6f3b90; border: 2px solid #fff; box-shadow: 0 16px 40px rgba(252, 170, 29, 0.22); transition: transform 0.25s ease, box-shadow 0.25s ease; }
          .tx-world:hover { transform: translateY(-6px); box-shadow: 0 22px 48px rgba(252, 170, 29, 0.32); }
          .tx-world .tx-muted { color: #5c3d12; }
          .tx-world .tx-world-icon { background: #fff; color: #fcaa1d; }
          .tx-world-more { color: #6f3b90; }
          .tx-world-icon { display: grid; height: 2.75rem; width: 2.75rem; place-items: center; border-radius: 999px; background: #f3e8ff; color: #6f3b90; }
          .tx-benefit { display: flex; align-items: center; gap: 0.9rem; border-radius: 1.25rem; background: #f8f2fc; padding: 0.9rem 1rem; }
          .tx-role { border: 2px solid #fcaa1d; }
          .tx-life-photo { position: relative; width: min(100%, 22rem); aspect-ratio: 1; margin-inline: auto; overflow: hidden; border-radius: 999px; background: #e7d6f6; box-shadow: 0 24px 50px rgba(111, 59, 144, 0.16); }
          .tx-life-photo img { object-fit: cover; object-position: center 8%; }
          .tx-worlds { background: linear-gradient(180deg, #f7f1fb 0%, #e4d0f0 22%, #6f3b90 62%, #6f3b90 100%); color: #6f3b90; }
          .tx-final { background: linear-gradient(120deg, #8a56a6 0%, #6f3b90 52%, #5a3176 100%); color: #fff; }
          .tx-final-btn { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; min-height: 3rem; padding: 0.75rem 1.75rem; background: #fcaa1d; color: #6f3b90; border-radius: 999px; white-space: nowrap; }
          .tx-final-btn:hover { background: #fcaa1d; filter: brightness(0.92); }
          .tx-hero-grid { display: flex; flex-direction: column; align-items: stretch; gap: 1.5rem; }
          .tx-hero-copy { order: 2; }
          .tx-stage { order: 1; }
          @media (max-width: 1023px) {
            .tx-hero { min-height: 0; align-items: flex-start; }
            .tx-floats { display: none; }
            .tx-stage { width: min(100%, 22rem); }
            .tx-display { font-size: clamp(2.15rem, 9vw, 3rem); }
            .tx-hero-actions { margin-top: 1.25rem; }
          }
          @media (prefers-reduced-motion: reduce) {
            .tx-world { transition: none; }
            .tx-world:hover { transform: none; }
          }
          .tx-stage { position: relative; width: min(100%, 34rem); aspect-ratio: 1; margin-inline: auto; }
          .tx-blob { position: absolute; border-radius: 9999px; filter: blur(2px); }
          .tx-blob-a { inset: 6% 2% 10% 8%; background: #6f3b90; opacity: 0.22; }
          .tx-blob-b { width: 46%; height: 46%; right: -4%; top: 6%; background: #6f3b90; opacity: 0.35; }
          .tx-blob-c { width: 28%; height: 28%; left: 0; bottom: 8%; background: #efe4f8; }
          .tx-ornament { position: absolute; inset: -4%; width: 108%; height: 108%; }
          .tx-disc { position: absolute; inset: 7%; overflow: hidden; border-radius: 9999px; background: #e7d6f6; box-shadow: 0 28px 60px rgba(111, 59, 144, 0.18); }
          .tx-disc img { object-fit: cover; object-position: center 6%; }
          .tx-kicker { color: #6f3b90; font-style: italic; }
          .tx-display { color: #1b1524; font-size: clamp(2.8rem, 5.2vw, 5.4rem); line-height: 1.02; max-width: 11ch; }
          .tx-muted { color: #6d6574; }
          .tx-trust { background: #fff; }
          .tx-trust-layout { display: grid; gap: 3rem; }
          @media (min-width: 1024px) { .tx-trust-layout { grid-template-columns: 0.85fr 1.15fr; align-items: start; } }
          .tx-trust-grid { display: grid; gap: 1.75rem 2rem; }
          @media (min-width: 640px) { .tx-trust-grid { grid-template-columns: 1fr 1fr; } }
          .tx-trust-shield { display: grid; height: 3.25rem; width: 3.25rem; place-items: center; border-radius: 1rem; background: #6f3b90; color: #fff; }
          .tx-trust-item { display: flex; gap: 0.9rem; align-items: flex-start; }
          .tx-trust-icon { display: grid; height: 2.5rem; width: 2.5rem; flex: none; place-items: center; border-radius: 999px; }
          .tx-trust-grid > :nth-child(4n+1) .tx-trust-icon { background: #f3e8ff; color: #6f3b90; }
          .tx-trust-grid > :nth-child(4n+2) .tx-trust-icon { background: #fff1d6; color: #fcaa1d; }
          .tx-trust-grid > :nth-child(4n+3) .tx-trust-icon { background: #ffe4f3; color: #9d174d; }
          .tx-trust-grid > :nth-child(4n+4) .tx-trust-icon { background: #ede9fe; color: #6f3b90; }
          .tx-trust-link { color: #6f3b90; font-weight: 600; }
          .tx-faq { background: #f7f1fb; }
          .tx-faq-list { display: grid; gap: 0.75rem; max-width: 46rem; margin: 2rem auto 0; }
          .tx-faq-item { background: #fff; border: 2px solid #fcaa1d; border-radius: 1.25rem; padding: 0.15rem 1.15rem; }
          .tx-page .tx-faq-item { opacity: 1; transform: none; animation: none; }
          .tx-page .tx-faq-item summary { display: flex; min-height: 3.4rem; cursor: pointer; list-style: none; align-items: center; justify-content: space-between; gap: 1rem; font-weight: 600; color: #1b1524; opacity: 1; transform: none; }
          .tx-faq-item summary::-webkit-details-marker { display: none; }
          .tx-faq-item summary::after { content: "+"; color: #fcaa1d; font-size: 1.45rem; line-height: 1; }
          .tx-faq-item[open] summary::after { content: "\\2013"; }
          .tx-faq-item p { margin: 0 0 1rem; color: #6d6574; line-height: 1.65; }
          .tx-pill { background: #fcaa1d; color: #6f3b90; }
          .tx-pill:hover { background: #fcaa1d; filter: brightness(0.92); }
          .tx-ghost { border: 1.5px solid #fcaa1d; color: #fcaa1d; background: #fff; }
          .tx-ghost:hover { background: #f3e9fa; }
          @media (min-width: 1024px) {
            .tx-hero { min-height: calc(100svh - 4.5rem); align-items: center; }
            .tx-hero-grid { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 1rem; }
            .tx-hero-copy, .tx-stage { order: 0; }
            .tx-stage { width: min(46vw, 40rem); }
            .tx-floats { display: block; }
          }
          @media (max-width: 1023px) {
            .tx-display { font-size: clamp(2.15rem, 9vw, 3rem); }
            .tx-stage { width: min(100%, 22rem); }
          }
          @keyframes tx-in { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
          @keyframes tx-pop { 0% { opacity: 0; transform: scale(0.78); } 70% { opacity: 1; transform: scale(1.045); } 100% { opacity: 1; transform: scale(1); } }
          @keyframes tx-scroll-up { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: none; } }
          @keyframes tx-scroll-pop { from { opacity: 0; transform: translateY(36px) scale(0.92); } to { opacity: 1; transform: none; } }
          .tx-page .motion-fade-up, .tx-page .motion-fade-left, .tx-page .motion-fade-right, .tx-page .motion-scale { animation: none; }
          .tx-page .tx-in, .tx-page .tx-pop { opacity: 0; }
          html[data-hero="ready"] .tx-page .tx-in { animation: tx-in 0.72s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
          html[data-hero="ready"] .tx-page .tx-in-1 { animation-delay: 0.05s; }
          html[data-hero="ready"] .tx-page .tx-in-2 { animation-delay: 0.2s; }
          html[data-hero="ready"] .tx-page .tx-in-3 { animation-delay: 0.36s; }
          html[data-hero="ready"] .tx-page .tx-in-4 { animation-delay: 0.5s; }
          html[data-hero="ready"] .tx-page .tx-pop { animation: tx-pop 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.12s forwards; }
          .tx-page .tx-scroll, .tx-page .tx-scroll-pop { animation-name: tx-scroll-up; animation-duration: auto; animation-timing-function: linear; animation-fill-mode: both; animation-timeline: view(); animation-range: entry 0% cover 30%; }
          .tx-page .tx-scroll-pop { animation-name: tx-scroll-pop; }
          .tx-page .tx-d1 { animation-range: entry 6% cover 36%; }
          .tx-page .tx-d2 { animation-range: entry 12% cover 42%; }
          .tx-page .tx-d3 { animation-range: entry 18% cover 48%; }
          .tx-role-list .tx-role { opacity: 0; transform: translateY(56px); transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
          .tx-role-list.is-shown .tx-role { opacity: 1; transform: none; }
          .tx-role-list.is-shown .tx-role:nth-child(2) { transition-delay: 0.08s; }
          .tx-role-list.is-shown .tx-role:nth-child(3) { transition-delay: 0.16s; }
          .tx-role-list.is-shown .tx-role:nth-child(4) { transition-delay: 0.24s; }
          .tx-role-list.is-shown .tx-role:nth-child(5) { transition-delay: 0.32s; }
          .tx-role-list.is-shown .tx-role:nth-child(6) { transition-delay: 0.4s; }
          .tx-world-row { display: grid; gap: 1.25rem; }
          .tx-world-row .tx-deal { opacity: 0; transform: translateY(40px); transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
          .tx-world-row.is-shown .tx-deal { opacity: 1; transform: none; }
          .tx-world-row.is-shown .tx-deal-1 { transition-delay: 0.1s; }
          .tx-world-row.is-shown .tx-deal-2 { transition-delay: 0.2s; }
          .tx-world-row.is-shown .tx-deal-3 { transition-delay: 0.3s; }
          @media (min-width: 640px) { .tx-world-row { grid-template-columns: 1fr 1fr; } }
          @media (min-width: 1280px) {
            .tx-world-row { grid-template-columns: repeat(4, 1fr); }
            .tx-world-row .tx-deal { position: relative; opacity: 1; }
            .tx-world-row:not(.is-shown) .tx-deal-0 { transform: none; z-index: 4; }
            .tx-world-row:not(.is-shown) .tx-deal-1 { transform: translateX(calc(-100% - 1.25rem)); z-index: 3; }
            .tx-world-row:not(.is-shown) .tx-deal-2 { transform: translateX(calc(-200% - 2.5rem)); z-index: 2; }
            .tx-world-row:not(.is-shown) .tx-deal-3 { transform: translateX(calc(-300% - 3.75rem)); z-index: 1; }
            .tx-world-row.is-shown .tx-deal { transform: none; }
            .tx-world-row.is-shown .tx-deal-1 { transition-delay: 0.14s; }
            .tx-world-row.is-shown .tx-deal-2 { transition-delay: 0.28s; }
            .tx-world-row.is-shown .tx-deal-3 { transition-delay: 0.42s; }
          }
          @supports not (animation-timeline: view()) {
            .tx-page .tx-scroll, .tx-page .tx-scroll-pop { animation-duration: 0.75s; animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1); animation-timeline: auto; animation-range: normal; }
          }
          @media (prefers-reduced-motion: reduce) {
            .tx-page .tx-in, .tx-page .tx-pop, .tx-page .tx-scroll, .tx-page .tx-scroll-pop, .tx-page .tx-deal, .tx-role-list .tx-role, .tx-page .tx-world-row:not(.is-shown) .tx-deal { opacity: 1; transform: none; animation: none; transition: none; }
          }
          html[data-motion="reduce"] .tx-page .tx-in, html[data-motion="reduce"] .tx-page .tx-pop, html[data-motion="reduce"] .tx-page .tx-scroll, html[data-motion="reduce"] .tx-page .tx-scroll-pop, html[data-motion="reduce"] .tx-page .tx-deal, html[data-motion="reduce"] .tx-role-list .tx-role, html[data-motion="reduce"] .tx-page .tx-world-row:not(.is-shown) .tx-deal { opacity: 1; transform: none; animation: none; transition: none; }
        `}</style>
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 700">
          <g fill="none" stroke="#dccfeb" strokeWidth="1.4">
            <path d="M-20 120c80-50 160-50 240 0s160 50 240 0 160-50 240 0 160 50 240 0 160-50 240 0" />
            <path d="M-20 190c90-46 170-46 250 0s160 46 250 0 160-46 250 0 160 46 250 0" />
            <path d="M-40 280c100-60 200-60 300 0s200 60 300 0 200-60 300 0 200 60 300 0" />
            <path d="M-20 380c80-40 150-40 230 0s150 40 230 0 150-40 230 0 150 40 230 0 150-40 230 0" />
            <path d="M-30 490c110-55 210-55 320 0s210 55 320 0 210-55 320 0" />
            <path d="M-20 590c90-42 180-42 270 0s180 42 270 0 180-42 270 0 180 42 270 0" />
          </g>
        </svg>
        <div aria-hidden="true" className="pointer-events-none absolute h-px w-px overflow-hidden">
          <Image alt="" height={8} priority quality={60} sizes="(min-width: 640px) 100vw, 1px" src="/teacher-life-os-home.webp" width={8} />
        </div>
        <div className="tx-hero-grid relative mx-auto w-full max-w-[90rem] px-5 py-8 sm:px-8 lg:py-10">
          <div className="tx-hero-copy">
            <p className="tx-kicker tx-in tx-in-1 text-2xl sm:text-3xl">The Teacher Life OS</p>
            <h1 className="tx-display tx-in tx-in-2 mt-3 font-semibold" id="public-hero-title">More time for the life you teach for.</h1>
            <p className="tx-muted tx-in tx-in-3 mt-6 max-w-md text-base leading-7 sm:text-lg">Your teaching, AI, growth and learning in one intelligent workspace, powered by TARA.</p>
            <div className="tx-hero-actions tx-in tx-in-4">
              <Link className="tx-pill gap-2 rounded-full px-7 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#fcaa1d] focus:ring-offset-2" href={config.primaryHref}>{config.primaryLabel}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link className="tx-ghost rounded-full px-7 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#fcaa1d] focus:ring-offset-2" href="#worlds">Explore TeachX</Link>
            </div>
          </div>
          <div className="tx-stage tx-pop">
            <span className="tx-blob tx-blob-a" aria-hidden="true" />
            <span className="tx-blob tx-blob-b" aria-hidden="true" />
            <span className="tx-blob tx-blob-c" aria-hidden="true" />
            <svg aria-hidden="true" className="tx-ornament" viewBox="0 0 400 400">
              <path d="M70 48c18-22 28-8 22 12-8 24-28 18-22-12z" fill="#6f3b90" />
              <path d="M318 70c16-18 28-6 20 12-10 22-28 16-20-12z" fill="#6f3b90" />
              <path d="M46 250c20-16 34 0 22 18-14 20-32 12-22-18z" fill="#6f3b90" />
              <path d="M92 36a170 170 0 0 0-58 150" fill="none" stroke="#6f3b90" strokeDasharray="8 10" strokeLinecap="round" strokeWidth="3" />
              <circle cx="330" cy="300" fill="#6f3b90" r="8" />
              <circle cx="64" cy="150" fill="#6f3b90" r="6" />
            </svg>
            <div className="tx-disc">
              <Image alt="A teacher with a book, ready to help" fill sizes="(min-width: 1024px) 40rem, 90vw" src="/brand/teacher-portrait.png" />
            </div>
            <div className="tx-floats">
              {worlds.map((world, index) => (
                <Link className={`tx-float tx-float-${index}`} href={world.href} key={world.href}>{world.title}</Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="tx-worlds" id="worlds" aria-labelledby="worlds-title">
        <div className="mx-auto max-w-[90rem] px-5 pb-16 pt-8 sm:px-8 sm:py-16 lg:px-10 lg:py-24">
        <MotionPrimitive className="tx-scroll mx-auto max-w-3xl text-center" variant="fade-up">
          <p className="tx-kicker text-lg">One ecosystem, four worlds</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-5xl" id="worlds-title">Start with what matters to you now.</h2>
          <p className="tx-muted mx-auto mt-4 max-w-xl text-base leading-7">TeachX brings the working life and wider ambitions of a teacher into one clear place.</p>
        </MotionPrimitive>
        <RevealOnView className="tx-world-row mt-10">
          {worlds.map((world, index) => {
            const Icon = world.icon;
            return (
              <div className={`tx-deal tx-deal-${index}`} key={world.title}>
                <Link className="tx-world focus:outline-none focus:ring-2 focus:ring-[#6f3b90] focus:ring-offset-2" href={world.href}>
                  <span className="tx-world-icon"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <h3 className="mt-5 text-xl font-semibold">{world.title}</h3>
                  <p className="tx-muted mt-2 text-sm leading-6">{world.line} {world.detail}</p>
                  <span className="tx-world-more mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold">View more <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></span>
                </Link>
              </div>
            );
          })}
        </RevealOnView>
        </div>
      </section>

      <section className="bg-white" id="tara" aria-labelledby="tara-title">
        <div className="mx-auto grid max-w-[90rem] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-24">
          <MotionPrimitive className="tx-scroll" variant="fade-right">
            <span className="tx-world-icon"><Bot className="h-5 w-5" aria-hidden="true" /></span>
            <p className="tx-kicker mt-6 text-lg">TARA</p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight sm:text-5xl" id="tara-title">Your professional AI partner.</h2>
            <p className="tx-muted mt-5 max-w-xl text-lg leading-8">One intelligence that understands where you are in TeachX and helps you move from an idea to real teaching work.</p>
            <Link className="tx-pill mt-7 inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#6f3b90] focus:ring-offset-2" href="/tara">Meet TARA<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </MotionPrimitive>
          <RevealOnView className="tx-role-list grid gap-3">
            {taraRoles.map((role, index) => <div className="tx-benefit tx-role" key={role}><span className="tx-world-icon text-sm font-semibold">0{index + 1}</span><span className="text-lg font-semibold">{role}</span></div>)}
          </RevealOnView>
        </div>
      </section>

      <section aria-labelledby="teacher-life-title">
        <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-24">
          <MotionPrimitive className="tx-scroll" variant="fade-up">
            <p className="tx-kicker text-lg">Teacher life</p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight sm:text-5xl" id="teacher-life-title">Your classroom is part of your story. Not all of it.</h2>
            <p className="tx-muted mt-5 max-w-xl text-lg leading-8">Teachers give so much of their time to others. TeachX is designed to give some of it back, for better teaching, professional growth and more room for life.</p>
            <ul className="mt-6 grid gap-3">
              {worlds.slice(0, 3).map((world, index) => {
                const Icon = world.icon;
                return <li className={`tx-benefit tx-scroll tx-scroll-pop tx-d${index}`} key={world.href}><span className="tx-world-icon"><Icon className="h-5 w-5" aria-hidden="true" /></span><span className="font-semibold">{world.line}</span></li>;
              })}
            </ul>
          </MotionPrimitive>
          <MotionPrimitive className="tx-scroll tx-scroll-pop" delay="sm" variant="fade-up">
            <div className="tx-life-photo">
              <Image alt="" fill sizes="22rem" src="/brand/teacher-portrait.png" />
            </div>
          </MotionPrimitive>
        </div>
      </section>

      <section className="tx-final" aria-labelledby="final-cta-title">
        <MotionPrimitive className="tx-final-row tx-scroll mx-auto max-w-[90rem] px-5 py-16 sm:px-8 lg:px-10" variant="fade-up">
          <div><p className="text-sm font-semibold">Built for teachers. Powered by TARA.</p><h2 className="mt-3 text-3xl font-semibold sm:text-4xl" id="final-cta-title">Make time for what comes next.</h2></div>
          <Link className="tx-final-btn inline-flex min-h-12 shrink-0 items-center justify-center gap-2 px-7 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#6f3b90]" href={config.primaryHref}>{config.primaryLabel}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </MotionPrimitive>
      </section>

      {config.audience === "teacher" ? (
        <section className="tx-trust" aria-labelledby="trust-title">
          <div className="tx-trust-layout mx-auto max-w-[90rem] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
            <MotionPrimitive className="tx-scroll" variant="fade-up">
              <span className="tx-trust-shield"><ShieldCheck className="h-6 w-6" aria-hidden="true" /></span>
              <p className="tx-kicker mt-6 text-lg">What you can trust today</p>
              <h2 className="mt-3 max-w-md text-4xl font-semibold leading-tight text-[#1b1524] sm:text-5xl" id="trust-title">Clear promises, backed by the product.</h2>
              <p className="tx-muted mt-5 max-w-md text-base leading-7">TeachX is still growing. These are the practical capabilities and safeguards available to teachers today.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="tx-pill inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#fcaa1d] focus:ring-offset-2" href="/contact">Contact TeachX</Link>
                <Link className="tx-ghost inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#fcaa1d] focus:ring-offset-2" href="/privacy">Read Privacy Notice</Link>
              </div>
            </MotionPrimitive>
            <div className="tx-trust-grid">
              {trustPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <div className="tx-trust-item tx-scroll tx-scroll-pop" key={point.title}>
                    <span className="tx-trust-icon"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                    <div>
                      <h3 className="font-semibold text-[#1b1524]">{point.title}</h3>
                      <p className="tx-muted mt-1 text-sm leading-6">{point.body}</p>
                      {point.href && point.link ? <Link className="tx-trust-link mt-2 inline-flex text-sm" href={point.href}>{point.link}</Link> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {config.audience === "teacher" ? (
        <section className="tx-faq" aria-labelledby="faq-title">
          <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
            <MotionPrimitive className="tx-scroll mx-auto max-w-2xl text-center" variant="fade-up">
              <p className="tx-kicker text-lg">Before you start</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#1b1524] sm:text-5xl" id="faq-title">Frequently asked questions</h2>
            </MotionPrimitive>
            <div className="tx-faq-list">
              {faqs.map((item) => (
                <details className="tx-faq-item" key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <TeachXPublicFooter />
    </main>
  );
}
