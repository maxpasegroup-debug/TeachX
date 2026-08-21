import Link from "next/link";
import { Menu } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";

const publicLinks = [
  { label: "Explore", href: "/#worlds" },
  { label: "TARA", href: "/#tara" },
  { label: "Pricing", href: "/pricing" }
];

export function TeachXPublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link aria-label="TeachX home" className="shrink-0 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" href="/"><BrandLogo markClassName="h-9 w-9 rounded-md" textClassName="hidden sm:block" /></Link>
        <nav aria-label="Public navigation" className="hidden items-center gap-1 md:flex">
          {publicLinks.map((item) => <Link className="min-h-11 rounded-md px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary" href={item.href} key={item.label}>{item.label}</Link>)}
          <Link className="min-h-11 rounded-md px-4 py-3 text-sm font-semibold hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary" href="/login">Sign In</Link>
          <Link className="ml-1 inline-flex min-h-11 items-center rounded-md bg-foreground px-5 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href="/signup/teacher">Start Free</Link>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <Link className="inline-flex min-h-11 items-center rounded-md bg-foreground px-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href="/signup/teacher">Start Free</Link>
          <details className="group relative">
            <summary className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-md border bg-white focus:outline-none focus:ring-2 focus:ring-primary" title="Open menu"><span className="sr-only">Open menu</span><Menu className="h-5 w-5" aria-hidden="true" /></summary>
            <nav aria-label="Mobile public navigation" className="absolute right-0 mt-2 w-48 rounded-md border bg-white p-2 shadow-lg">
              {publicLinks.map((item) => <Link className="block min-h-11 rounded-md px-3 py-3 text-sm font-semibold hover:bg-muted" href={item.href} key={item.label}>{item.label}</Link>)}
              <Link className="block min-h-11 rounded-md px-3 py-3 text-sm font-semibold hover:bg-muted" href="/login">Sign In</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

export function TeachXPublicFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div><BrandLogo markClassName="h-9 w-9 rounded-md" /><p className="mt-3 text-sm text-muted-foreground">Built for teachers. Powered by TARA.</p></div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-muted-foreground">
          <Link className="hover:text-foreground" href="/pricing">Pricing</Link><Link className="hover:text-foreground" href="/contact">Support</Link><Link className="hover:text-foreground" href="/trust">Trust</Link><Link className="hover:text-foreground" href="/privacy">Privacy</Link><Link className="hover:text-foreground" href="/terms">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
