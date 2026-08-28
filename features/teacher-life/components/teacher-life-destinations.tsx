"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, CalendarDays,
  ChevronDown, Heart, Library, MessageCircle, Plane,
  Search, Sparkles, UsersRound
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { TeacherLifeSwitcher } from "@/features/teacher-life/components/teacher-life-switcher";
import type { getTeacherLifeData } from "@/services/teacher-life-service";
import type { getTeacherBusinessData } from "@/services/teacher-business-service";

type Data = NonNullable<Awaited<ReturnType<typeof getTeacherLifeData>>>;
type BusinessData = NonNullable<Awaited<ReturnType<typeof getTeacherBusinessData>>>;

function LifeContext({ active, eyebrow, title, detail, tone }: { active: string; eyebrow: string; title: string; detail: string; tone: string }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="flex min-h-11 items-center gap-2 text-sm text-muted-foreground">
        <Link className="hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary" href="/teacher">Teacher Home</Link>
        <span aria-hidden="true">/</span><span aria-current="page">{active}</span>
      </nav>
      <header className={`overflow-hidden rounded-md border p-5 shadow-soft sm:p-8 ${tone}`}>
        <p className="text-xs font-bold uppercase tracking-[.18em] opacity-75">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 opacity-80 sm:text-base">{detail}</p>
      </header>
      <TeacherLifeSwitcher active={active.toLowerCase().replaceAll(" ", "-") as "earn-more" | "learn-more" | "enjoy-more"} />
    </>
  );
}

