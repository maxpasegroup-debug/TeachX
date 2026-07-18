import Link from "next/link";
import { ArrowRight, Bot, GraduationCap, Sparkles, Store, UsersRound } from "lucide-react";

const features = [
  { title: "Teachers", description: "Create lessons, manage resources, and grow a teaching business with AI beside you.", icon: UsersRound },
  { title: "Students", description: "Learn faster with guided practice, searchable resources, and an AI companion.", icon: GraduationCap },
  { title: "Marketplace", description: "Discover premium classes, resources, subscriptions, and earning opportunities.", icon: Store },
  { title: "AI", description: "Generate ideas, explanations, plans, and practice experiences from one calm workspace.", icon: Bot }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link className="flex items-center gap-3" href="/">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-sm font-semibold text-white shadow-soft">TX</span>
          <span>
            <span className="block text-base font-semibold">TeachX</span>
            <span className="block text-xs text-muted-foreground">Learn • Teach • Earn</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link className="hidden rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground sm:inline-flex" href="/login">
            Login
          </Link>
          <Link className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-soft transition hover:bg-foreground" href="/welcome">
            Get Started
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1fr_0.86fr] lg:items-center lg:pb-24 lg:pt-20">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800">
            <Sparkles className="h-4 w-4" />
            An AI Powered Education Platform
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">TeachX</h1>
          <p className="mt-4 text-2xl font-medium text-sky-700">Learn • Teach • Earn</p>
          <p className="mt-6 max-w-2xl text-xl leading-9 text-muted-foreground">Your AI Powered Teaching & Learning Companion</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-4 text-base font-medium text-primary-foreground shadow-soft transition hover:bg-foreground" href="/welcome">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link className="inline-flex h-13 items-center justify-center rounded-2xl border border-border bg-surface px-7 py-4 text-base font-medium text-foreground shadow-sm transition hover:bg-muted" href="/login">
              Login
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-surface p-4 shadow-soft">
          <div className="rounded-[1.5rem] bg-gradient-to-br from-sky-50 via-white to-blue-50 p-5">
            <div className="grid gap-4">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm" key={feature.title}>
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-semibold">{feature.title}</h2>
                    <p className="mt-2 leading-7 text-muted-foreground">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
