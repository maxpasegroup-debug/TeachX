import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  ChevronDown,
  Clock3,
  Heart,
  Menu,
} from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { FontEntrance } from "@/components/landing/font-entrance";

const pillarLinks = [
  { label: "Save Time", href: "/save-time", description: "Teach, create, plan and organize.", icon: Clock3, tone: "bg-[#f3e8ff] text-[#6f3b90]" },
  { label: "Earn More", href: "/earn-more", description: "Build your profile and professional future.", icon: BriefcaseBusiness, tone: "bg-[#ffe8c2] text-[#8a4b00]" },
  { label: "Learn More", href: "/learn-more", description: "Keep growing beyond the classroom.", icon: BookOpen, tone: "bg-[#f3e8ff] text-[#6f3b90]" },
  { label: "Enjoy More", href: "/enjoy-more", description: "More life beyond the classroom.", icon: Heart, tone: "bg-[#ffe4d6] text-[#9a3412]" },
];

const directLinks = [
  ...pillarLinks.map(({ label, href }) => ({ label, href })),
  { label: "TARA", href: "/tara" },
  { label: "Pricing", href: "/pricing" },
];

const publicTheme = `
.tx-public-page { background: #efe4f8; color: #24182c; overflow-x: clip; }
.tx-public-header { background: #3a2150; border-color: rgba(255, 255, 255, 0.16); }
.tx-nav-link { color: #fff; }
.tx-nav-link:hover { background: rgba(255, 255, 255, 0.12); color: #fff; }
.tx-public-menu { background: #fff; border: 1px solid #c4a6de; box-shadow: 0 24px 70px rgba(58, 33, 80, 0.28); }
.tx-public-menu a:hover { background: #f3e8ff; }
.tx-public-pill { background: #fcaa1d; color: #3a2150; border-radius: 999px; }
.tx-public-pill:hover { background: #e89a10; }
.tx-public-ghost { border: 1.5px solid #fcaa1d; color: #8a4b00; background: #fff; border-radius: 999px; }
.tx-public-ghost:hover { background: #f3e9fa; }
.tx-public-card { background: #fff; border: 1px solid #efe4f6; border-radius: 1.5rem; box-shadow: 0 16px 40px rgba(111, 59, 144, 0.08); }
.tx-public-icon { display: grid; height: 2.75rem; width: 2.75rem; place-items: center; border-radius: 999px; background: #f3e8ff; color: #6f3b90; }
.tx-public-kicker { color: #7a4e9a; font-style: italic; }
.tx-public-muted { color: #6d6574; }
.tx-public-soft { background: #f8f2fc; border-radius: 1.25rem; }
.tx-public-final { background: linear-gradient(120deg, #d8b4fe 0%, #e879f9 48%, #f0abfc 100%); color: #2d183c; }
.tx-public-final-btn { background: #fcaa1d; color: #3a2150; border-radius: 999px; }
.tx-public-final-btn:hover { background: #e89a10; }
.tx-public-footer { background: linear-gradient(to bottom, #4d2d68 0%, #3a2150 42%, #2a1638 100%); color: #f7f1fb; border-top: 0; }
.tx-footer-grid { display: grid; gap: 2rem; }
@media (min-width: 768px) { .tx-footer-grid { grid-template-columns: 1.4fr 1fr 1fr; } }
.tx-footer-label { margin: 0 0 0.75rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #e7d6f6; }
.tx-footer-note { max-width: 20rem; margin-top: 1rem; font-size: 0.875rem; line-height: 1.6; color: rgba(247, 241, 251, 0.78); }
.tx-footer-link { display: block; width: fit-content; padding: 0.28rem 0; color: rgba(255, 255, 255, 0.86); font-weight: 500; }
.tx-footer-link:hover { color: #fff; }
.tx-footer-base { margin: 0; background: transparent; border-top: 1px solid rgba(255, 255, 255, 0.14); padding: 1rem 1.25rem; text-align: center; font-size: 0.75rem; font-weight: 500; color: rgba(247, 241, 251, 0.72); }
.tx-hero-band { position: relative; overflow: hidden; background: radial-gradient(circle at 8% 16%, rgba(252, 170, 29, 0.72), transparent 24%), radial-gradient(circle at 92% 12%, rgba(111, 59, 144, 0.42), transparent 30%), radial-gradient(circle at 74% 88%, rgba(232, 121, 249, 0.4), transparent 26%), linear-gradient(145deg, #d8b4fe 0%, #f6edff 46%, #ffe4b8 100%); }
main[data-world="Earn More"] .tx-hero-band { background: radial-gradient(circle at 10% 18%, rgba(252, 170, 29, 0.85), transparent 28%), radial-gradient(circle at 88% 78%, rgba(111, 59, 144, 0.35), transparent 30%), linear-gradient(145deg, #ffd27a 0%, #fff3d6 42%, #e9d5ff 100%); }
main[data-world="Learn More"] .tx-hero-band { background: radial-gradient(circle at 86% 16%, rgba(252, 170, 29, 0.55), transparent 24%), radial-gradient(circle at 12% 80%, rgba(167, 139, 250, 0.55), transparent 28%), linear-gradient(145deg, #c4b5fd 0%, #f5f3ff 50%, #fde68a 100%); }
main[data-world="Enjoy More"] .tx-hero-band { background: radial-gradient(circle at 14% 24%, rgba(244, 114, 182, 0.5), transparent 26%), radial-gradient(circle at 88% 18%, rgba(252, 170, 29, 0.55), transparent 24%), linear-gradient(145deg, #fbcfe8 0%, #fae8ff 48%, #ffedd5 100%); }
main[data-world="Pricing"] .tx-hero-band, main[data-world="TARA"] .tx-hero-band { background: radial-gradient(circle at 88% 14%, rgba(252, 170, 29, 0.7), transparent 24%), radial-gradient(circle at 8% 86%, rgba(192, 132, 252, 0.55), transparent 28%), linear-gradient(145deg, #c084fc 0%, #f3e8ff 42%, #ffd58a 100%); }
main[data-world="Support"] .tx-hero-band { background: radial-gradient(circle at 12% 20%, rgba(252, 170, 29, 0.8), transparent 26%), radial-gradient(circle at 90% 80%, rgba(111, 59, 144, 0.32), transparent 28%), linear-gradient(145deg, #ffe0a3 0%, #fff6e8 46%, #e9d5ff 100%); }
main[data-world="Trust"] .tx-hero-band { background: radial-gradient(circle at 88% 16%, rgba(252, 170, 29, 0.62), transparent 24%), radial-gradient(circle at 10% 84%, rgba(111, 59, 144, 0.4), transparent 28%), linear-gradient(145deg, #d8b4fe 0%, #f3e8ff 48%, #ffe4b8 100%); }
main[data-world="Privacy"] .tx-hero-band { background: radial-gradient(circle at 8% 18%, rgba(111, 59, 144, 0.38), transparent 26%), radial-gradient(circle at 92% 78%, rgba(252, 170, 29, 0.55), transparent 24%), linear-gradient(145deg, #e9d5ff 0%, #f6edff 50%, #fff1d6 100%); }
main[data-world="Terms"] .tx-hero-band { background: radial-gradient(circle at 84% 14%, rgba(232, 121, 249, 0.4), transparent 24%), radial-gradient(circle at 12% 82%, rgba(252, 170, 29, 0.6), transparent 26%), linear-gradient(145deg, #f3e8ff 0%, #fae8ff 46%, #ffe7c2 100%); }
.tx-blob { position: absolute; border-radius: 999px; pointer-events: none; }
.tx-blob-orange { top: -3.5rem; right: 6%; width: 16rem; height: 16rem; background: #fcaa1d; opacity: 0.55; }
.tx-blob-violet { bottom: -6rem; left: -3rem; width: 18rem; height: 18rem; background: #a855f7; opacity: 0.28; }
.tx-hero-copy, .tx-hero-panel { position: relative; z-index: 1; }
.tx-hero-panel { border-radius: 1.75rem; background: rgba(255, 255, 255, 0.92); border: 1px solid rgba(255, 255, 255, 0.8); box-shadow: 0 24px 60px rgba(111, 59, 144, 0.16); padding: 1.5rem; }
.tx-swatch { display: flex; align-items: center; gap: 0.85rem; min-height: 3.25rem; border-radius: 1rem; padding: 0.7rem 0.9rem; font-weight: 600; }
.tx-swatch:nth-child(3n+1) { background: #f3e8ff; color: #5b2d82; }
.tx-swatch:nth-child(3n+2) { background: #fff1d6; color: #8a4b00; }
.tx-swatch:nth-child(3n+3) { background: #ffe4f3; color: #9d174d; }
.tx-section-lilac { background: #f7effc; }
.tx-section-cream { background: radial-gradient(circle at 100% 0%, rgba(252, 170, 29, 0.35), transparent 32%), linear-gradient(180deg, #fff8ec 0%, #ffe7c2 100%); }
.tx-color-grid > :nth-child(5n+1) { background: linear-gradient(180deg, #f3e8ff 0%, #fff 48%); border-top: 6px solid #6f3b90; }
.tx-color-grid > :nth-child(5n+2) { background: linear-gradient(180deg, #fff1d0 0%, #fff 48%); border-top: 6px solid #fcaa1d; }
.tx-color-grid > :nth-child(5n+3) { background: linear-gradient(180deg, #ffe4f1 0%, #fff 48%); border-top: 6px solid #e879f9; }
.tx-color-grid > :nth-child(5n+4) { background: linear-gradient(180deg, #ffedd5 0%, #fff 48%); border-top: 6px solid #fb923c; }
.tx-color-grid > :nth-child(5n+5) { background: linear-gradient(180deg, #ede9fe 0%, #fff 48%); border-top: 6px solid #8b5cf6; }
.tx-plan-basic { background: linear-gradient(180deg, #f3e8ff 0%, #fff 36%); border-top: 6px solid #6f3b90; }
.tx-plan-pro { background: linear-gradient(180deg, #fff1d0 0%, #fff 36%); border-top: 6px solid #fcaa1d; }
main :is(h1, h2, h3, p, li, summary):not(.tx-in),
main :is(.tx-world-more, .tx-final-btn, .tx-footer-link, .tx-float, a.tx-pill, a.tx-ghost, a.tx-public-pill, a.tx-public-ghost, a.tx-public-final-btn),
main .tx-role > span,
.tx-public-header :is(.tx-nav-link, .tx-public-pill, .tx-public-ghost) {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.72s cubic-bezier(0.22, 1, 0.36, 1), transform 0.72s cubic-bezier(0.22, 1, 0.36, 1);
}
main :is(h1, h2, h3, p, li, summary):not(.tx-in).is-in,
main :is(.tx-world-more, .tx-final-btn, .tx-footer-link, .tx-float, a.tx-pill, a.tx-ghost, a.tx-public-pill, a.tx-public-ghost, a.tx-public-final-btn).is-in,
main .tx-role > span.is-in,
.tx-public-header :is(.tx-nav-link, .tx-public-pill, .tx-public-ghost).is-in {
  opacity: 1;
  transform: none;
}
.tx-in :is(a.tx-pill, a.tx-ghost) { opacity: 1; transform: none; transition: none; }
@media (prefers-reduced-motion: reduce) {
  main :is(h1, h2, h3, p, li, summary):not(.tx-in),
  main :is(.tx-world-more, .tx-final-btn, .tx-footer-link, .tx-float, a.tx-pill, a.tx-ghost, a.tx-public-pill, a.tx-public-ghost, a.tx-public-final-btn),
  main .tx-role > span,
  .tx-public-header :is(.tx-nav-link, .tx-public-pill, .tx-public-ghost) {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
html[data-motion="reduce"] main :is(h1, h2, h3, p, li, summary),
html[data-motion="reduce"] main :is(.tx-world-more, .tx-final-btn, .tx-footer-link, .tx-float, a.tx-pill, a.tx-ghost, a.tx-public-pill, a.tx-public-ghost, a.tx-public-final-btn),
html[data-motion="reduce"] .tx-public-header :is(.tx-nav-link, .tx-public-pill, .tx-public-ghost) {
  opacity: 1;
  transform: none;
  transition: none;
}
`;