function EarnMoreHub({ data }: { data: BusinessData }) {
  const activeServices = data.earningServices.filter((service) => service.status === "PUBLISHED");
  const pendingRequests = data.bookingRequests.filter((request) => request.status === "PENDING");
  const money = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: data.earnings.currency, maximumFractionDigits: 0 }).format(amount);
  const nextAction = activeServices.length ? { label: "Manage My Services", href: "/teacher/business/services", detail: "Keep your offerings and plans current." } : { label: "Create your first service", href: "/teacher/business/services?create=TEACH", detail: "Start with the knowledge you already teach." };
  return <main className="min-w-0 space-y-6 pb-8">
    <LifeContext active="Earn More" eyebrow="Teacher Business OS" title="Your knowledge can earn." detail="Create an offering, keep track of real requests, and grow at your own pace." tone="border-emerald-900 bg-emerald-950 text-white" />
    <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
      <article className="border-l-4 border-emerald-600 bg-surface p-5 shadow-soft sm:p-7"><p className="text-sm font-semibold text-emerald-800">This period</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">{money(data.earnings.currentPeriod)}</h2><dl className="mt-6 grid grid-cols-2 gap-4 border-t pt-4 text-sm"><div><dt className="text-muted-foreground">Available</dt><dd className="mt-1 text-lg font-semibold">{money(data.earnings.available)}</dd></div><div><dt className="text-muted-foreground">Pending</dt><dd className="mt-1 text-lg font-semibold">{money(data.earnings.pending)}</dd></div></dl><Link className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-emerald-800 hover:underline focus:outline-none focus:ring-2 focus:ring-primary" href="/teacher/business/earnings">View recorded earnings <ArrowRight className="h-4 w-4" /></Link></article>
      <aside className="border bg-[#fff9e8] p-5 sm:p-7"><p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-900">Next step</p><h2 className="mt-3 text-xl font-semibold">{nextAction.label}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{nextAction.detail}</p><Link className="mt-5 inline-flex min-h-11 items-center gap-2 bg-emerald-950 px-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2" href={nextAction.href}>{nextAction.label} <ArrowRight className="h-4 w-4" /></Link></aside>
    </section>
    <details className="group border border-emerald-200 bg-surface shadow-soft"><summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 bg-emerald-50/70 px-5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"><span><span className="mr-2 text-emerald-800">+</span>Create</span><span className="flex items-center gap-2 text-xs font-normal text-muted-foreground">Choose what you want to offer <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open:rotate-180" /></span></summary><div className="grid gap-px border-t bg-border sm:grid-cols-2"><Link className="bg-surface p-4 text-sm hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-primary" href="/teacher/business/services?create=TEACH"><b className="block">Teach</b><span className="mt-1 block text-muted-foreground">Create a one-to-one teaching service.</span></Link><Link className="bg-surface p-4 text-sm hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-primary" href="/teacher/business/services?create=MENTOR"><b className="block">Mentor</b><span className="mt-1 block text-muted-foreground">Create a mentoring offer and plans.</span></Link><Link className="bg-surface p-4 text-sm hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-primary" href="/teacher/business/services?create=TRAIN"><b className="block">Train</b><span className="mt-1 block text-muted-foreground">Create a practical-skills training service.</span></Link><Link className="bg-surface p-4 text-sm hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-primary" href="/teacher/business/publishing"><b className="block">Publish a recorded program</b><span className="mt-1 block text-muted-foreground">Use the existing resource publishing workflow.</span></Link><div className="bg-muted/50 p-4 text-sm sm:col-span-2"><b className="block">Live program</b><span className="mt-1 block text-muted-foreground">Live-program registration and checkout are not available yet.</span></div></div></details>
    <section className="grid gap-4 lg:grid-cols-2"><article className="border bg-surface p-5"><div className="flex items-baseline justify-between gap-3"><div><p className="text-sm font-semibold text-emerald-800">My Services</p><h2 className="mt-1 text-xl font-semibold">{activeServices.length} active service{activeServices.length === 1 ? "" : "s"}</h2></div><Link className="text-sm font-semibold text-emerald-800 hover:underline" href="/teacher/business/services">Manage</Link></div>{data.earningServices.length ? <div className="mt-4 space-y-3">{data.earningServices.slice(0, 3).map((service) => <div className="border-b pb-3 text-sm" key={service.id}><b>{service.title}</b><p className="mt-1 text-muted-foreground">{service.type} - {service.status} - {service.plans.length} active plan{service.plans.length === 1 ? "" : "s"}</p></div>)}</div> : <p className="mt-4 text-sm leading-6 text-muted-foreground">No services yet. Use Create to add Teach, Mentor, or Train.</p>}</article><article className="border bg-surface p-5"><div className="flex items-baseline justify-between gap-3"><div><p className="text-sm font-semibold text-emerald-800">Upcoming</p><h2 className="mt-1 text-xl font-semibold">{pendingRequests.length} pending request{pendingRequests.length === 1 ? "" : "s"}</h2></div><Link className="text-sm font-semibold text-emerald-800 hover:underline" href="/communication">Open</Link></div>{data.bookingRequests.length ? <div className="mt-4 space-y-3">{data.bookingRequests.slice(0, 3).map((request) => <div className="border-b pb-3 text-sm" key={request.id}><b>{request.subject}</b><p className="mt-1 text-muted-foreground">{request.preferredDate ? new Date(request.preferredDate).toLocaleDateString() : "No preferred date"}{request.preferredTime ? ` - ${request.preferredTime}` : ""} - {request.status}</p></div>)}</div> : <p className="mt-4 text-sm leading-6 text-muted-foreground">No booking requests have been received.</p>}</article></section>
    <p className="border-l-2 border-amber-500 pl-3 text-sm leading-6 text-muted-foreground">Customer checkout, commissions, payouts, and live-program registration are not available yet. TeachX shows only the financial and service records it can verify.</p>
    <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary" href="/teacher"><ArrowLeft className="h-4 w-4" />Return to Teacher Home</Link>
  </main>;
}

export function TeacherEarnMorePage({ data }: { data: BusinessData }) {
  return <EarnMoreHub data={data} />;
}


