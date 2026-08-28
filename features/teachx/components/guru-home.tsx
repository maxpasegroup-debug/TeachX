import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Brain,
  CalendarCheck2,
  CircleDollarSign,
  Heart
} from "lucide-react";

type ListItem = {
  title: string;
  meta?: string | null;
  href?: string | null;
};

// Keep this public interface compatible with the existing teacher route. Home is
// intentionally a destination chooser, so none of the supplied dashboard data
// is displayed here.
type GuruHomeProps = {
  name?: string | null;
  daily: { todaysClasses: ListItem[]; pendingTasks: ListItem[]; recentResources: ListItem[] };
  stats: { resourcesCreated: number; studentsHelped: number; downloads: number };
  aiCreditsRemaining: number;
};

type TeacherSpace = {
  title: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  accentSoft: string;
  art: "calendar" | "growth" | "learn" | "heart";
};

const spaces: TeacherSpace[] = [
  {
    title: "Save Time",
    label: "Organize",
    description: "Plan, teach, and keep your everyday work moving with clarity.",
    href: "/teacher/life/save-time",
    icon: CalendarCheck2,
    accent: "#0b8c50",
    accentSoft: "#d8f5e5",
    art: "calendar"
  },
  {
    title: "Earn More",
    label: "Grow",
    description: "Build your professional presence and create new opportunities.",
    href: "/teacher/life/earn-more",
    icon: CircleDollarSign,
    accent: "#b56d00",
    accentSoft: "#fff0cf",
    art: "growth"
  },
  {
    title: "Learn More",
    label: "Develop",
    description: "Explore ideas and sharpen the skills that support your teaching.",
    href: "/teacher/life/learn-more",
    icon: Brain,
    accent: "#087a9b",
    accentSoft: "#d9f3f8",
    art: "learn"
  },
  {
    title: "Enjoy More",
    label: "Connect",
    description: "Make space for community, wellbeing, and what matters around work.",
    href: "/teacher/life/enjoy-more",
    icon: Heart,
    accent: "#b43e68",
    accentSoft: "#fbe1e9",
    art: "heart"
  }
];

function CardArtwork({ kind, accent }: { kind: TeacherSpace["art"]; accent: string }) {
  if (kind === "calendar") {
    return <><span className="absolute left-1/2 top-1/2 h-28 w-36 -translate-x-1/2 -translate-y-1/2 border-2 bg-white/70 shadow-[10px_12px_0_rgba(17,23,20,.08)]" /><span className="absolute left-[32%] top-[28%] h-3 w-3 rounded-full" style={{ backgroundColor: accent }} /><span className="absolute right-[30%] top-[28%] h-3 w-3 rounded-full" style={{ backgroundColor: accent }} /><span className="absolute left-[34%] top-[45%] h-1.5 w-14 bg-[#1d2922]/20" /><span className="absolute left-[34%] top-[57%] h-1.5 w-10 bg-[#1d2922]/20" /><span className="absolute left-[34%] top-[69%] h-1.5 w-16 bg-[#1d2922]/20" /></>;
  }
  if (kind === "growth") {
    return <><span className="absolute bottom-[26%] left-[27%] h-8 w-8 bg-white/75 shadow-[8px_9px_0_rgba(17,23,20,.08)]" /><span className="absolute bottom-[26%] left-1/2 h-14 w-8 -translate-x-1/2 bg-white/75 shadow-[8px_9px_0_rgba(17,23,20,.08)]" /><span className="absolute bottom-[26%] right-[27%] h-24 w-8 bg-white/75 shadow-[8px_9px_0_rgba(17,23,20,.08)]" /><span className="absolute left-[27%] top-[28%] h-px w-[48%] origin-left -rotate-[25deg]" style={{ backgroundColor: accent }} /><span className="absolute right-[24%] top-[22%] h-0 w-0 border-b-[8px] border-l-[14px] border-t-[8px] border-b-transparent border-t-transparent" style={{ borderLeftColor: accent }} /></>;
  }
  if (kind === "learn") {
    return <><span className="absolute left-[29%] top-[33%] h-20 w-20 rotate-[-12deg] border-2 border-white/80 bg-white/65 shadow-[10px_12px_0_rgba(17,23,20,.08)]" /><span className="absolute right-[25%] top-[44%] h-20 w-20 rotate-[12deg] border-2 border-white/80 bg-white/65 shadow-[10px_12px_0_rgba(17,23,20,.08)]" /><span className="absolute left-[38%] top-[48%] h-px w-12 rotate-[-12deg]" style={{ backgroundColor: accent }} /><span className="absolute right-[32%] top-[59%] h-px w-12 rotate-[12deg]" style={{ backgroundColor: accent }} /></>;
  }
  return <><span className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-white/75 bg-white/60 shadow-[11px_11px_0_rgba(17,23,20,.08)]" /><span className="absolute left-[38%] top-[42%] h-7 w-7 rounded-full bg-white/85" /><span className="absolute right-[38%] top-[42%] h-7 w-7 rounded-full bg-white/85" /><span className="absolute left-1/2 top-[57%] h-7 w-7 -translate-x-1/2 rotate-45 bg-white/85" /></>;
}

function SpaceCard({ space }: { space: TeacherSpace }) {
  const Icon = space.icon;
  return (
    <Link
      aria-label={`Open ${space.title}`}
      className="group relative grid min-h-[280px] overflow-hidden border border-[#d8ddd4] bg-[#fffdf8] p-6 shadow-[0_18px_44px_rgba(20,28,23,.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_55px_rgba(20,28,23,.14)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0b8c50]/30 motion-reduce:transition-none sm:min-h-[320px] sm:p-8"
      href={space.href}
    >
      <div aria-hidden="true" className="absolute -right-20 -top-20 h-52 w-52 rounded-full opacity-65 blur-3xl transition duration-500 group-hover:scale-125 motion-reduce:transition-none" style={{ backgroundColor: space.accentSoft }} />
      <div aria-hidden="true" className="absolute right-5 top-5 h-36 w-40 transition duration-500 group-hover:-translate-y-2 group-hover:rotate-2 motion-reduce:transition-none"><CardArtwork accent={space.accent} kind={space.art} /></div>
      <div className="relative z-10 flex max-w-[18rem] flex-col items-start">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.2em]" style={{ color: space.accent }}><Icon aria-hidden="true" className="h-4 w-4" />{space.label}</span>
        <h2 className="mt-5 text-3xl font-semibold tracking-[-.055em] text-[#111714] sm:text-[2.35rem]">{space.title}</h2>
        <p className="mt-3 text-sm leading-6 text-[#5a665f] sm:text-base">{space.description}</p>
      </div>
      <span className="relative z-10 mt-auto flex min-h-11 items-center gap-2 pt-7 text-sm font-bold" style={{ color: space.accent }}>Open workspace <span className="grid h-10 w-10 place-items-center bg-[#111714] text-white transition group-hover:translate-x-1 group-hover:bg-[#1d2c23] motion-reduce:transition-none"><ArrowRight aria-hidden="true" className="h-4 w-4 rtl-flip" /></span></span>
    </Link>
  );
}

export function GuruHome(_props?: Partial<GuruHomeProps>) {
  return (
    <main id="main-content" className="min-h-full bg-[#f7f3ea] px-4 py-8 text-[#111714] sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section aria-labelledby="teacher-spaces-heading">
          <h1 id="teacher-spaces-heading" className="sr-only">Teacher workspaces</h1>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {spaces.map((space) => <SpaceCard key={space.title} space={space} />)}
          </div>
        </section>
      </div>
    </main>
  );
}
