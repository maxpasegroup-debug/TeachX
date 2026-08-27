import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarCheck2,
  CheckCircle2,
  CircleDollarSign,
  FolderOpen,
  Heart,
  Layers3,
  Sparkles,
  UsersRound
} from "lucide-react";

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
  { title: "Save Time", eyebrow: "Organize", detail: "Bring classes, learners and materials into one clear flow.", href: "/teacher/life/save-time", icon: CalendarCheck2, accent: "#20d16b", object: "Plan your week" },
  { title: "Earn More", eyebrow: "Opportunity", detail: "Turn your expertise into a professional teaching business.", href: "/teacher/life/earn-more", icon: CircleDollarSign, accent: "#f0b44c", object: "Grow your practice" },
  { title: "Learn More", eyebrow: "Growth", detail: "Keep your craft moving with ideas, skills and perspective.", href: "/teacher/life/learn-more", icon: Brain, accent: "#68c7dd", object: "Build your edge" },
  { title: "Enjoy More", eyebrow: "Connection", detail: "Make room for community, energy and the moments in between.", href: "/teacher/life/enjoy-more", icon: Heart, accent: "#ec759a", object: "Stay connected" }
];

function firstName(name?: string | null) {
  return name?.split(" ").filter(Boolean)[0] ?? "there";
}

function countLabel(count: number, singular: string, empty: string) {
  return count === 0 ? empty : `${count} ${singular}${count === 1 ? "" : "s"}`;
}

function pickHeadline(
  items: ListItem[],
  fallbackTitle: string,
  fallbackMeta: string
) {
  const item = items[0];
  return {
    title: item?.title ?? fallbackTitle,
    meta: item?.meta ?? fallbackMeta,
    href: item?.href ?? null
  };
}

function PrismArtwork() {
  return (
    <div aria-hidden="true" className="pointer-events-none relative mx-auto h-[290px] w-full max-w-[410px] select-none sm:h-[340px]">
      <div className="motion-soft-glow absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#20d16b]/30 blur-3xl" />
      <div className="motion-rotate absolute left-1/2 top-1/2 h-[265px] w-[265px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#20d16b]/30" />
      <div className="absolute left-1/2 top-1/2 h-[205px] w-[205px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/25" />
      <div className="absolute inset-x-4 top-1/2 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      <div className="absolute left-1/2 top-1/2 h-[242px] w-[242px] -translate-x-1/2 -translate-y-1/2 [transform:perspective(700px)_rotateX(67deg)_rotateZ(-22deg)] border border-white/15" />
      <div className="motion-float absolute left-1/2 top-1/2 h-[175px] w-[218px] -translate-x-1/2 -translate-y-1/2 [transform:perspective(900px)_rotateX(58deg)_rotateZ(-28deg)]">
        <div className="absolute inset-0 rounded-[1.65rem] border border-white/40 bg-[linear-gradient(135deg,rgba(255,255,255,.44),rgba(255,255,255,.06))] shadow-[0_34px_70px_rgba(0,0,0,.3)] backdrop-blur-sm" />
        <div className="absolute inset-[18px] rounded-[1.25rem] border border-[#20d16b]/50 bg-[#143a2a]/85 shadow-[inset_0_1px_0_rgba(255,255,255,.22),0_18px_45px_rgba(32,209,107,.2)]" />
        <div className="absolute left-[38px] top-[40px] h-16 w-16 rounded-2xl border border-white/20 bg-white/10 shadow-inner" />
        <div className="absolute right-[38px] top-[40px] h-16 w-16 rounded-2xl border border-white/20 bg-white/10 shadow-inner" />
        <div className="absolute bottom-[35px] left-1/2 h-12 w-[135px] -translate-x-1/2 rounded-xl border border-white/20 bg-white/10" />
      </div>
      <div className="motion-float absolute left-5 top-14 grid h-12 w-12 place-items-center rounded-2xl border border-white/40 bg-white/15 text-[#20d16b] shadow-[0_16px_30px_rgba(0,0,0,.2)] backdrop-blur" style={{ animationDelay: "-2.4s" }}><Layers3 className="h-5 w-5" /></div>
      <div className="motion-float absolute bottom-8 right-5 grid h-14 w-14 place-items-center rounded-2xl border border-white/40 bg-white/15 text-white shadow-[0_16px_30px_rgba(0,0,0,.2)] backdrop-blur" style={{ animationDelay: "-4.8s" }}><Sparkles className="h-5 w-5" /></div>
    </div>
  );
}

function CommandBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-white/12 bg-white/[0.07] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-white/45">{label}</p>
      <p className="mt-2 text-base font-semibold tracking-[-.03em] text-white">{value}</p>
    </div>
  );
}

function SpaceCard({ space, index }: { space: (typeof spaces)[number]; index: number }) {
  const Icon = space.icon;
  return (
    <Link className="group relative min-h-[245px] overflow-hidden rounded-[1.7rem] border border-[#27332e] bg-[#111714] p-5 text-white shadow-[0_22px_55px_rgba(17,23,20,.16)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(17,23,20,.26)] focus:outline-none focus:ring-4 focus:ring-[#20d16b]/35" href={space.href} style={{ animationDelay: `${index * 85}ms` }}>
      <div className="absolute -right-14 -top-12 h-44 w-44 rounded-full opacity-90 blur-2xl transition duration-500 group-hover:scale-125" style={{ backgroundColor: space.accent }} />
      <div className="absolute right-5 top-5 h-[72px] w-[72px] [transform:perspective(300px)_rotateX(50deg)_rotateZ(-28deg)] rounded-2xl border border-white/35 bg-white/10 shadow-[0_20px_36px_rgba(0,0,0,.35)] transition duration-300 group-hover:[transform:perspective(300px)_rotateX(46deg)_rotateZ(-22deg)_translateY(-4px)]">
        <div className="absolute inset-3 rounded-xl shadow-inner" style={{ backgroundColor: space.accent }} />
        <Icon className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-white" />
      </div>
      <div className="relative z-10 flex min-h-[203px] flex-col justify-between">
        <div className="max-w-[15rem]">
          <span className="inline-flex border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-white/70">{space.eyebrow}</span>
          <h2 className="mt-5 text-[2rem] font-semibold tracking-[-.045em]">{space.title}</h2>
          <p className="mt-2 text-sm leading-6 text-white/72">{space.detail}</p>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <p className="text-xs font-medium text-white/60">{space.object}</p>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#111714] transition duration-300 group-hover:translate-x-1 group-hover:bg-[#20d16b]"><ArrowRight className="h-4 w-4 rtl-flip" /></span>
        </div>
      </div>
    </Link>
  );
}

function Signal({ icon: Icon, label, value, note }: { icon: LucideIcon; label: string; value: string; note?: string }) {
  return (
    <div className="min-w-0 border-l border-[#d9ddd4] pl-4 first:border-l-0 first:pl-0 sm:border-l sm:pl-5">
      <Icon className="h-4 w-4 text-[#0d8b45]" aria-hidden="true" />
      <p className="mt-2 truncate text-xl font-semibold tracking-[-.04em] text-[#111714]" title={value}>{value}</p>
      <p className="mt-1 text-xs font-medium text-[#657069]">{label}</p>
      {note ? <p className="mt-1 text-[11px] text-[#849088]">{note}</p> : null}
    </div>
  );
}