const learningKinds = [
  ["All learning", "ALL"], ["AI skills", "AI_SKILLS"], ["Professional development", "PROFESSIONAL_DEVELOPMENT"], ["Books", "BOOK"], ["Video courses", "VIDEO_COURSE"], ["Webinars", "WEBINAR"]
] as const;

export function TeacherLearnMorePage({ data }: { data: Data }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<string>("ALL");
  const items = useMemo(() => data.learning.filter((item) => (kind === "ALL" || item.kind === kind) && `${item.title} ${item.description ?? ""} ${item.category ?? ""} ${item.author ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())), [data.learning, kind, query]);
  return <main className="min-w-0 space-y-7 pb-8">
    <LifeContext active="Learn More" eyebrow="Teacher learning library" title="A calmer place to keep growing." detail="Explore only published professional learning, webinars, and learning access that your Teacher workspace can genuinely provide." tone="border-[#1e4f89] bg-[linear-gradient(125deg,#0b315f,#1d5f9c_64%,#eabf58)] text-white" />
    <section className="grid gap-4 lg:grid-cols-[.78fr_1.22fr]"><aside className="border border-amber-200 bg-[#fffaf0] p-5"><Library className="h-6 w-6 text-amber-800" /><h2 className="mt-4 text-xl font-semibold">Your access</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{data.subscription?.active ? `${data.subscription.name} is active. Each publisher controls access to their content.` : "No active learning subscription is recorded. Free content remains available when published."}</p><Link className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#1e4f89] hover:underline" href="/teacher/business/subscription">Subscription details <ArrowRight className="h-4 w-4" /></Link></aside><Card className="p-5"><p className="text-sm font-semibold text-[#1e4f89]">Workshop shelf</p><h2 className="mt-1 text-2xl font-semibold">Choose a way to learn</h2><div className="mt-4 flex flex-wrap gap-2">{learningKinds.map(([label, value]) => <button className={`min-h-11 border px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary ${kind === value ? "border-[#1e4f89] bg-[#1e4f89] text-white" : "bg-surface hover:bg-amber-50"}`} key={value} onClick={() => setKind(value)} type="button">{label}</button>)}</div></Card></section>
    <section aria-labelledby="published-learning"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-[#1e4f89]">Published learning</p><h2 className="mt-1 text-2xl font-semibold" id="published-learning">Find a useful next lesson</h2></div><label className="flex min-h-11 w-full items-center gap-2 border bg-surface px-3 sm:max-w-md"><Search className="h-4 w-4 text-muted-foreground" /><span className="sr-only">Search teacher learning</span><Input className="border-0 px-0 focus-visible:ring-0" onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, topics or authors" value={query} /></label></div>{items.length ? <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <article className="border bg-surface p-5 shadow-soft" key={item.id}><Badge className="bg-amber-100 text-amber-950">{item.kind.replaceAll("_", " ")}</Badge><h3 className="mt-4 text-lg font-semibold">{item.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{item.description || "No description supplied by the publisher."}</p><p className="mt-4 text-xs font-semibold text-muted-foreground">{item.access === "PUBLISHER_DEFINED" ? "Access set by publisher" : `Access: ${item.access}`}</p><Link className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#1e4f89] hover:underline" href={item.href}>{item.previewAvailable ? "Open details" : "View item"}<ArrowRight className="h-4 w-4" /></Link></article>)}</div> : <div className="mt-5"><EmptyState description="Published teacher-learning content will appear here. There is no placeholder catalogue." icon={<BookOpen className="h-5 w-5" />} title="No matching learning published yet" /></div>}</section>
    <section aria-labelledby="webinars"><p className="text-sm font-semibold text-[#1e4f89]">Sessions</p><h2 className="mt-1 text-2xl font-semibold" id="webinars">Webinars and workshops</h2>{data.webinars.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{data.webinars.map((item) => <article className="border-l-4 border-l-amber-400 bg-surface p-5 shadow-soft" key={item.id}><Badge>{item.state.replaceAll("_", " ")}</Badge><h3 className="mt-3 font-semibold">{item.title}</h3><p className="mt-2 text-sm text-muted-foreground">{new Date(item.startsAt).toLocaleString()}{item.location ? ` \u00b7 ${item.location}` : ""}</p></article>)}</div> : <div className="mt-4"><EmptyState description="Real upcoming and recorded sessions will be listed here when published." icon={<CalendarDays className="h-5 w-5" />} title="No webinars published" /></div>}</section>
    <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary" href="/teacher"><ArrowLeft className="h-4 w-4" />Return to Teacher Home</Link>
  </main>;
}

export function TeacherEnjoyMorePage() {
  const nextActions = [
    { title: "Join the teacher community", detail: "Connect with colleagues in TeachX Community.", href: "/teacher/community/home", icon: UsersRound },
    { title: "Return to your teaching day", detail: "Open the Teacher Home command center.", href: "/teacher", icon: Sparkles },
    { title: "Explore TeachX", detail: "Find the tools already available to you.", href: "/teacher/workspace/classrooms", icon: MessageCircle }
  ];
  return <main className="min-w-0 space-y-7 pb-8">
    <LifeContext active="Enjoy More" eyebrow="Teacher life, considered" title="Space for the life around your teaching." detail="A future home for thoughtful teacher experiences. We will only show options after they have been verified and are genuinely available." tone="border-rose-300 bg-[linear-gradient(125deg,#fdf1eb,#f8d8ce_57%,#d69283)] text-[#562b2a]" />
    <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]"><div className="border border-rose-200 bg-[#fffaf7] p-6 sm:p-9"><Heart className="h-8 w-8 text-rose-700" aria-hidden="true" /><Badge className="mt-5 bg-rose-100 text-rose-900">Not available yet</Badge><h2 className="mt-4 text-3xl font-semibold tracking-tight">We are not pretending there are offers here.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-[#6b4943]">Travel, wellbeing, family and leisure experiences will appear only when TeachX has verified a real offer. There are currently no partners, prices, bookings or special offers to show.</p></div><aside className="relative overflow-hidden border border-[#d9b59d] bg-[#7d4b45] p-6 text-[#fff8f2]"><Plane className="absolute -right-6 -top-5 h-32 w-32 rotate-[-18deg] opacity-15" aria-hidden="true" /><p className="relative text-xs font-bold uppercase tracking-[.18em] text-[#f4c8af]">Until then</p><h2 className="relative mt-3 text-2xl font-semibold">A little more room to breathe.</h2><p className="relative mt-3 text-sm leading-6 text-white/75">Keep your teaching world organised, then use the real community and workspace tools that are available today.</p></aside></section>
    <section aria-labelledby="available-now"><p className="text-sm font-semibold text-rose-800">Available now</p><h2 className="mt-1 text-2xl font-semibold" id="available-now">Three real places to go next</h2><div className="mt-5 grid gap-3 md:grid-cols-3">{nextActions.map(({ title, detail, href, icon: Icon }) => <Link className="group flex min-h-40 flex-col justify-between border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-primary motion-reduce:transform-none" href={href} key={href}><span className="grid h-10 w-10 place-items-center bg-rose-100 text-rose-800"><Icon className="h-5 w-5" /></span><span><strong className="block">{title}</strong><span className="mt-2 block text-sm leading-6 text-muted-foreground">{detail}</span></span><ArrowRight className="mt-4 h-4 w-4 transition group-hover:translate-x-1 motion-reduce:transform-none" /></Link>)}</div></section>
    <section className="border border-dashed border-rose-300 bg-rose-50 p-6"><p className="text-sm font-semibold text-rose-900">What you can expect later</p><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">When verified experiences become available, this page will clearly identify them and their terms. Until then, it stays honest and useful.</p></section>
    <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary" href="/teacher"><ArrowLeft className="h-4 w-4" />Return to Teacher Home</Link>
  </main>;
}
