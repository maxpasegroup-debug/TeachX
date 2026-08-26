import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, BookOpen, Brain, CalendarCheck2, CircleDollarSign, Compass, Heart, Sparkles, UsersRound } from "lucide-react";

type ListItem = {
  title: string;
  meta?: string | null;
  href?: string | null;
};

type GuruHomeProps = {
  name?: string | null;
  daily: { todaysClasses: ListItem[]; pendingTasks: ListItem[]; recentResources: ListItem[] };
  stats: { resourcesCreated: number; studentsHelped: number; downloads: number };
  aiCreditsRemaining: number;
};

const spaces: {
  title: string;
  eyebrow: string;
  detail: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  object: string;
}[] = [
  {
    title: "Save Time",
    eyebrow: "Organize",
    detail: "Organize your teaching world.",
    href: "/teacher/life/save-time",
    icon: CalendarCheck2,
    accent: "from-[#20d16b] to-[#0e8d46]",
    object: "Calendar, learners, files"
  },
  {
    title: "Earn More",
    eyebrow: "Opportunity",
    detail: "Turn your knowledge into opportunity.",
    href: "/teacher/life/earn-more",
    icon: CircleDollarSign,
    accent: "from-[#f6b44b] to-[#c56a14]",
    object: "Profile, resources, income"
  },
  {
    title: "Learn More",
    eyebrow: "Growth",
    detail: "Keep growing.",
    href: "/teacher/life/learn-more",
    icon: Brain,
    accent: "from-[#6bd7ff] to-[#3867d6]",
    object: "Books, skills, ideas"
  },
  {
    title: "Enjoy More",
    eyebrow: "Connection",
    detail: "Enjoy the journey.",
    href: "/teacher/life/enjoy-more",
    icon: Heart,
    accent: "from-[#ff7aa8] to-[#d93b6d]",
    object: "Community, experiences"
  }
];

function firstName(name?: string | null) {
  return name?.split(" ").filter(Boolean)[0] ?? "there";
}

function SpaceCard({ space, index }: { space: (typeof spaces)[number]; index: number }) {
  const Icon = space.icon;
  return (
    <Link
      className="group relative min-h-[260px] overflow-hidden rounded-[1.75rem] bg-[#111714] p-5 text-white shadow-[0_24px_70px_rgba(17,23,20,.18)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(17,23,20,.24)] focus:outline-none focus:ring-4 focus:ring-[#20d16b]/30"
      href={space.href}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className={`absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br ${space.accent} opacity-90 blur-sm transition duration-300 group-hover:scale-110`} />
      <div className="absolute bottom-5 right-5 h-28 w-28 rounded-[2rem] bg-white/10 shadow-inner backdrop-blur">
        <div className={`absolute inset-4 rounded-[1.4rem] bg-gradient-to-br ${space.accent} shadow-[0_18px_40px_rgba(0,0,0,.25)]`} />
        <Icon className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-white" />
      </div>
      <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-between">
        <div>
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[.16em] text-white/75">{space.eyebrow}</span>
          <h2 className="mt-6 max-w-[12rem] text-4xl font-semibold tracking-tight">{space.title}</h2>
          <p className="mt-3 max-w-[15rem] text-sm leading-6 text-white/72">{space.detail}</p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="max-w-[10rem] text-xs font-medium text-white/50">{space.object}</p>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#111714] transition group-hover:translate-x-1">
            <ArrowRight className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function MiniSignal({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-[0_12px_35px_rgba(17,23,20,.06)]">
      <Icon className="h-5 w-5 text-[#0f8f47]" />
      <p className="mt-3 text-sm font-semibold">{value}</p>
      <p className="mt-1 text-xs text-[#657069]">{label}</p>
    </div>
  );
}

export function GuruHome({ name, daily, stats, aiCreditsRemaining }: GuruHomeProps) {
  const today = new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const firstAction = daily.todaysClasses[0] ?? daily.pendingTasks[0] ?? daily.recentResources[0];

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f4ec] text-[#111714]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3" href="/teacher">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#111714] text-sm font-bold text-[#20d16b]">TX</span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[.18em] text-[#657069]">TeachX Guru</span>
            <span className="block text-xs text-[#657069]">Your world for teaching</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link className="hidden min-h-11 items-center rounded-full border border-black/10 bg-white/70 px-4 text-sm font-semibold hover:bg-white sm:inline-flex" href="/tara">Ask TeachX</Link>
          <Link className="inline-flex min-h-11 items-center rounded-full bg-[#111714] px-4 text-sm font-semibold text-white hover:bg-black" href="/teacher/life/save-time">Enter Save Time</Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <section className="grid gap-8 py-6 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-[#0f8f47]">{today}</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Good morning, {firstName(name)}.
              <span className="block text-[#0f8f47]">Your TeachX world is ready.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#55615b]">Everything you need to teach, grow, earn and enjoy in one beautiful place.</p>
          </div>
          <aside className="rounded-[2rem] border border-black/10 bg-white/70 p-5 shadow-[0_20px_60px_rgba(17,23,20,.08)] backdrop-blur">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#20d16b] text-[#111714]"><Compass className="h-5 w-5" /></span>
              <div>
                <h2 className="font-semibold">Start with what matters today.</h2>
                <p className="mt-1 text-sm leading-6 text-[#657069]">{firstAction ? firstAction.title : "Choose a space below and TeachX will take you there."}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniSignal icon={CalendarCheck2} label="Today's classes" value={daily.todaysClasses.length.toString()} />
              <MiniSignal icon={UsersRound} label="Learners helped" value={stats.studentsHelped.toString()} />
              <MiniSignal icon={BookOpen} label="Materials" value={stats.resourcesCreated.toString()} />
              <MiniSignal icon={Sparkles} label="Ask TeachX credits" value={aiCreditsRemaining.toString()} />
            </div>
          </aside>
        </section>

        <section className="mt-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#0f8f47]">Choose your world</p>
              <h2 className="text-3xl font-semibold tracking-tight">Four spaces for your life and work.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#657069]">Visual destinations first. Practical workspaces when you enter.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {spaces.map((space, index) => <SpaceCard index={index} key={space.title} space={space} />)}
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
          <MiniSignal icon={CalendarCheck2} label="Pending work waiting in Save Time" value={`${daily.pendingTasks.length} item${daily.pendingTasks.length === 1 ? "" : "s"}`} />
          <MiniSignal icon={BookOpen} label="Recent teaching material" value={daily.recentResources[0]?.title ?? "Bring your first material"} />
          <MiniSignal icon={CircleDollarSign} label="Recorded downloads" value={stats.downloads.toString()} />
        </section>
      </main>
    </div>
  );
}
