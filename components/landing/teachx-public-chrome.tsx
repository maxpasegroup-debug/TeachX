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

const pillarLinks = [
  { label: "Save Time", href: "/save-time", description: "Teach, create, plan and organize.", icon: Clock3, tone: "bg-[#d8eef2] text-[#123b46]" },
  { label: "Earn More", href: "/earn-more", description: "Build your profile and professional future.", icon: BriefcaseBusiness, tone: "bg-[#dcebdd] text-[#1f4a32]" },
  { label: "Learn More", href: "/learn-more", description: "Keep growing beyond the classroom.", icon: BookOpen, tone: "bg-[#f5e7bd] text-[#654d13]" },
  { label: "Enjoy More", href: "/enjoy-more", description: "More life beyond the classroom.", icon: Heart, tone: "bg-[#f2dfe1] text-[#6e3038]" },
];

const directLinks = [
  ...pillarLinks.map(({ label, href }) => ({ label, href })),
  { label: "TARA", href: "/tara" },
  { label: "Pricing", href: "/pricing" },
];

export function TeachXPublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#0b2230]/10 bg-[#fbfaf7]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-[90rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo className="shrink-0 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0d6174]" markClassName="h-9 w-9 rounded-md bg-[#0b2230] shadow-none" textClassName="block" />

        <nav aria-label="Public navigation" className="hidden items-center lg:flex">
          <details className="group relative">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 rounded-md px-2 text-sm font-semibold text-[#354851] hover:bg-[#eef1ee] focus:outline-none focus:ring-2 focus:ring-[#0d6174] xl:px-3">
              Platform
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="absolute left-1/2 top-[3.25rem] w-[44rem] -translate-x-1/2 rounded-lg border border-[#0b2230]/10 bg-[#fbfaf7] p-3 shadow-[0_24px_70px_rgba(8,29,38,0.16)]">
              <div className="grid grid-cols-2 gap-1">
                {pillarLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link className="group/item flex min-h-20 gap-3 rounded-md p-3 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d6174]" href={item.href} key={item.href}>
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${item.tone}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                      <span><span className="block text-sm font-semibold text-[#0b2230]">{item.label}</span><span className="mt-1 block text-xs leading-5 text-[#617078]">{item.description}</span></span>
                    </Link>
                  );
                })}
              </div>
              <Link className="mt-2 flex items-center justify-between rounded-md bg-[#0b2230] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#76c9c1]" href="/tara">
                <span className="flex items-center gap-3"><Bot className="h-5 w-5 text-[#91d8cf]" aria-hidden="true" /><span><span className="block text-sm font-semibold">TARA</span><span className="block text-xs text-white/65">The intelligence across every TeachX world.</span></span></span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </details>

          {directLinks.map((item) => <Link className="min-h-11 rounded-md px-2 py-3 text-sm font-semibold text-[#354851] hover:bg-[#eef1ee] hover:text-[#0b2230] focus:outline-none focus:ring-2 focus:ring-[#0d6174] xl:px-3" href={item.href} key={item.href}>{item.label}</Link>)}
        </nav>

        <div className="hidden shrink-0 items-center gap-1 lg:flex">
          <Link className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-[#0b2230] hover:bg-[#eef1ee] focus:outline-none focus:ring-2 focus:ring-[#0d6174]" href="/login">Sign In</Link>
          <Link className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#0b2230] px-4 text-sm font-semibold text-white transition hover:bg-[#0d6174] focus:outline-none focus:ring-2 focus:ring-[#0d6174] focus:ring-offset-2" href="/signup/teacher">Start Free<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#0b2230] px-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#0d6174] focus:ring-offset-2" href="/signup/teacher">Start Free<ArrowRight className="hidden h-4 w-4 sm:block" aria-hidden="true" /></Link>
          <details className="group relative">
            <summary className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-md border border-[#0b2230]/15 bg-white focus:outline-none focus:ring-2 focus:ring-[#0d6174]" title="Open menu"><span className="sr-only">Open menu</span><Menu className="h-5 w-5" aria-hidden="true" /></summary>
            <nav aria-label="Mobile public navigation" className="absolute right-0 mt-2 max-h-[calc(100svh-6rem)] w-[min(21rem,calc(100vw-2rem))] overflow-y-auto rounded-lg border border-[#0b2230]/10 bg-[#fbfaf7] p-2 shadow-[0_24px_70px_rgba(8,29,38,0.18)]">
              <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase text-[#77848a]">The Teacher Life OS</p>
              {pillarLinks.map((item) => {
                const Icon = item.icon;
                return <Link className="flex min-h-12 items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-[#0b2230] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d6174]" href={item.href} key={item.href}><span className={`grid h-8 w-8 place-items-center rounded-md ${item.tone}`}><Icon className="h-4 w-4" aria-hidden="true" /></span>{item.label}</Link>;
              })}
              <div className="my-2 border-t border-[#0b2230]/10" />
              <Link className="flex min-h-12 items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-[#0b2230] hover:bg-white" href="/tara"><Bot className="h-5 w-5 text-[#0d6174]" aria-hidden="true" />TARA</Link>
              <Link className="flex min-h-12 items-center rounded-md px-3 py-2 text-sm font-semibold text-[#0b2230] hover:bg-white" href="/pricing">Pricing</Link>
              <Link className="flex min-h-12 items-center rounded-md px-3 py-2 text-sm font-semibold text-[#0b2230] hover:bg-white" href="/login">Sign In</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

export function TeachXPublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#071820] text-white">
      <div className="mx-auto grid max-w-[90rem] gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div><BrandLogo markClassName="h-9 w-9 rounded-md bg-white text-[#071820] shadow-none" textClassName="[&_span:first-child]:text-white [&_span:last-child]:text-white/65" /><p className="mt-5 max-w-sm text-lg leading-7 text-white/70">More time for the life you teach for.</p></div>
        <nav aria-label="Teacher Life OS" className="grid content-start gap-3 text-sm text-white/65">
          <p className="mb-1 font-semibold text-white">Teacher Life OS</p>
          {pillarLinks.map((item) => <Link className="w-fit hover:text-white" href={item.href} key={item.href}>{item.label}</Link>)}
          <Link className="w-fit hover:text-white" href="/tara">TARA</Link>
        </nav>
        <nav aria-label="Company and legal" className="grid content-start gap-3 text-sm text-white/65">
          <p className="mb-1 font-semibold text-white">TeachX</p><Link className="w-fit hover:text-white" href="/pricing">Pricing</Link><Link className="w-fit hover:text-white" href="/contact">Support</Link><Link className="w-fit hover:text-white" href="/trust">Trust</Link><Link className="w-fit hover:text-white" href="/privacy">Privacy</Link><Link className="w-fit hover:text-white" href="/terms">Terms</Link>
        </nav>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/65">Built for teachers. Powered by TARA.</div>
    </footer>
  );
}
