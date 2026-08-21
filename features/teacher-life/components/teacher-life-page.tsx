"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Bot, BriefcaseBusiness, CalendarDays, Headphones, Heart, Plane, Search, Sparkles, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import type { getTeacherLifeData, TeacherLifePillar } from "@/services/teacher-life-service";

type Data = NonNullable<Awaited<ReturnType<typeof getTeacherLifeData>>>;

const linkClass = "flex min-h-12 items-center justify-between rounded-md border bg-surface px-4 py-3 text-sm font-medium hover:border-sky-300 hover:bg-sky-50";

function Destination({ title, detail, href }: { title: string; detail: string; href: string }) {
  return <Link className={linkClass} href={href}><span><strong className="block">{title}</strong><span className="mt-1 block text-xs font-normal text-muted-foreground">{detail}</span></span><ArrowRight className="h-4 w-4 shrink-0" /></Link>;
}

function SaveTime() {
  const groups = [
    { title: "Teach", items: [["Teaching workspace", "Classes, students, attendance, assignments and activities", "/teacher/workspace/classrooms"], ["Lessons", "Plan, save, schedule and teach", "/teacher/workspace/lessons"], ["Planner", "Calendar, events, tasks and reminders", "/teacher/workspace/planner"]] },
    { title: "Create", items: [["AI Studio", "Lessons, worksheets, quizzes, assessments, rubrics, homework and documents", "/teacher/ai-studio"], ["Resources", "Create, organize, publish and reuse", "/teacher/resources"], ["AI history", "Return to saved generations and versions", "/teacher/ai-studio/history"]] },
    { title: "Organize", items: [["Teacher notes", "Keep private teaching and preparation notes", "/teacher/workspace/notes"], ["Search", "Find authorized TeachX work", "/teacher/workspace/search"], ["Notifications", "Open teaching, community and business actions", "/teacher/workspace/notifications"]] },
    { title: "Get help", items: [["Ask TARA", "One AI companion with governed handoffs", "/tara"], ["AI Chat", "Work with your AI co-teacher", "/teacher/ai-studio/chat"], ["Help and support", "Guides, support requests and feedback", "/teacher/support"]] }
  ];
  return <div className="grid gap-6 lg:grid-cols-2">{groups.map((group) => <section key={group.title}><h2 className="mb-3 text-xl font-semibold">{group.title}</h2><div className="space-y-3">{group.items.map(([title, detail, href]) => <Destination detail={detail} href={href} key={title} title={title} />)}</div></section>)}</div>;
}

function EarnMore({ data }: { data: Data }) {
  return <div className="space-y-6"><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Destination detail={data.teacher.oneToOneActive ? "Your teaching profile is active" : "Complete and activate your 1:1 profile"} href="/teacher/business/one-to-one" title="Teach 1:1" /><Destination detail="Build your professional identity and selected work" href="/teacher/business/profile" title="Profile and portfolio" /><Destination detail="Publish resources through the existing marketplace" href="/teacher/business/publishing" title="Publish and sell" /><Destination detail="Submit constructive knowledge through the Happy Notes boundary" href="/teacher/business/happy-notes" title="Publish knowledge" /></section><Card className="p-5"><BriefcaseBusiness className="h-5 w-5 text-sky-700" /><h2 className="mt-3 text-xl font-semibold">Your earning workspace</h2><p className="mt-2 text-sm text-muted-foreground">Products, orders, earnings, wallet evidence, analytics and subscription settings remain in the canonical Business OS.</p><Link className="mt-4 inline-flex font-medium text-sky-700" href="/teacher/business/home">Open Business OS <ArrowRight className="ml-2 h-4 w-4" /></Link></Card></div>;
}

