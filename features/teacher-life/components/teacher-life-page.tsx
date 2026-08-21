"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight, BadgeIndianRupee, BookOpen, Bot, Brain, CalendarDays, Check,
  CircleDollarSign, Clock3, Headphones, Heart, Plane, Search, Sparkles,
  UsersRound, Video
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import type { getTeacherLifeData, TeacherLifePillar } from "@/services/teacher-life-service";

type Data = NonNullable<Awaited<ReturnType<typeof getTeacherLifeData>>>;
type Destination = { title: string; detail: string; href: string };

const pillarDetails: Record<TeacherLifePillar, { title: string; description: string; icon: LucideIcon; tone: string }> = {
  "save-time": { title: "Save Time", description: "Your AI-powered teaching workspace.", icon: Clock3, tone: "border-sky-200 bg-sky-50 text-sky-900" },
  "earn-more": { title: "Earn More", description: "Turn your knowledge into opportunity.", icon: CircleDollarSign, tone: "border-emerald-200 bg-emerald-50 text-emerald-900" },
  "learn-more": { title: "Learn More", description: "Invest in yourself.", icon: Brain, tone: "border-amber-200 bg-amber-50 text-amber-950" },
  "enjoy-more": { title: "Enjoy More", description: "Because life beyond the classroom matters too.", icon: Heart, tone: "border-rose-200 bg-rose-50 text-rose-950" }
};

function ActionLink({ title, detail, href }: Destination) {
  return (
    <Link className="group flex min-h-16 items-center justify-between gap-4 rounded-md border bg-surface px-4 py-3 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary motion-reduce:transform-none" href={href}>
      <span className="min-w-0"><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs font-normal leading-5 text-muted-foreground">{detail}</span></span>
      <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
    </Link>
  );
}

function PillarNav({ active }: { active: TeacherLifePillar }) {
  return (
    <nav className="grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="Teacher Life OS pillars">
      {(Object.entries(pillarDetails) as [TeacherLifePillar, (typeof pillarDetails)[TeacherLifePillar]][]).map(([slug, item]) => {
        const Icon = item.icon;
        return <Link aria-current={slug === active ? "page" : undefined} className={`flex min-h-14 items-center gap-3 rounded-md border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary ${slug === active ? item.tone : "bg-surface hover:bg-muted"}`} href={`/teacher/life/${slug}`} key={slug}><Icon className="h-4 w-4 shrink-0" aria-hidden="true" />{item.title}</Link>;
      })}
    </nav>
  );
}