function FocusCard({
  eyebrow,
  title,
  meta,
  href,
  accent,
  icon: Icon
}: {
  eyebrow: string;
  title: string;
  meta: string;
  href?: string | null;
  accent: string;
  icon: LucideIcon;
}) {
  const content = (
    <>
      <div
        aria-hidden="true"
        className="absolute -right-10 top-4 h-24 w-24 rounded-full blur-2xl"
        style={{ backgroundColor: accent }}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#5b6a63]">{eyebrow}</p>
            <h3 className="mt-3 text-lg font-semibold tracking-[-.04em] text-[#111714]">{title}</h3>
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-black/8 bg-white/80 shadow-[0_14px_24px_rgba(17,23,20,.08)]">
            <Icon className="h-5 w-5 text-[#111714]" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#657069]">{meta}</p>
        <div className="mt-5 flex items-center justify-between border-t border-black/6 pt-4">
          <span className="text-xs font-semibold uppercase tracking-[.16em] text-[#0c8d45]">
            {href ? "Open now" : "Ready to start"}
          </span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#111714] text-white shadow-[0_12px_25px_rgba(17,23,20,.18)]">
            <ArrowRight className="h-4 w-4 rtl-flip" aria-hidden="true" />
          </span>
        </div>
      </div>
    </>
  );

  const className =
    "group relative overflow-hidden rounded-[1.6rem] border border-[#d8ddd4] bg-[linear-gradient(180deg,rgba(255,255,255,.94),rgba(247,244,236,.88))] p-5 shadow-[0_20px_50px_rgba(17,23,20,.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(17,23,20,.12)] focus:outline-none focus:ring-4 focus:ring-[#20d16b]/25";

  if (href) {
    return (
      <Link className={className} href={href}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

export function GuruHome({ name, daily, stats, aiCreditsRemaining }: GuruHomeProps) {
  const today = new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const firstAction = daily.todaysClasses[0] ?? daily.pendingTasks[0] ?? daily.recentResources[0];
  const classCount = daily.todaysClasses.length;
  const taskCount = daily.pendingTasks.length;
  const resourceCount = daily.recentResources.length;
  const todayClass = pickHeadline(
    daily.todaysClasses,
    "No classes scheduled yet",
    "Shape today by creating a class plan or opening your teaching workspace."
  );
  const pendingReview = pickHeadline(
    daily.pendingTasks,
    "Nothing urgent in review",
    "Your queue is calm right now. Use the space to prepare ahead."
  );
  const recentResource = pickHeadline(
    daily.recentResources,
    "No recent resources yet",
    "Build a reusable teaching library and it will appear here."
  );

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f4ec] text-[#111714]">
      <header className="brand-header mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link className="flex min-h-11 items-center gap-3 focus:outline-none focus:ring-4 focus:ring-[#20d16b]/30" href="/teacher">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#111714] text-sm font-bold tracking-[-.08em] text-[#20d16b] shadow-[0_10px_24px_rgba(17,23,20,.18)]">TX</span>
          <span><span className="block text-[11px] font-bold uppercase tracking-[.18em] text-[#51605a]">TeachX Guru</span><span className="block text-xs text-[#657069]">Teaching command center</span></span>
        </Link>
        <nav aria-label="Teacher home actions" className="flex items-center gap-2">
          <Link className="hidden min-h-11 items-center border border-[#cfd6cc] bg-white/80 px-4 text-sm font-semibold text-[#1a251f] transition hover:border-[#aeb9b1] hover:bg-white sm:inline-flex focus:outline-none focus:ring-4 focus:ring-[#20d16b]/30" href="/tara">Ask TeachX</Link>
          <Link className="inline-flex min-h-11 items-center gap-2 bg-[#111714] px-4 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(17,23,20,.2)] transition hover:-translate-y-0.5 hover:bg-[#1b2721] focus:outline-none focus:ring-4 focus:ring-[#20d16b]/30" href="/teacher/life/save-time"><span className="hidden sm:inline">Enter Save Time</span><span className="sm:hidden">Save Time</span><ArrowRight className="h-4 w-4 rtl-flip" aria-hidden="true" /></Link>
        </nav>
      </header>

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-14 pt-2 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden bg-[#111714] px-5 py-7 text-white shadow-[0_30px_80px_rgba(17,23,20,.2)] sm:px-8 sm:py-10 lg:min-h-[400px] lg:px-12 lg:py-12">
          <div aria-hidden="true" className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:36px_36px] [mask-image:linear-gradient(to_right,black,transparent_74%)]" />
          <div aria-hidden="true" className="absolute -left-36 bottom-0 h-64 w-64 rounded-full bg-[#20d16b]/20 blur-3xl" />
          <div aria-hidden="true" className="absolute right-[-4rem] top-[-4rem] h-52 w-52 rounded-full bg-[#68c7dd]/16 blur-3xl" />
          <div className="relative grid gap-4 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-12">
            <div className="motion-fade-up relative z-10 max-w-2xl">
              <p className="inline-flex items-center gap-2 border border-[#20d16b]/40 bg-[#20d16b]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[.16em] text-[#9ff2be]"><span className="h-1.5 w-1.5 rounded-full bg-[#20d16b]" />{today}</p>
              <h1 className="mt-5 text-4xl font-semibold leading-[.98] tracking-[-.055em] sm:text-5xl lg:text-[4.35rem]">Good morning,<br />{firstName(name)}.</h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/70 sm:text-lg">A polished command center for teaching, creating, and growing your practice without friction.</p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link className="inline-flex min-h-11 items-center gap-2 bg-[#20d16b] px-4 text-sm font-bold text-[#07140c] shadow-[0_12px_30px_rgba(32,209,107,.25)] transition hover:-translate-y-0.5 hover:bg-[#47df85] focus:outline-none focus:ring-4 focus:ring-white/35" href="/tara">Ask TeachX <Sparkles className="h-4 w-4" aria-hidden="true" /></Link>
                <span className="inline-flex min-h-11 items-center gap-2 border border-white/15 bg-white/5 px-3.5 text-sm text-white/75"><Sparkles className="h-4 w-4 text-[#20d16b]" aria-hidden="true" /><strong className="font-semibold text-white">{aiCreditsRemaining}</strong> AI credits available</span>
              </div>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <CommandBadge label="Today" value={countLabel(classCount, "class", "No classes yet")} />
                <CommandBadge label="Review queue" value={countLabel(taskCount, "item", "Queue is clear")} />
                <CommandBadge label="Library" value={countLabel(resourceCount, "recent resource", "Start your library")} />
              </div>
            </div>
            <div className="motion-fade-right relative min-h-[265px] lg:min-h-[330px]"><PrismArtwork /></div>
          </div>
        </section>

        <section aria-labelledby="today-heading" className="relative z-10 mx-auto -mt-2 max-w-6xl border border-[#d8ddd4] bg-[#fcfbf7] px-5 py-6 shadow-[0_20px_55px_rgba(17,23,20,.1)] sm:px-7 lg:-mt-7 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.17em] text-[#0c8d45]">Today&apos;s focus</p>
              <h2 id="today-heading" className="mt-2 text-2xl font-semibold tracking-[-.045em]">Move one thing forward.</h2>
              <p className="mt-2 text-sm leading-6 text-[#657069]">{firstAction ? firstAction.title : "Start with a plan, a lesson, or a question for TeachX."}</p>
              <Link className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#0c6f39] underline decoration-[#20d16b] decoration-2 underline-offset-4 hover:text-[#111714] focus:outline-none focus:ring-4 focus:ring-[#20d16b]/30" href="/teacher/life/save-time">Open today&apos;s workspace <ArrowRight className="h-4 w-4 rtl-flip" aria-hidden="true" /></Link>
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-[#e1e4dc] pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <Signal icon={CalendarCheck2} label="Today" value={countLabel(classCount, "class", "No classes planned")} note={classCount === 0 ? "Build your teaching day" : "Ready when you are"} />
              <Signal icon={CheckCircle2} label="To review" value={countLabel(taskCount, "task", "Nothing pending")} note={taskCount === 0 ? "Your queue is clear" : "Keep the flow moving"} />
              <Signal icon={FolderOpen} label="Recent material" value={countLabel(resourceCount, "resource", "No recent resources")} note={resourceCount === 0 ? "Create or add material" : "Continue where you left off"} />
            </div>
          </div>
        </section>

        <section aria-labelledby="spaces-heading" className="mt-12">
          <div className="mb-5 flex flex-col gap-3 border-b border-[#d7dcd3] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[.17em] text-[#0c8d45]">Operating spaces</p><h2 id="spaces-heading" className="mt-2 text-3xl font-semibold tracking-[-.05em] sm:text-4xl">One platform. Four dimensions.</h2></div>
            <p className="max-w-sm text-sm leading-6 text-[#657069]">Choose the space that fits the work in front of you—then stay in flow.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{spaces.map((space, index) => <SpaceCard index={index} key={space.title} space={space} />)}</div>
        </section>

        <section aria-labelledby="command-heading" className="mt-12">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.17em] text-[#0c8d45]">Command deck</p>
              <h2 id="command-heading" className="mt-2 text-3xl font-semibold tracking-[-.05em]">What deserves attention next.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#657069]">The home screen now surfaces the next meaningful move instead of making you hunt for it.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <FocusCard
              eyebrow="Teaching now"
              title={todayClass.title}
              meta={todayClass.meta ?? "Open your current teaching plan and continue."}
              href={todayClass.href ?? "/teacher/life/save-time"}
              accent="#20d16b"
              icon={CalendarCheck2}
            />
            <FocusCard
              eyebrow="Review and follow-up"
              title={pendingReview.title}
              meta={pendingReview.meta ?? "Keep momentum by handling the next pending item."}
              href={pendingReview.href ?? "/teacher/life/save-time"}
              accent="#f0b44c"
              icon={CheckCircle2}
            />
            <FocusCard
              eyebrow="Resource library"
              title={recentResource.title}
              meta={recentResource.meta ?? "Continue building reusable material for your classes."}
              href={recentResource.href ?? "/teacher/resources"}
              accent="#68c7dd"
              icon={FolderOpen}
            />
          </div>
        </section>

        <section aria-labelledby="quick-heading" className="mt-12 overflow-hidden rounded-[2rem] border border-[#d8ddd4] bg-[linear-gradient(180deg,#fffefb,#f4efe4)] p-5 shadow-[0_22px_50px_rgba(17,23,20,.08)] sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[.17em] text-[#0c8d45]">Quick launch</p>
              <h2 id="quick-heading" className="mt-2 text-3xl font-semibold tracking-[-.05em]">A cleaner executive view of your next moves.</h2>
              <p className="mt-3 text-sm leading-6 text-[#657069]">Open the exact workspace you need—teaching, resources, AI, or business—without leaving the command center feel.</p>
            </div>
            <div className="rounded-[1.5rem] border border-black/6 bg-white/80 px-4 py-3 text-sm text-[#4f5c56] shadow-[0_14px_32px_rgba(17,23,20,.06)]">
              <span className="font-semibold text-[#111714]">{stats.resourcesCreated}</span> resources created •{" "}
              <span className="font-semibold text-[#111714]">{stats.studentsHelped}</span> learners supported •{" "}
              <span className="font-semibold text-[#111714]">{stats.downloads}</span> downloads recorded
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Link className="group rounded-[1.4rem] border border-[#d7dcd3] bg-white px-4 py-4 shadow-[0_12px_26px_rgba(17,23,20,.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_34px_rgba(17,23,20,.1)] focus:outline-none focus:ring-4 focus:ring-[#20d16b]/25" href="/teacher/life/save-time">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0c8d45]">Teaching</p>
              <p className="mt-2 text-lg font-semibold tracking-[-.04em]">Open today&apos;s flow</p>
              <p className="mt-2 text-sm text-[#657069]">Classes, learners, and the work waiting for you.</p>
            </Link>
            <Link className="group rounded-[1.4rem] border border-[#d7dcd3] bg-white px-4 py-4 shadow-[0_12px_26px_rgba(17,23,20,.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_34px_rgba(17,23,20,.1)] focus:outline-none focus:ring-4 focus:ring-[#20d16b]/25" href="/teacher/ai-studio">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0c8d45]">AI studio</p>
              <p className="mt-2 text-lg font-semibold tracking-[-.04em]">Create with TeachX</p>
              <p className="mt-2 text-sm text-[#657069]">Generate lessons, worksheets, and support in one place.</p>
            </Link>
            <Link className="group rounded-[1.4rem] border border-[#d7dcd3] bg-white px-4 py-4 shadow-[0_12px_26px_rgba(17,23,20,.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_34px_rgba(17,23,20,.1)] focus:outline-none focus:ring-4 focus:ring-[#20d16b]/25" href="/teacher/resources">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0c8d45]">Resources</p>
              <p className="mt-2 text-lg font-semibold tracking-[-.04em]">Build your library</p>
              <p className="mt-2 text-sm text-[#657069]">Organize, revisit, and reuse your teaching material.</p>
            </Link>
            <Link className="group rounded-[1.4rem] border border-[#d7dcd3] bg-white px-4 py-4 shadow-[0_12px_26px_rgba(17,23,20,.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_34px_rgba(17,23,20,.1)] focus:outline-none focus:ring-4 focus:ring-[#20d16b]/25" href="/teacher/business/profile-preview">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0c8d45]">Business</p>
              <p className="mt-2 text-lg font-semibold tracking-[-.04em]">Grow your practice</p>
              <p className="mt-2 text-sm text-[#657069]">Profile, publishing, and professional momentum.</p>
            </Link>
          </div>
        </section>

        <section aria-labelledby="signals-heading" className="mt-12 border-y border-[#d7dcd3] py-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xs"><p className="text-xs font-bold uppercase tracking-[.17em] text-[#0c8d45]">Your signal</p><h2 id="signals-heading" className="mt-2 text-2xl font-semibold tracking-[-.045em]">The work you&apos;re building.</h2></div>
            <div className="grid flex-1 grid-cols-3 gap-3 sm:max-w-2xl sm:gap-0"><Signal icon={BookOpen} label="Resources created" value={stats.resourcesCreated.toString()} /><Signal icon={UsersRound} label="Learners helped" value={stats.studentsHelped.toString()} /><Signal icon={CircleDollarSign} label="Downloads recorded" value={stats.downloads.toString()} /></div>
          </div>
        </section>
      </main>
    </div>
  );
}
