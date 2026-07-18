import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="max-w-lg text-center">
        <p className="text-sm font-medium text-muted-foreground">Offline</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">TeachX is ready when your connection returns.</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">You can reopen the app shell now. Live data, AI, marketplace, and dashboards need an internet connection.</p>
        <Link className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-5 text-base font-medium text-primary-foreground shadow-soft transition-all hover:bg-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" href="/">
          Open TeachX
        </Link>
      </section>
    </main>
  );
}
