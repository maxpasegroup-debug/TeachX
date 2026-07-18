import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-6">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/10 blur-2xl motion-soft-glow" />
      <section className="premium-glass-card max-w-lg rounded-[2rem] border border-white/80 bg-white/78 p-8 text-center shadow-brand backdrop-blur-xl">
        <div className="mb-7 flex justify-center">
          <BrandLogo />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.26em] text-brand-blue">Page not found</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-foreground">This page is not available.</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">The link may be old, or this area may not be available yet.</p>
        <Link className="premium-button mt-8 inline-flex h-12 items-center justify-center rounded-brand-button bg-brand-ink px-6 text-sm font-semibold text-white shadow-brand-soft" href="/">
          Go Home
        </Link>
      </section>
    </main>
  );
}
