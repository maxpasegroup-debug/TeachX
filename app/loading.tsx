export default function Loading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-6">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/10 blur-3xl motion-soft-glow" />
      <section className="rounded-[2rem] border border-white/80 bg-white/75 p-8 text-center shadow-brand backdrop-blur-xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-ink text-sm font-semibold text-white shadow-brand-soft entry-logo-pulse">TX</div>
        <p className="text-sm font-semibold uppercase tracking-[0.26em] text-brand-blue">TeachX Guru</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-normal text-foreground">Preparing Your Workspace</h1>
        <div className="entry-progress mt-6 h-1.5 w-64 overflow-hidden rounded-full bg-muted">
          <span className="block h-full rounded-full bg-brand-blue" />
        </div>
      </section>
    </main>
  );
}
