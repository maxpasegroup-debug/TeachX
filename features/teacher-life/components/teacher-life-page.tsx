"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight, BadgeIndianRupee, BookOpen, Bot, Brain, CalendarDays, Camera, Check, Compass,
  CircleDollarSign, Clock3, ClipboardCheck, FileText, FolderOpen, Headphones, Heart,
  MessageCircle, Mic, NotebookPen, Plane, Search, Sparkles, Upload, UsersRound, Video
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { TeacherLifeSwitcher } from "@/features/teacher-life/components/teacher-life-switcher";
import type { getTeacherLifeData, TeacherLifePillar } from "@/services/teacher-life-service";
import type { getTeacherWorkspaceData } from "@/services/teacher-workspace-service";

type Data = NonNullable<Awaited<ReturnType<typeof getTeacherLifeData>>>;
type WorkspaceData = Awaited<ReturnType<typeof getTeacherWorkspaceData>>;
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

const staffRoomTabs = [
  ["Today", "/teacher/life/save-time", CalendarDays],
  ["Groups", "/teacher/workspace/classrooms", UsersRound],
  ["Learners", "/teacher/workspace/classrooms", ClipboardCheck],
  ["Files", "/teacher/workspace/resources", FolderOpen],
  ["Ask TeachX", "/tara", Sparkles]
] as const;

const teachingSpaceNav = [
  ["Overview", "/teacher/life/save-time", CalendarDays],
  ["My Spaces", "/teacher/workspace/classrooms", Compass],
  ["Learners", "/teacher/workspace/classrooms", UsersRound],
  ["Programs", "/teacher/workspace/lessons", BookOpen],
  ["Groups", "/teacher/workspace/classrooms", UsersRound],
  ["Schedule", "/teacher/workspace/planner", CalendarDays],
  ["Learning Plan", "/teacher/workspace/resources", NotebookPen],
  ["Activities", "/teacher/workspace/classrooms", FileText],
  ["Attendance & Progress", "/teacher/workspace/classrooms", ClipboardCheck],
  ["Communication", "/teacher/ai-studio/create/parent-communication", MessageCircle],
  ["Files", "/teacher/workspace/resources", FolderOpen],
  ["Setup", "/teacher/settings", Sparkles]
] as const;

const quietAIActions: Destination[] = [
  { title: "Prepare a lesson", detail: "Make tomorrow's class easier to teach.", href: "/teacher/ai-studio/create/lesson-generator" },
  { title: "Add homework", detail: "Create practice work from the topic.", href: "/teacher/ai-studio/create/homework-generator" },
  { title: "Message parents", detail: "Draft a respectful parent update.", href: "/teacher/ai-studio/create/parent-communication" },
  { title: "Ask TeachX", detail: "Tell TeachX what you need in plain language.", href: "/tara" }
];

function StatPill({ label, value }: { label: string; value: string | number }) {
  return <div className="min-w-0 rounded-md border bg-white/70 px-3 py-2"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-words text-lg font-semibold leading-6">{value}</p></div>;
}

function StaffRoomAction({ title, detail, href, icon: Icon }: Destination & { icon: LucideIcon }) {
  return (
    <Link className="group flex min-h-20 items-center gap-3 rounded-md border bg-surface p-4 transition hover:border-sky-300 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-primary" href={href}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-sky-50 text-sky-700"><Icon className="h-5 w-5" /></span>
      <span className="min-w-0 flex-1"><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">{detail}</span></span>
      <ArrowRight className="h-4 w-4 shrink-0 opacity-60 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
    </Link>
  );
}

function TodayLine({ title, detail, href, icon: Icon }: Destination & { icon: LucideIcon }) {
  return (
    <Link className="flex min-h-16 items-center gap-3 rounded-md border bg-background px-4 py-3 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-primary" href={href}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-sky-50 text-sky-700"><Icon className="h-4 w-4" /></span>
      <span className="min-w-0"><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">{detail}</span></span>
    </Link>
  );
}

