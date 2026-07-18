"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-6">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/10 blur-2xl motion-soft-glow" />
      <section className="premium-glass-card max-w-lg rounded-[2rem] border border-white/80 bg-white/78 p-8 text-center shadow-brand backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.26em] text-brand-blue">Something went wrong</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-foreground">We could not load this page.</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">Please try again. Your work is safe.</p>
        <button className="premium-button mt-8 inline-flex h-12 items-center justify-center rounded-brand-button bg-brand-ink px-6 text-sm font-semibold text-white shadow-brand-soft focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" onClick={() => reset()} type="button">
          Try again
        </button>
      </section>
    </main>
  );
}
