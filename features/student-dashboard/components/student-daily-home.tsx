import Link from "next/link";
import { BookOpen, CalendarDays, CheckCircle2, Clock, FileQuestion, Settings2, Sparkles, Target, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { saveDashboardWidgetsAction, toggleDailyMissionItemAction } from "@/features/student-dashboard/actions";
import type { getStudentDashboard } from "@/services/student-dashboard-service";

type Data = Awaited<ReturnType<typeof getStudentDashboard>>;

export function StudentDailyHome({ name, data }: { name?: string | null; data: Data }) {
  const firstName = name?.split(" ")[0] ?? "Student";
  const progress = Math.min(100, data.progress.progressAverage);
  const visible = new Set(data.widgets);
  return <div className="space-y-8">
    <section className="rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6 shadow-soft sm:p-8">
      <Badge className="border-indigo-100 bg-white text-indigo-700">LearnX Guru · Daily Learning Home</Badge>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-end">
        <div><p className="text-sm font-medium text-indigo-700">Welcome back, {firstName}</p><h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Make today count.</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Your classes, practice, goals, and next best learning step—all in one calm daily view.</p><div className="mt-7 flex flex-wrap gap-3"><Link className="rounded-2xl bg-indigo-600 px-6 py-3 font-medium text-white" href={data.home.continueLearning ? `/learning/${data.home.continueLearning.id}` : "/student/learn"}>Continue learning</Link><Link className="rounded-2xl border border-border bg-white px-6 py-3 font-medium" href="/student/ask-ai">Ask AI Tutor</Link></div></div>
        <Card className="p-5"><p className="text-sm text-muted-foreground">Today&apos;s focus</p><h2 className="mt-2 text-xl font-semibold">{data.focus}</h2><div className="mt-5 flex justify-between text-sm"><span>Learning progress</span><span>{progress}%</span></div><Progress className="mt-2" value={progress}/></Card>
      </div>
    </section>
    {visible.has("mission") && <section><div className="mb-4 flex items-center gap-2"><Target className="h-5 w-5 text-indigo-600"/><h2 className="text-2xl font-semibold">Today&apos;s Mission</h2></div><div className="grid gap-4 md:grid-cols-3">{data.mission.map((item) => {const done=data.completedMissionItems.includes(item.id);return <Card className={done?"border-emerald-200 bg-emerald-50/60 p-5":"p-5"} key={item.id}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{item.title}</p><Link className="mt-3 inline-block text-sm font-medium text-indigo-700" href={item.href}>Start learning</Link></div><form action={toggleDailyMissionItemAction}><input name="id" type="hidden" value={item.id}/><Button aria-label={`Mark ${item.title} ${done?"incomplete":"complete"}`} className="h-10 w-10 p-0" type="submit" variant="ghost"><CheckCircle2 className={done?"text-emerald-600":"text-muted-foreground"}/></Button></form></div></Card>})}</div></section>}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={CalendarDays} label="Classes today" value={data.home.todaysClasses.length}/><Metric icon={FileQuestion} label="Pending work" value={data.home.pendingAssignments.length}/><Metric icon={Trophy} label="Study streak" value={`${data.progress.studyStreak} days`}/><Metric icon={Clock} label="Learning time" value={`${Math.round(data.progress.learningTime/60)} min`}/></section>
    <section className="grid gap-6 lg:grid-cols-2">
      {visible.has("classes") && <List title="Today's Classes" icon={CalendarDays} items={data.home.todaysClasses.map(({entry})=>`${entry.subject?.name??"Class"} · ${entry.timeSlot.startsAt}`)} empty="No classes scheduled today."/>}
      {visible.has("assignments") && <List title="Assignments" icon={FileQuestion} items={data.home.pendingAssignments.map((item)=>item.title)} empty="You are all caught up."/>}
      {visible.has("progress") && <List title="Learning Progress" icon={BookOpen} items={data.home.progress.map((item)=>`${item.completion}% complete · ${item.studyStreak} day streak`)} empty="Your progress will appear after you begin learning."/>}
      {visible.has("announcements") && <List title="Announcements" icon={Sparkles} items={data.home.announcements.map((item)=>item.title)} empty="No new announcements."/>}
    </section>
    <Card className="p-5"><div className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-indigo-600"/><h2 className="text-xl font-semibold">Customize dashboard</h2></div><form action={saveDashboardWidgetsAction} className="mt-4 flex flex-wrap items-center gap-4">{[["mission","Mission"],["classes","Classes"],["assignments","Assignments"],["progress","Progress"],["announcements","Announcements"]].map(([value,label])=><label className="flex items-center gap-2 text-sm" key={value}><input defaultChecked={visible.has(value)} name="widgets" type="checkbox" value={value}/>{label}</label>)}<Button className="ml-auto" type="submit" variant="secondary">Save layout</Button></form></Card>
  </div>;
}

function Metric({icon:Icon,label,value}:{icon:typeof Clock;label:string;value:string|number}) {return <Card className="p-5"><Icon className="h-5 w-5 text-indigo-600"/><p className="mt-4 text-2xl font-semibold">{value}</p><p className="mt-1 text-sm text-muted-foreground">{label}</p></Card>}
function List({title,icon:Icon,items,empty}:{title:string;icon:typeof Clock;items:string[];empty:string}) {return <Card className="p-5"><div className="flex items-center gap-2"><Icon className="h-5 w-5 text-indigo-600"/><h2 className="text-xl font-semibold">{title}</h2></div><div className="mt-4 space-y-3">{items.length?items.slice(0,5).map((item,index)=><p className="rounded-xl border border-border bg-background px-4 py-3 text-sm" key={`${item}-${index}`}>{item}</p>):<p className="text-sm text-muted-foreground">{empty}</p>}</div></Card>}