function ClassRoomCard({ item }: { item: WorkspaceData["classrooms"][number] }) {
  const firstSubject = item.subjects[0] ?? "Program";
  return (
    <article className="rounded-md border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-lg font-semibold">{item.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">Program: {firstSubject}</p>
          <p className="mt-1 text-xs text-muted-foreground">{item.course} - {item.section} - {item.studentCount} learners</p>
        </div>
        <Badge>{item.attendanceRate === null ? "Attendance due" : `${item.attendanceRate}% present`}</Badge>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link className="rounded-md bg-primary px-3 py-2 text-center text-xs font-semibold text-primary-foreground" href={`/classrooms/${item.id}`}>Today&apos;s lesson</Link>
        <Link className="rounded-md border px-3 py-2 text-center text-xs font-semibold hover:bg-sky-50" href={`/classrooms/${item.id}#attendance`}>Attendance</Link>
        <Link className="rounded-md border px-3 py-2 text-center text-xs font-semibold hover:bg-sky-50" href={`/classrooms/${item.id}#assignments`}>Homework</Link>
        <Link className="rounded-md border px-3 py-2 text-center text-xs font-semibold hover:bg-sky-50" href={`/classrooms/${item.id}#students`}>Learners</Link>
      </div>
      <Link className="mt-2 flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-xs font-semibold hover:bg-sky-50" href="/teacher/ai-studio/create/parent-communication"><MessageCircle className="h-3.5 w-3.5" />Message parents</Link>
    </article>
  );
}

function TeachingSpaceSidebar() {
  return (
    <aside className="rounded-[1.5rem] border border-black/10 bg-[#111714] p-4 text-white shadow-[0_20px_60px_rgba(17,23,20,.14)] lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
      <div className="mb-5 rounded-2xl bg-white/8 p-4">
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#20d16b]">Save Time</p>
        <h2 className="mt-2 text-xl font-semibold">My Teaching Space</h2>
        <p className="mt-2 text-xs leading-5 text-white/60">Organize your real teaching world.</p>
        <TeacherLifeSwitcher active="save-time" variant="dark" />
      </div>
      <nav className="space-y-1" aria-label="Save Time workspace">
        {teachingSpaceNav.map(([label, href, Icon]) => {
          const className = "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-white/76 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#20d16b]/50";
          return <Link className={className} href={href} key={label}><Icon className="h-4 w-4 text-[#20d16b]" />{label}</Link>;
        })}
      </nav>
      <Link className="mt-5 flex min-h-12 items-center gap-3 rounded-2xl bg-[#20d16b] px-4 text-sm font-semibold text-[#111714]" href="/tara">
        <Sparkles className="h-4 w-4" />
        <span><span className="block">TARA</span><span className="block text-xs font-medium opacity-70">Your teaching co-worker</span></span>
      </Link>
    </aside>
  );
}

function SaveTime({ data, workspaceData }: { data: Data; workspaceData?: WorkspaceData }) {
  const [query, setQuery] = useState("");
  const today = new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const dayName = new Date().toLocaleDateString("en", { weekday: "long" }).toUpperCase();
  const classrooms = workspaceData?.classrooms ?? [];
  const materials = workspaceData?.content ?? [];
  const pendingReviews = workspaceData?.assignments.reduce((total, item) => total + item.pendingReviews, 0) ?? 0;
  const attendancePending = classrooms.filter((item) => item.attendanceRate === null).length;
  const students = classrooms.reduce((total, item) => total + item.studentCount, 0);
  const todaysClasses = (workspaceData?.timetable ?? []).filter((item) => item.day === dayName);
  const nextClass = todaysClasses[0] ?? workspaceData?.timetable[0];
  const importantPlan = workspaceData?.planner[0];
  const recentMaterial = materials[0];
  const searchable = [
    ...classrooms.map((item) => ({ title: item.title, detail: `${item.course} ${item.section} ${item.subjects.join(" ")}`, href: `/classrooms/${item.id}` })),
    ...materials.map((item) => ({ title: item.title, detail: `${item.course} ${item.subject ?? ""} ${item.type}`, href: "/teacher/workspace/resources" })),
    ...quietAIActions
  ];
  const results = searchable.filter((item) => `${item.title} ${item.detail}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <TeachingSpaceSidebar />
      <div className="min-w-0 space-y-8">
      <section className="rounded-md border border-sky-200 bg-sky-50 p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div>
            <Badge>TeachX Guru</Badge>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Your Digital Staff Room</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-950/75">Bring your teaching, open today&apos;s class, take attendance, find material, message parents, and let TeachX quietly help in the background.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-sky-800 px-5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-sky-700 focus:ring-offset-2" href="/teacher/resources#upload-resource"><Upload className="h-4 w-4" />Bring Teaching</Link>
              <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-sky-200 bg-white px-5 text-sm font-semibold text-sky-900 hover:bg-sky-50" href={nextClass?.href ?? "/teacher/workspace/classrooms"}><BookOpen className="h-4 w-4" />Open today&apos;s class</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            <StatPill label="Today" value={today} />
            <StatPill label="Groups" value={classrooms.length} />
            <StatPill label="Learners" value={students} />
            <StatPill label="Pending" value={attendancePending + pendingReviews} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]" id="today">
        <Card className="p-5 shadow-soft sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-sm font-semibold text-sky-700">Today</p><h2 className="mt-1 text-2xl font-semibold">What you need today</h2></div>
            <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold hover:bg-sky-50" href="/teacher/workspace/planner">My plan<ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-5 space-y-3">
            {nextClass ? <TodayLine title={todaysClasses.length ? "Next class" : "First class on your plan"} detail={`${nextClass.title} - ${nextClass.day} ${nextClass.time}`} href={nextClass.href} icon={BookOpen} /> : null}
            {attendancePending ? <TodayLine title="Attendance pending" detail={`${attendancePending} class${attendancePending === 1 ? "" : "es"} need attendance.`} href={classrooms[0] ? `/classrooms/${classrooms[0].id}#attendance` : "/teacher/workspace/classrooms"} icon={ClipboardCheck} /> : null}
            {pendingReviews ? <TodayLine title="Homework to review" detail={`${pendingReviews} submission${pendingReviews === 1 ? "" : "s"} waiting.`} href="/teacher/workspace/classrooms" icon={NotebookPen} /> : null}
            {importantPlan ? <TodayLine title="Reminder" detail={`${importantPlan.title} - ${new Date(importantPlan.startsAt).toLocaleString()}`} href="/teacher/workspace/planner" icon={CalendarDays} /> : null}
            {recentMaterial ? <TodayLine title="Recent material" detail={`${recentMaterial.title} - ${recentMaterial.course}${recentMaterial.subject ? ` - ${recentMaterial.subject}` : ""}`} href="/teacher/workspace/resources" icon={FolderOpen} /> : null}
            {!nextClass && !attendancePending && !pendingReviews && !importantPlan && !recentMaterial ? <EmptyState description="Bring your timetable, syllabus, lesson plans, notes or photos. TeachX will help keep your year organized." icon={<CalendarDays className="h-5 w-5" />} title="Your staff room is ready" /> : null}
          </div>
        </Card>
        <Card className="p-5 shadow-soft sm:p-6">
          <h2 className="text-xl font-semibold">Start here</h2>
          <div className="mt-4 grid gap-3">
            <StaffRoomAction title="Bring Teaching" detail="Upload syllabus, timetable, lesson plans, notes or photos." href="/teacher/resources#upload-resource" icon={Upload} />
            <StaffRoomAction title="Attendance" detail="Present all, then mark exceptions in class." href={classrooms[0] ? `/classrooms/${classrooms[0].id}#attendance` : "/teacher/workspace/classrooms"} icon={ClipboardCheck} />
            <StaffRoomAction title="Message parents" detail="Draft and copy for WhatsApp." href="/teacher/ai-studio/create/parent-communication" icon={MessageCircle} />
            <StaffRoomAction title="Ask TeachX" detail="Prepare a lesson, worksheet or simple explanation." href="/tara" icon={Sparkles} />
          </div>
        </Card>
      </section>

      <nav className="grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label="Save Time destinations">
        {staffRoomTabs.map(([label, href, Icon]) => <a className="flex min-h-12 items-center justify-center gap-2 rounded-md border bg-surface px-3 text-sm font-semibold hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary" href={href} key={label}><Icon className="h-4 w-4" />{label}</a>)}
      </nav>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 shadow-soft lg:col-span-2" id="groups">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-sky-700">Groups</p><h2 className="mt-1 text-2xl font-semibold">Walk into your classroom, batch or cohort</h2></div><Link className="text-sm font-semibold text-sky-700 hover:underline" href="/teacher/workspace/classrooms">All groups</Link></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {classrooms.length ? classrooms.slice(0, 4).map((item) => <ClassRoomCard item={item} key={item.id} />) : <EmptyState description="Bring a timetable or class list and TeachX will help you start from attendance, lessons and homework." icon={<UsersRound className="h-5 w-5" />} title="Your classroom door is ready" />}
          </div>
        </Card>
        <Card className="p-5 shadow-soft" id="learners">
          <p className="text-sm font-semibold text-sky-700">Learners</p>
          <h2 className="mt-1 text-2xl font-semibold">{students} learners</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">See learners through the groups you teach. Attendance, activities, notes and messages stay together.</p>
          <div className="mt-5 space-y-2">
            <StaffRoomAction title="Open learners" detail="Choose a group and see the people there." href="/teacher/workspace/classrooms" icon={UsersRound} />
            <StaffRoomAction title="Review work" detail={`${pendingReviews} submissions need attention.`} href="/teacher/workspace/classrooms" icon={FileText} />
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]" id="files">
        <Card className="p-5 shadow-soft sm:p-6">
          <p className="text-sm font-semibold text-sky-700">Bring Your Teaching</p>
          <h2 className="mt-1 text-2xl font-semibold">My Teaching Bag</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">This is where your teaching things live: PDFs, photos, worksheets, lesson plans, question papers, documents and links. TeachX can organize supported material through the existing upload flow.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <StaffRoomAction title="Upload" detail="PDF, Word, Excel, PPT, image, audio or video." href="/teacher/resources#upload-resource" icon={Upload} />
            <StaffRoomAction title="Upload a photo" detail="Lesson plan, blackboard, question paper, student work." href="/teacher/resources#upload-resource" icon={Camera} />
            <StaffRoomAction title="Tell TeachX" detail="Speak naturally in the assistant flow." href="/tara" icon={Mic} />
            <StaffRoomAction title="Find material" detail="Search by topic, class, subject, or title." href="/teacher/workspace/search" icon={Search} />
          </div>
        </Card>
        <Card className="p-5 shadow-soft sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-xl font-semibold">Recent materials</h2><p className="mt-1 text-sm text-muted-foreground">Organized by year, class, subject, and topic where data exists.</p></div><label className="flex min-h-11 items-center gap-2 rounded-md border bg-background px-3 sm:min-w-72"><Search className="h-4 w-4" /><span className="sr-only">Search staff room</span><Input className="border-0 px-0 focus-visible:ring-0" onChange={(event) => setQuery(event.target.value)} placeholder="Search fractions, 5A, science..." value={query} /></label></div>
          <div className="mt-5 space-y-3">
            {query ? results.map((item) => <ActionLink {...item} key={`${item.title}-${item.href}`} />) : materials.slice(0, 5).map((item) => <Link className="block rounded-md border bg-background px-4 py-3 hover:bg-sky-50" href="/teacher/workspace/resources" key={item.id}><strong className="text-sm">{item.title}</strong><span className="mt-1 block text-xs text-muted-foreground">{item.course}{item.subject ? ` - ${item.subject}` : ""} - {item.type.replaceAll("_", " ")}</span></Link>)}
            {!query && !materials.length ? <EmptyState description="Upload or create your first material and it will appear here." icon={<FolderOpen className="h-5 w-5" />} title="No materials yet" /> : null}
            {query && !results.length ? <EmptyState description="Try a class, subject, topic, or material name." icon={<Search className="h-5 w-5" />} title="Nothing matched" /> : null}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5 shadow-soft" id="spaces"><p className="text-sm font-semibold text-sky-700">My Spaces</p><h2 className="mt-2 text-xl font-semibold">Schools, tuition centres, online academies and coaching spaces.</h2><Link className="mt-4 inline-flex text-sm font-semibold text-sky-700" href="/teacher/workspace/classrooms">Open spaces</Link></Card>
        <Card className="p-5 shadow-soft" id="programs"><p className="text-sm font-semibold text-sky-700">Programs</p><h2 className="mt-2 text-xl font-semibold">Subjects, courses, skills and training programs.</h2><Link className="mt-4 inline-flex text-sm font-semibold text-sky-700" href="/teacher/workspace/resources">Open materials</Link></Card>
        <Card className="p-5 shadow-soft" id="schedule"><p className="text-sm font-semibold text-sky-700">Schedule</p><h2 className="mt-2 text-xl font-semibold">Sessions, timetable uploads and reminders.</h2><Link className="mt-4 inline-flex text-sm font-semibold text-sky-700" href="/teacher/workspace/planner">My plan</Link></Card>
        <Card className="p-5 shadow-soft" id="communication"><p className="text-sm font-semibold text-sky-700">Communication</p><h2 className="mt-2 text-xl font-semibold">Prepare messages and use WhatsApp in your own flow.</h2><Link className="mt-4 inline-flex text-sm font-semibold text-sky-700" href="/teacher/ai-studio/create/parent-communication">Prepare message</Link></Card>
        <Card className="p-5 shadow-soft" id="learning-plan"><p className="text-sm font-semibold text-sky-700">Learning Plan</p><h2 className="mt-2 text-xl font-semibold">Bring syllabus, curriculum or training plans.</h2><Link className="mt-4 inline-flex text-sm font-semibold text-sky-700" href="/teacher/resources#upload-resource">Upload plan</Link></Card>
        <Card className="p-5 shadow-soft" id="activities"><p className="text-sm font-semibold text-sky-700">Activities</p><h2 className="mt-2 text-xl font-semibold">Assignments, homework, worksheets, projects and practice.</h2><Link className="mt-4 inline-flex text-sm font-semibold text-sky-700" href="/teacher/workspace/classrooms">Open activities</Link></Card>
        <Card className="p-5 shadow-soft md:col-span-2" id="progress"><p className="text-sm font-semibold text-sky-700">Attendance & Progress</p><h2 className="mt-2 text-xl font-semibold">Attendance, completion, session history, milestones and notes.</h2><Link className="mt-4 inline-flex text-sm font-semibold text-sky-700" href={classrooms[0] ? `/classrooms/${classrooms[0].id}#attendance` : "/teacher/workspace/classrooms"}>Open attendance</Link></Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]" id="ask-teachx">
        <Card className="p-5 shadow-soft sm:p-6">
          <p className="text-sm font-semibold text-sky-700">Ask TeachX</p>
          <h2 className="mt-1 text-2xl font-semibold">Quiet help when you ask</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Ask in normal teaching language. TeachX can prepare lessons, worksheets, parent messages and simple explanations using the existing assistant tools.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">{quietAIActions.map((item) => <ActionLink {...item} key={item.title} />)}</div>
        </Card>
        <Card className="p-5 shadow-soft sm:p-6">
          <h2 className="text-xl font-semibold">Recently used</h2>
          <div className="mt-4 space-y-3">
            {data.recentItems.length ? data.recentItems.map((item) => <ActionLink detail={item.type} href={item.href} key={item.id} title={item.title} />) : <EmptyState description="Your recent teaching work will appear here automatically." icon={<Clock3 className="h-5 w-5" />} title="No recent teaching work yet" />}
          </div>
        </Card>
      </section>
      </div>
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
  const copy: Record<TeacherLifePillar, string> = { "save-time": "Ask TeachX", "earn-more": "Let TARA improve my teaching profile", "learn-more": "Ask TARA what I should learn next", "enjoy-more": "Ask TARA what is coming" };
  const title = pillar === "save-time" ? "Need something prepared?" : "TARA is with you here";
  const detail = pillar === "save-time" ? "Tell TeachX what you need for class. Your existing assistant workspace will handle the request." : "One AI partner, connected to your authorized TeachX workflows.";
  return <section className="flex flex-col gap-4 rounded-md border border-sky-200 bg-sky-50 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-sky-700 text-white"><Bot className="h-5 w-5" /></span><div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm text-sky-950/70">{detail}</p></div></div><Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-sky-700 px-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-sky-700 focus:ring-offset-2" href="/tara">{copy[pillar]}<ArrowRight className="h-4 w-4" /></Link></section>;
}