const saveTimeGroups: { title: string; subtitle: string; items: Destination[] }[] = [
  {
    title: "Teach & Plan", subtitle: "Move from preparation to the classroom.", items: [
      { title: "Lesson Planner", detail: "Plan and schedule a lesson", href: "/teacher/workspace/lessons" },
      { title: "Lessons", detail: "Open your existing lesson workspace", href: "/teacher/workspace/lessons" },
      { title: "Weekly Planning", detail: "See the week and upcoming work", href: "/teacher/workspace/planner" },
      { title: "Class Schedule", detail: "See classes, subjects and preparation", href: "/teacher/workspace/planner" },
      { title: "Teaching Workspace", detail: "Classes, students and classroom work", href: "/teacher/workspace/classrooms" },
      { title: "Planner", detail: "Calendar, events, reminders and tasks", href: "/teacher/workspace/planner" }
    ]
  },
  {
    title: "Create", subtitle: "Build classroom-ready work with the existing AI Studio.", items: [
      { title: "Lesson Generator", detail: "Create a complete classroom lesson", href: "/teacher/ai-studio/create/lesson-generator" },
      { title: "Worksheet Generator", detail: "Create printable practice material", href: "/teacher/ai-studio/create/worksheet-generator" },
      { title: "Quiz Generator", detail: "Build quizzes and question banks", href: "/teacher/ai-studio/create/quiz-generator" },
      { title: "Question Paper Builder", detail: "Create blueprint-aligned papers", href: "/teacher/ai-studio/create/question-paper-builder" },
      { title: "Assessment Builder", detail: "Create aligned assessments", href: "/teacher/ai-studio/create/assessment-builder" },
      { title: "Rubric Generator", detail: "Create editable scoring rubrics", href: "/teacher/ai-studio/create/rubric-generator" },
      { title: "Homework Generator", detail: "Prepare focused homework", href: "/teacher/ai-studio/create/homework-generator" },
      { title: "Classroom Activity", detail: "Design practical class activities", href: "/teacher/ai-studio/create/classroom-activity-generator" },
      { title: "Presentation / PPT", detail: "Create a slide-by-slide presentation", href: "/teacher/ai-studio/create/presentation-generator" },
      { title: "Certificate Generator", detail: "Prepare personalized certificates", href: "/teacher/ai-studio/create/certificate-generator" },
      { title: "Report / Comment Generator", detail: "Draft balanced report comments", href: "/teacher/ai-studio/create/report-card-comments" }
    ]
  },
  {
    title: "Communicate", subtitle: "Prepare clear communication and stay connected.", items: [
      { title: "Parent Communication", detail: "Draft respectful parent messages", href: "/teacher/ai-studio/create/parent-communication" },
      { title: "Messages", detail: "Open professional conversations", href: "/teacher/community/messages" },
      { title: "Announcements", detail: "Open community discussions and announcements", href: "/teacher/community/discussions" },
      { title: "Emails", detail: "Prepare a professional email", href: "/teacher/ai-studio/create/parent-communication" },
      { title: "Student Feedback", detail: "Prepare evidence-based comments", href: "/teacher/ai-studio/create/report-card-comments" }
    ]
  },
  {
    title: "Organize", subtitle: "Keep teaching work easy to find and act on.", items: [
      { title: "Classes", detail: "Open your assigned classes", href: "/teacher/workspace/classrooms" },
      { title: "Students", detail: "View students through authorized classes", href: "/teacher/workspace/classrooms" },
      { title: "Resources", detail: "Create, organize and reuse resources", href: "/teacher/resources" },
      { title: "Assignments", detail: "Open classroom assignments", href: "/teacher/workspace/classrooms" },
      { title: "Attendance", detail: "Open class attendance", href: "/teacher/workspace/classrooms" },
      { title: "Tasks", detail: "Create and complete teaching tasks", href: "/teacher/workspace/planner" },
      { title: "Notes", detail: "Keep private teacher notes", href: "/teacher/workspace/notes" },
      { title: "Calendar", detail: "Day, week, month and agenda planning", href: "/teacher/workspace/planner" },
      { title: "Documents", detail: "Find teaching documents and files", href: "/teacher/resources" }
    ]
  },
  {
    title: "TARA", subtitle: "One AI partner across your teaching day.", items: [
      { title: "Ask TARA", detail: "Talk naturally about the work ahead", href: "/tara" },
      { title: "Plan with TARA", detail: "Plan lessons, days and weeks", href: "/tara" },
      { title: "Create with TARA", detail: "Turn an idea into usable teaching work", href: "/tara" },
      { title: "Organize with TARA", detail: "Get help prioritizing your work", href: "/tara" }
    ]
  }
];

function SaveTime({ data }: { data: Data }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => saveTimeGroups.map((group) => ({ ...group, items: group.items.filter((item) => `${item.title} ${item.detail}`.toLowerCase().includes(query.trim().toLowerCase())) })).filter((group) => group.items.length), [query]);
  const featured = [saveTimeGroups[0].items[0], saveTimeGroups[1].items[1], saveTimeGroups[3].items[2], saveTimeGroups[4].items[0]];
  return (
    <div className="space-y-8">
      <section aria-labelledby="featured-actions"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-sky-700">Start here</p><h2 className="mt-1 text-2xl font-semibold" id="featured-actions">Featured actions</h2></div><label className="flex min-h-12 w-full items-center gap-2 rounded-md border bg-surface px-3 sm:max-w-sm"><Search className="h-4 w-4" aria-hidden="true" /><span className="sr-only">Search Save Time tools</span><Input className="border-0 px-0 focus-visible:ring-0" onChange={(event) => setQuery(event.target.value)} placeholder="Find a teaching tool" value={query} /></label></div>{!query ? <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{featured.map((item) => <ActionLink {...item} key={item.title} />)}</div> : null}</section>
      {!query ? <section aria-labelledby="recently-used"><h2 className="text-xl font-semibold" id="recently-used">Recently used</h2>{data.recentItems.length ? <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{data.recentItems.map((item) => <ActionLink detail={item.type} href={item.href} key={item.id} title={item.title} />)}</div> : <EmptyState description="Open a teaching tool and it will be easy to return to here." icon={<Clock3 className="h-5 w-5" />} title="No recent teaching work yet" />}</section> : null}
      <section className="space-y-7" aria-live="polite">{filtered.length ? filtered.map((group) => <div key={group.title}><h2 className="text-xl font-semibold">{group.title}</h2><p className="mt-1 text-sm text-muted-foreground">{group.subtitle}</p><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{group.items.map((item) => <ActionLink {...item} key={item.title} />)}</div></div>) : <EmptyState description="Try a shorter tool name such as lesson, quiz, message or calendar." icon={<Search className="h-5 w-5" />} title="No matching tools" />}</section>
    </div>
  );
}