function LearnMore({ data }: { data: Data }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("ALL");
  const kinds = ["ALL", "AI_SKILLS", "PROFESSIONAL_DEVELOPMENT", "AUDIOBOOK", "BOOK", "VIDEO_COURSE", "RECORDED_WEBINAR"];
  const rows = useMemo(() => data.learning.filter((item) => (kind === "ALL" || item.kind === kind) && `${item.title} ${item.description} ${item.category} ${item.author}`.toLowerCase().includes(query.toLowerCase())), [data.learning, kind, query]);
  return <div className="space-y-7"><section><h2 className="text-xl font-semibold">Teacher learning library</h2><div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]"><label className="flex min-h-11 items-center gap-2 border bg-surface px-3"><Search className="h-4 w-4" /><Input className="border-0" onChange={(event) => setQuery(event.target.value)} placeholder="Search teacher learning" value={query} /></label><select className="min-h-11 border bg-surface px-3 text-sm" onChange={(event) => setKind(event.target.value)} value={kind}>{kinds.map((item) => <option key={item}>{item.replaceAll("_", " ")}</option>)}</select></div><div className="mt-4 flex flex-wrap gap-2">{[["AI Skills", Bot], ["Professional Development", Sparkles], ["Audiobooks", Headphones], ["Books", BookOpen], ["Video Courses", Video]].map(([label, Icon]) => { const I = Icon as typeof Bot; return <span className="inline-flex min-h-10 items-center gap-2 border bg-surface px-3 text-sm" key={label as string}><I className="h-4 w-4" />{label as string}</span>; })}</div>{rows.length ? <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map((item) => <Card className="p-5" key={item.id}><Badge>{item.kind.replaceAll("_", " ")}</Badge><h3 className="mt-3 font-semibold">{item.title}</h3><p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{item.description || "No description supplied by the publisher."}</p><p className="mt-3 text-xs text-muted-foreground">Access: {item.access === "PUBLISHER_DEFINED" ? "Set by publisher" : item.access}</p><Link className="mt-4 inline-flex text-sm font-medium text-sky-700" href={item.href}>{item.previewAvailable ? "Open details and preview" : "Open details"}</Link></Card>)}</div> : <EmptyState description="No teacher-learning content has been published into this boundary yet." icon={<BookOpen className="h-5 w-5" />} title="Learning catalog is ready for content" />}</section><section><h2 className="text-xl font-semibold">Webinars</h2>{data.webinars.length ? <div className="mt-4 grid gap-4 md:grid-cols-2">{data.webinars.map((item) => <Card className="p-5" key={item.id}><Badge>{item.state.replaceAll("_", " ")}</Badge><h3 className="mt-3 font-semibold">{item.title}</h3><p className="mt-2 text-sm text-muted-foreground">{new Date(item.startsAt).toLocaleString()}</p>{item.location ? <p className="mt-1 text-sm text-muted-foreground">{item.location}</p> : null}<p className="mt-3 text-sm">{item.description || "Details will be provided by the institution."}</p></Card>)}</div> : <EmptyState description="Upcoming and recorded sessions will appear when real webinar events are published." icon={<CalendarDays className="h-5 w-5" />} title="No webinars published" />}</section><Card className="p-5"><h2 className="font-semibold">Access</h2><p className="mt-2 text-sm text-muted-foreground">{data.subscription?.active ? `${data.subscription.name} is active. Each publisher still controls free or premium access.` : "No active teacher learning subscription is recorded. Free content remains available when published."}</p></Card></div>;
}

function EnjoyMore() {
  return <div className="space-y-7"><section className="py-10 text-center"><Heart className="mx-auto h-8 w-8 text-rose-600" /><p className="mt-4 text-sm font-medium text-rose-700">Coming soon</p><h2 className="mt-2 text-3xl font-semibold">More life beyond the classroom.</h2><p className="mx-auto mt-3 max-w-2xl text-muted-foreground">TeachX is preparing a future destination for trusted teacher life experiences. No offers, partners, prices, or bookings are available yet.</p></section><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[["Travel", Plane], ["Family Experiences", Heart], ["Wellness", Sparkles], ["Leisure", BookOpen], ["Teacher Experiences", BriefcaseBusiness]].map(([title, Icon]) => { const I = Icon as typeof Plane; return <Card className="p-4" key={title as string}><I className="h-5 w-5 text-sky-700" /><h3 className="mt-3 font-semibold">{title as string}</h3><p className="mt-2 text-xs text-muted-foreground">Future category</p></Card>; })}</div></div>;
}

const titles: Record<TeacherLifePillar, [string, string]> = {
  "save-time": ["Save Time", "Teach, create, plan and organize with less friction."],
  "earn-more": ["Earn More", "Build your professional identity, publish and grow."],
  "learn-more": ["Learn More", "Develop AI, teaching and professional skills."],
  "enjoy-more": ["Enjoy More", "More life beyond the classroom."]
};

export function TeacherLifePage({ pillar, data }: { pillar: TeacherLifePillar; data: Data }) {
  const [title, description] = titles[pillar];
  return <div className="min-w-0 space-y-7"><nav className="text-sm text-muted-foreground"><Link href="/teacher">Teacher Home</Link><span className="mx-2">/</span><span>{title}</span></nav><header className="border-b pb-6"><Badge>Teacher Life OS</Badge><h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h1><p className="mt-2 max-w-3xl text-muted-foreground">{description}</p></header><nav className="flex gap-2 overflow-x-auto pb-2" aria-label="Teacher Life OS pillars">{Object.entries(titles).map(([slug, item]) => <Link aria-current={slug === pillar ? "page" : undefined} className={`min-h-11 shrink-0 rounded-md px-4 py-3 text-sm font-medium ${slug === pillar ? "bg-primary text-primary-foreground" : "border bg-surface"}`} href={`/teacher/life/${slug}`} key={slug}>{item[0]}</Link>)}</nav>{pillar === "save-time" ? <SaveTime /> : pillar === "earn-more" ? <EarnMore data={data} /> : pillar === "learn-more" ? <LearnMore data={data} /> : <EnjoyMore />}</div>;
}