export function TeacherLifePage({ pillar, data, workspaceData }: { pillar: TeacherLifePillar; data: Data; workspaceData?: WorkspaceData }) {
  const current = pillarDetails[pillar];
  const Icon = current.icon;
  if (pillar === "save-time") {
    return (
      <div className="relative left-1/2 w-[100dvw] min-w-0 -translate-x-1/2 space-y-7 overflow-x-clip">
        <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb"><Link className="hover:text-foreground" href="/teacher">Teacher Home</Link><span className="mx-2">/</span><span aria-current="page">Save Time</span></nav>
        <SaveTime data={data} workspaceData={workspaceData} />
        <TaraBridge pillar={pillar} />
        <footer className="flex flex-wrap gap-x-5 gap-y-2 border-t pt-5 text-sm text-muted-foreground"><Link href="/teacher/life/earn-more">Earn More</Link><Link href="/teacher/life/learn-more">Learn More</Link><Link href="/teacher/workspace/notifications">Notifications</Link><Link href="/teacher/support">Help & support</Link></footer>
      </div>
    );
  }
  return (
    <div className="min-w-0 space-y-7"><nav className="text-sm text-muted-foreground" aria-label="Breadcrumb"><Link className="hover:text-foreground" href="/teacher">Teacher Home</Link><span className="mx-2">/</span><span aria-current="page">{current.title}</span></nav><header className={`rounded-md border p-5 sm:p-7 ${current.tone}`}><div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-white/80"><Icon className="h-6 w-6" /></span><div><Badge>Teacher Life OS</Badge><h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{current.title}</h1><p className="mt-2 max-w-3xl">{current.description}</p></div></div></header><PillarNav active={pillar} />{pillar === "earn-more" ? <EarnMore data={data} /> : pillar === "learn-more" ? <LearnMore data={data} /> : <EnjoyMore />}<TaraBridge pillar={pillar} /><footer className="flex flex-wrap gap-x-5 gap-y-2 border-t pt-5 text-sm text-muted-foreground"><Link href="/teacher/community/home">Community</Link><Link href="/teacher/workspace/notifications">Notifications</Link><Link href="/teacher/support">Help & support</Link><Link href="/teacher/settings">Settings</Link></footer></div>
  );
}