const oneToOneSteps = [
  ["Create profile", "/teacher/business/one-to-one"], ["Add expertise", "/teacher/business/profile"], ["Add experience", "/teacher/business/profile"], ["Choose teaching format", "/teacher/business/one-to-one"], ["Set availability", "/teacher/business/one-to-one"], ["Set pricing", "/teacher/business/one-to-one"], ["Preview", "/teacher/business/profile"], ["Activate", "/teacher/business/one-to-one"]
] as const;

function EarnMore({ data }: { data: Data }) {
  const business: Destination[] = [
    { title: "Profile", detail: "Professional identity", href: "/teacher/business/profile" },
    { title: "Portfolio", detail: "Experience and selected work", href: "/teacher/business/portfolio" },
    { title: "Marketplace", detail: "Products and store presence", href: "/teacher/business/marketplace" },
    { title: "Orders", detail: "Customer orders", href: "/teacher/business/orders" },
    { title: "Earnings", detail: "Real recorded earnings", href: "/teacher/business/earnings" },
    { title: "Wallet", detail: "Balance and transactions", href: "/teacher/business/wallet" },
    { title: "Analytics", detail: "Business performance", href: "/teacher/business/analytics" }
  ];
  return (
    <div className="space-y-8">
      <section className="rounded-md border border-emerald-200 bg-emerald-50 p-5 sm:p-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><Badge>{data.teacher.oneToOneActive ? "Profile active" : "Teach 1:1"}</Badge><h2 className="mt-3 text-2xl font-semibold">Share your expertise. Teach independently. Earn.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-950/70">A simple professional profile connects your expertise, format, availability and pricing in one existing workflow.</p></div><Link className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-emerald-700 px-5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2" href="/teacher/business/one-to-one">{data.teacher.oneToOneActive ? "Manage profile" : "Start profile"}<ArrowRight className="h-4 w-4" /></Link></div></section>
      <section><div className="flex items-center justify-between gap-4"><div><h2 className="text-2xl font-semibold">Teach 1:1</h2><p className="mt-1 text-sm text-muted-foreground">Eight clear steps from profile to activation.</p></div>{data.teacher.oneToOneActive ? <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"><Check className="h-4 w-4" />Active</span> : null}</div><ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{oneToOneSteps.map(([title, href], index) => <li key={title}><Link className="group flex min-h-20 items-center gap-3 rounded-md border bg-surface p-4 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-primary" href={href}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">{index + 1}</span><span className="text-sm font-semibold">{title}</span><ArrowRight className="ml-auto h-4 w-4 opacity-50 group-hover:opacity-100" /></Link></li>)}</ol></section>
      <section className="grid gap-6 lg:grid-cols-2"><div><h2 className="text-xl font-semibold">Publish & earn</h2><p className="mt-1 text-sm text-muted-foreground">Turn useful knowledge into resources and constructive content.</p><div className="mt-4 space-y-3"><ActionLink title="Publish a resource" detail="Prepare an eligible resource for the marketplace" href="/teacher/business/publishing" /><ActionLink title="Submit to Happy Notes" detail="Submit constructive knowledge through the existing boundary" href="/teacher/business/happy-notes" /><ActionLink title="View publishing" detail="Review drafts, published and archived work" href="/teacher/business/publishing" /></div></div><div><h2 className="text-xl font-semibold">Business</h2><p className="mt-1 text-sm text-muted-foreground">Your canonical business, commerce and earnings facilities.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{business.map((item) => <ActionLink {...item} key={item.title} />)}</div></div></section>
      <section className="rounded-md border border-dashed p-6"><Badge>Coming soon</Badge><h2 className="mt-3 text-xl font-semibold">Future opportunities</h2><p className="mt-2 text-sm text-muted-foreground">New professional opportunities will appear here only when verified and available. No opportunity listings are currently published.</p></section>
    </div>
  );
}