export function TeachXPublicHeader() {
  return (
    <header className="tx-public-header sticky top-0 z-50 border-b backdrop-blur-md">
      <style>{publicTheme}</style>
      <FontEntrance />
      <div className="mx-auto flex h-[4.5rem] max-w-[90rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo className="shrink-0 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6f3b90]" markClassName="h-11 w-11" textClassName="block" />

        <nav aria-label="Public navigation" className="hidden items-center lg:flex">
          <details className="group relative">
            <summary className="tx-nav-link flex min-h-11 cursor-pointer list-none items-center gap-1 rounded-md px-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#fcaa1d] xl:px-3">
              Platform
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="tx-public-menu absolute left-1/2 top-[3.25rem] w-[44rem] -translate-x-1/2 rounded-2xl border p-3 shadow-[0_24px_70px_rgba(58,33,80,0.12)]">
              <div className="grid grid-cols-2 gap-1">
                {pillarLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link className="group/item flex min-h-20 gap-3 rounded-md p-3 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#6f3b90]" href={item.href} key={item.href}>
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${item.tone}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                      <span><span className="block text-sm font-semibold text-[#0b2230]">{item.label}</span><span className="mt-1 block text-xs leading-5 text-[#617078]">{item.description}</span></span>
                    </Link>
                  );
                })}
              </div>
              <Link className="tx-public-soft mt-2 flex items-center justify-between px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6f3b90]" href="/tara">
                <span className="flex items-center gap-3"><Bot className="h-5 w-5 text-[#6f3b90]" aria-hidden="true" /><span><span className="block text-sm font-semibold">TARA</span><span className="tx-public-muted block text-xs">The intelligence across every TeachX world.</span></span></span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </details>

          {directLinks.map((item) => <Link className="tx-nav-link min-h-11 rounded-md px-2 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#fcaa1d] xl:px-3" href={item.href} key={item.href}>{item.label === "Learn More" ? "Learn More for Teachers" : item.label}</Link>)}
        </nav>

        <div className="hidden shrink-0 items-center gap-1 lg:flex">
          <Link className="tx-nav-link inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#fcaa1d]" href="/login">Sign In</Link>
          <Link className="tx-public-pill inline-flex min-h-11 items-center gap-2 px-5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#6f3b90] focus:ring-offset-2" href="/signup/teacher">Start Free<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link className="tx-public-pill inline-flex min-h-11 items-center gap-2 px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#6f3b90] focus:ring-offset-2" href="/signup/teacher">Start Free<ArrowRight className="hidden h-4 w-4 sm:block" aria-hidden="true" /></Link>
          <details className="group relative">
            <summary className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-md border border-[#0b2230]/15 bg-white focus:outline-none focus:ring-2 focus:ring-[#6f3b90]" title="Open menu"><span className="sr-only">Open menu</span><Menu className="h-5 w-5" aria-hidden="true" /></summary>
            <nav aria-label="Mobile public navigation" className="tx-public-menu absolute right-0 mt-2 max-h-[calc(100svh-6rem)] w-[min(21rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border p-2 shadow-[0_24px_70px_rgba(58,33,80,0.16)]">
              <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase text-[#77848a]">The Teacher Life OS</p>
              {pillarLinks.map((item) => {
                const Icon = item.icon;
                return <Link className="flex min-h-12 items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-[#0b2230] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#6f3b90]" href={item.href} key={item.href}><span className={`grid h-8 w-8 place-items-center rounded-md ${item.tone}`}><Icon className="h-4 w-4" aria-hidden="true" /></span>{item.label}</Link>;
              })}
              <div className="my-2 border-t border-[#0b2230]/10" />
              <Link className="flex min-h-12 items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-[#0b2230] hover:bg-white" href="/tara"><Bot className="h-5 w-5 text-[#fcaa1d]" aria-hidden="true" />TARA</Link>
              <Link className="flex min-h-12 items-center rounded-md px-3 py-2 text-sm font-semibold text-[#0b2230] hover:bg-white" href="/pricing">Pricing</Link>
              <Link className="flex min-h-12 items-center rounded-md px-3 py-2 text-sm font-semibold text-[#0b2230] hover:bg-white" href="/login">Sign In</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

const companyLinks = [
  { label: "Pricing", href: "/pricing" },
  { label: "Support", href: "/contact" },
  { label: "Trust", href: "/trust" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function TeachXPublicFooter() {
  return (
    <footer className="tx-public-footer">
      <div className="tx-footer-grid mx-auto max-w-[90rem] px-5 py-10 sm:px-8 lg:px-10">
        <div>
          <BrandLogo markClassName="h-9 w-9" />
          <p className="tx-footer-note">More time for the life you teach for.</p>
        </div>
        <nav aria-label="Teacher Life OS">
          <p className="tx-footer-label">Teacher Life OS</p>
          {pillarLinks.map((item) => <Link className="tx-footer-link" href={item.href} key={item.href}>{item.label === "Learn More" ? "Learn More for Teachers" : item.label}</Link>)}
          <Link className="tx-footer-link" href="/tara">TARA</Link>
        </nav>
        <nav aria-label="Company and legal">
          <p className="tx-footer-label">TeachX</p>
          {companyLinks.map((item) => <Link className="tx-footer-link" href={item.href} key={item.href}>{item.label}</Link>)}
        </nav>
      </div>
      <p className="tx-footer-base">Built for teachers. Powered by TARA.</p>
    </footer>
  );
}
