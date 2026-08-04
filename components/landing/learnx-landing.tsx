import Link from "next/link";
import { BookOpen, BrainCircuit, CalendarDays, ChartNoAxesCombined, Sparkles } from "lucide-react";

const highlights = [
  ["Personal learning", "A clear daily plan shaped around your classes, progress, and goals.", BookOpen],
  ["AI tutor", "Ask questions, practise concepts, and get patient step-by-step guidance.", BrainCircuit],
  ["Practice and progress", "Turn everyday study into focused practice with progress you can understand.", ChartNoAxesCombined],
  ["Your learning day", "Classes, assignments, learning resources, and reminders in one place.", CalendarDays]
];

export function LearnXLanding() {
  return <main className="min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-cyan-50 text-foreground">
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <Link className="flex items-center gap-3" href="/"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 font-semibold text-white shadow-lg">LX</span><span><strong className="block text-lg">LearnX Guru</strong><span className="block text-xs text-muted-foreground">Your AI learning space</span></span></Link>
      <nav className="flex items-center gap-2"><Link className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" href="/login">Login</Link><Link className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700" href="/signup/student">Get started</Link></nav>
    </header>
    <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:pt-24">
      <div><p className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-semibold text-indigo-700"><Sparkles className="h-4 w-4"/>The AI learning operating system</p><h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">Learn with clarity. Grow with confidence.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">LearnX Guru brings your courses, practice, AI tutor, assignments, and progress together in one calm personal workspace.</p><div className="mt-8 flex flex-wrap gap-3"><Link className="rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700" href="/signup/student">Start learning</Link><Link className="rounded-2xl border bg-white px-6 py-3 font-semibold hover:bg-indigo-50" href="/login">Continue learning</Link></div></div>
      <div className="rounded-[2rem] border border-indigo-100 bg-white/85 p-6 shadow-xl shadow-indigo-100/60"><p className="text-sm font-semibold text-indigo-700">Today in LearnX</p><h2 className="mt-2 text-2xl font-semibold">Your next best step</h2><div className="mt-6 space-y-3">{["Continue your learning path", "Complete one focused practice set", "Review your class resources"].map((item, index) => <div className="flex items-center gap-3 rounded-2xl bg-indigo-50 p-4" key={item}><span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-600 text-sm font-semibold text-white">{index + 1}</span><span className="font-medium">{item}</span></div>)}</div></div>
    </section>
    <section className="mx-auto grid w-full max-w-6xl gap-5 px-5 pb-20 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">{highlights.map(([title, description, Icon]) => <article className="rounded-3xl border border-indigo-100 bg-white/80 p-6 shadow-sm" key={title as string}><Icon className="h-6 w-6 text-indigo-600"/><h2 className="mt-5 text-xl font-semibold">{title as string}</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">{description as string}</p></article>)}</section>
  </main>;
}