const learningKinds = [
  ["AI Skills", "AI_SKILLS", Bot, "Professional AI learning for teachers."],
  ["Professional Development", "PROFESSIONAL_DEVELOPMENT", Sparkles, "Teaching and career growth."],
  ["Audiobooks", "AUDIOBOOK", Headphones, "Listen during travel, rest or daily work."],
  ["Books", "BOOK", BookOpen, "Professional and personal growth content."],
  ["Video Courses", "VIDEO_COURSE", Video, "Recorded teacher learning."],
  ["Webinars", "WEBINAR", CalendarDays, "Live and recorded expert sessions."]
] as const;

function LearnMore({ data }: { data: Data }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("ALL");
  const rows = useMemo(() => data.learning.filter((item) => (kind === "ALL" || item.kind === kind) && `${item.title} ${item.description ?? ""} ${item.category ?? ""} ${item.author ?? ""}`.toLowerCase().includes(query.toLowerCase())), [data.learning, kind, query]);
  return (
    <div className="space-y-8">
      <section><h2 className="text-2xl font-semibold">Choose how you want to grow</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{learningKinds.map(([title, value, Icon, detail]) => <button className={`min-h-24 rounded-md border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-primary ${kind === value ? "border-amber-300 bg-amber-50" : "bg-surface hover:border-amber-200"}`} key={value} onClick={() => setKind(value)} type="button"><Icon className="h-5 w-5 text-amber-700" /><span className="mt-3 block font-semibold">{title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{detail}</span></button>)}</div></section>
      <section aria-labelledby="learning-library"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-xl font-semibold" id="learning-library">Learning library</h2><p className="mt-1 text-sm text-muted-foreground">Only real published teacher-learning content appears here.</p></div><div className="flex w-full gap-2 sm:max-w-lg"><label className="flex min-h-11 flex-1 items-center gap-2 rounded-md border bg-surface px-3"><Search className="h-4 w-4" /><span className="sr-only">Search teacher learning</span><Input className="border-0 px-0 focus-visible:ring-0" onChange={(event) => setQuery(event.target.value)} placeholder="Search learning" value={query} /></label>{kind !== "ALL" ? <button className="min-h-11 rounded-md border px-3 text-sm font-medium" onClick={() => setKind("ALL")} type="button">View all</button> : null}</div></div>{rows.length ? <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map((item) => <Card className="p-5" key={item.id}><Badge>{item.kind.replaceAll("_", " ")}</Badge><h3 className="mt-3 font-semibold">{item.title}</h3><p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{item.description || "No description supplied by the publisher."}</p><p className="mt-3 text-xs font-medium text-muted-foreground">Access: {item.access === "PUBLISHER_DEFINED" ? "Set by publisher" : item.access}</p><Link className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-800" href={item.href}>{item.previewAvailable ? "Open details and preview" : "Open details"}<ArrowRight className="h-4 w-4" /></Link></Card>)}</div> : <EmptyState description="More learning experiences are coming. Published content will appear here without a fabricated catalog." icon={<BookOpen className="h-5 w-5" />} title="No teacher-learning content has been published" />}</section>
      <section><h2 className="text-xl font-semibold">Webinars</h2>{data.webinars.length ? <div className="mt-4 grid gap-4 md:grid-cols-2">{data.webinars.map((item) => <Card className="p-5" key={item.id}><Badge>{item.state.replaceAll("_", " ")}</Badge><h3 className="mt-3 font-semibold">{item.title}</h3><p className="mt-2 text-sm text-muted-foreground">{new Date(item.startsAt).toLocaleString()}</p>{item.location ? <p className="mt-1 text-sm text-muted-foreground">{item.location}</p> : null}<p className="mt-3 text-sm">{item.description || "Details will be provided by the institution."}</p></Card>)}</div> : <EmptyState description="Upcoming and recorded sessions will appear when real webinar events are published." icon={<CalendarDays className="h-5 w-5" />} title="No webinars published" />}</section>
      <section className="rounded-md border bg-surface p-5"><h2 className="font-semibold">Your access</h2><p className="mt-2 text-sm text-muted-foreground">{data.subscription?.active ? `${data.subscription.name} is active. Individual publishers still control whether content is free, included or premium.` : "No active teacher learning subscription is recorded. Free content remains available when published."}</p></section>
    </div>
  );
}

function EnjoyMore() {
  const categories: [string, LucideIcon][] = [["Travel", Plane], ["Family", UsersRound], ["Wellness", Heart], ["Leisure", BookOpen], ["Teacher Experiences", Sparkles], ["Special Offers", BadgeIndianRupee]];
  return (
    <div className="space-y-8"><section className="py-6 text-center sm:py-10"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-rose-100 text-rose-700"><Heart className="h-6 w-6" /></span><Badge className="mt-5">Coming soon</Badge><h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Because life beyond the classroom matters too.</h2><p className="mx-auto mt-3 max-w-2xl leading-7 text-muted-foreground">More life beyond the classroom is on the way. TeachX is preparing a thoughtful home for future teacher life experiences. No offers, partners, prices or bookings are available yet.</p></section><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{categories.map(([title, Icon]) => <div className="rounded-md border bg-surface p-5" key={title}><Icon className="h-5 w-5 text-rose-700" /><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-2 text-sm text-muted-foreground">Coming soon</p></div>)}</div><EmptyState description="Your next experience is coming soon. We will only show real, verified experiences when this destination opens." icon={<Heart className="h-5 w-5" />} title="More life is on the way" /></div>
  );
}

function TaraBridge({ pillar }: { pillar: TeacherLifePillar }) {
  const copy: Record<TeacherLifePillar, string> = { "save-time": "Let TARA plan my day", "earn-more": "Let TARA improve my teaching profile", "learn-more": "Ask TARA what I should learn next", "enjoy-more": "Ask TARA what is coming" };
  return <section className="flex flex-col gap-4 rounded-md border border-sky-200 bg-sky-50 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-sky-700 text-white"><Bot className="h-5 w-5" /></span><div><h2 className="font-semibold">TARA is with you here</h2><p className="mt-1 text-sm text-sky-950/70">One AI partner, connected to your authorized TeachX workflows.</p></div></div><Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-sky-700 px-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-sky-700 focus:ring-offset-2" href="/tara">{copy[pillar]}<ArrowRight className="h-4 w-4" /></Link></section>;
}

export function TeacherLifePage({ pillar, data }: { pillar: TeacherLifePillar; data: Data }) {
  const current = pillarDetails[pillar];
  const Icon = current.icon;
  return (
    <div className="min-w-0 space-y-7"><nav className="text-sm text-muted-foreground" aria-label="Breadcrumb"><Link className="hover:text-foreground" href="/teacher">Teacher Home</Link><span className="mx-2">/</span><span aria-current="page">{current.title}</span></nav><header className={`rounded-md border p-5 sm:p-7 ${current.tone}`}><div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-white/80"><Icon className="h-6 w-6" /></span><div><Badge>Teacher Life OS</Badge><h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{current.title}</h1><p className="mt-2 max-w-3xl">{current.description}</p></div></div></header><PillarNav active={pillar} />{pillar === "save-time" ? <SaveTime data={data} /> : pillar === "earn-more" ? <EarnMore data={data} /> : pillar === "learn-more" ? <LearnMore data={data} /> : <EnjoyMore />}<TaraBridge pillar={pillar} /><footer className="flex flex-wrap gap-x-5 gap-y-2 border-t pt-5 text-sm text-muted-foreground"><Link href="/teacher/community/home">Community</Link><Link href="/teacher/workspace/notifications">Notifications</Link><Link href="/teacher/support">Help & support</Link><Link href="/teacher/settings">Settings</Link></footer></div>
  );
}
