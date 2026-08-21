"use client";

import Link from "next/link";
import { useActionState, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, BookOpen, CalendarDays, Check, ChevronLeft, ChevronRight, CirclePlus,
  Clock3, ListTodo, MapPin, Sparkles, Trash2, UsersRound
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteTeacherPlannerEventAction, saveTeacherPlannerItemAction, setTeacherPlannerItemStatusAction,
  type TeacherPlannerActionState
} from "@/features/teacher-workspace/actions";
import type { getTeacherWorkspaceData } from "@/services/teacher-workspace-service";

type Data = Awaited<ReturnType<typeof getTeacherWorkspaceData>>;
type PlannerItem = Data["planner"][number];
type View = "day" | "week" | "month" | "agenda";
type Kind = "EVENT" | "MEETING" | "REMINDER" | "DEADLINE" | "TASK" | "LESSON";

const dayMs = 86_400_000;
const initialState: TeacherPlannerActionState = {};
const kinds: Kind[] = ["EVENT", "MEETING", "REMINDER", "DEADLINE", "TASK", "LESSON"];

function PlannerEmpty({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children?: React.ReactNode }) {
  return <div className="border border-dashed p-6 text-center"><div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center bg-sky-50 text-sky-700">{icon}</div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{description}</p>{children ? <div className="mt-3 text-sm">{children}</div> : null}</div>;
}

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function startOfWeek(value: Date) {
  const date = startOfDay(value);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
}

function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(undefined, options ?? { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function dateTimeLocal(value: string) {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function PlannerItemForm({ data, item, defaultKind = "EVENT" }: { data: Data; item?: PlannerItem; defaultKind?: Kind }) {
  const [state, action, pending] = useActionState(saveTeacherPlannerItemAction, initialState);
  const lessons = data.content.filter((entry) => ["NOTES", "DOCUMENT", "PPT"].includes(entry.type) && entry.status !== "ARCHIVED");
  return (
    <form action={action} className="mt-4 grid gap-4 md:grid-cols-2">
      {item ? <input name="id" type="hidden" value={item.id} /> : null}
      <div><Label>Title</Label><Input defaultValue={item?.title} maxLength={160} name="title" required /></div>
      <div><Label>Type</Label><Select defaultValue={item?.kind ?? defaultKind} name="kind">{kinds.map((kind) => <option key={kind}>{kind}</option>)}</Select></div>
      <div><Label>Starts / due</Label><Input defaultValue={item ? dateTimeLocal(item.startsAt) : undefined} name="startsAt" required type="datetime-local" /></div>
      <div><Label>Ends</Label><Input defaultValue={item ? dateTimeLocal(item.endsAt) : undefined} name="endsAt" required type="datetime-local" /></div>
      <div><Label>Priority</Label><Select defaultValue={item?.priority ?? "NORMAL"} name="priority"><option>LOW</option><option>NORMAL</option><option>HIGH</option><option>URGENT</option></Select></div>
      <div><Label>Location</Label><Input defaultValue={item?.location ?? ""} maxLength={240} name="location" placeholder="Room, campus, or meeting link" /></div>
      <div><Label>Related class</Label><Select defaultValue={item?.classroom?.id ?? ""} name="classroomId"><option value="">No class</option>{data.classrooms.map((room) => <option key={room.id} value={room.id}>{room.title} - {room.course}</option>)}</Select></div>
      <div><Label>Related lesson</Label><Select defaultValue={item?.lesson?.id ?? ""} name="lessonId"><option value="">No lesson</option>{lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title} - {lesson.course}</option>)}</Select><div className="mt-2 flex gap-3 text-xs"><Link className="font-semibold text-sky-700" href="/teacher/workspace/lessons">Create manually</Link><Link className="font-semibold text-sky-700" href="/teacher/ai-studio/create/lesson-generator">Generate with AI</Link></div></div>
      <div className="md:col-span-2"><Label>Description</Label><Textarea defaultValue={item?.description ?? ""} maxLength={2000} name="description" placeholder="Preparation, materials, or follow-up notes" /></div>
      <div className="md:col-span-2 flex flex-wrap items-center gap-3">
        <Button disabled={pending} type="submit">{pending ? "Saving..." : item ? "Save changes" : "Add to planner"}</Button>
        {state.message ? <p aria-live="polite" className="text-sm text-emerald-700">{state.message}</p> : null}
        {state.error ? <p aria-live="assertive" className="text-sm text-red-700">{state.error}</p> : null}
      </div>
    </form>
  );
}

function ItemActions({ item }: { item: PlannerItem }) {
  if (!item.owned) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2 border-t pt-3">
      {item.kind === "TASK" && item.status !== "COMPLETED" ? <form action={setTeacherPlannerItemStatusAction}><input name="id" type="hidden" value={item.id} /><input name="status" type="hidden" value="COMPLETED" /><Button className="h-9" variant="secondary"><Check className="mr-1 h-3.5 w-3.5" />Complete</Button></form> : null}
      {item.kind === "TASK" && item.status === "COMPLETED" ? <form action={setTeacherPlannerItemStatusAction}><input name="id" type="hidden" value={item.id} /><input name="status" type="hidden" value="PENDING" /><Button className="h-9" variant="secondary">Reopen</Button></form> : null}
      {item.kind !== "TASK" && item.status === "PENDING" ? <form action={setTeacherPlannerItemStatusAction}><input name="id" type="hidden" value={item.id} /><input name="status" type="hidden" value="CANCELLED" /><Button className="h-9" variant="secondary">Cancel</Button></form> : null}
      <form action={setTeacherPlannerItemStatusAction}><input name="id" type="hidden" value={item.id} /><input name="status" type="hidden" value="ARCHIVED" /><Button className="h-9" variant="ghost">Archive</Button></form>
      <form action={deleteTeacherPlannerEventAction}><input name="id" type="hidden" value={item.id} /><Button className="h-9 text-red-600" variant="ghost"><Trash2 className="h-3.5 w-3.5" /><span className="sr-only">Delete</span></Button></form>
    </div>
  );
}

function PlannerItemCard({ item, onSelect }: { item: PlannerItem; onSelect?: (item: PlannerItem) => void }) {
  return (
    <article className={`border-l-4 bg-surface p-4 ${item.priority === "URGENT" ? "border-l-red-500" : item.priority === "HIGH" ? "border-l-amber-500" : "border-l-sky-500"}`}>
      <button className="w-full text-left" onClick={() => onSelect?.(item)} type="button">
        <div className="flex flex-wrap items-center gap-2"><Badge>{item.kind}</Badge><Badge>{item.status}</Badge>{item.priority !== "NORMAL" ? <Badge>{item.priority}</Badge> : null}</div>
        <h3 className="mt-2 font-semibold">{item.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{formatDate(item.startsAt)} - {formatDate(item.endsAt, { timeStyle: "short" })}</p>
        {item.classroom ? <p className="mt-1 text-sm">{item.classroom.title} - {item.classroom.course} - {item.classroom.section}</p> : null}
      </button>
    </article>
  );
}

function Detail({ item, data, close }: { item: PlannerItem; data: Data; close: () => void }) {
  return (
    <section aria-label="Calendar item details" className="border bg-surface p-5">
      <div className="flex items-start justify-between gap-4"><div><div className="flex gap-2"><Badge>{item.kind}</Badge><Badge>{item.status}</Badge></div><h2 className="mt-2 text-xl font-semibold">{item.title}</h2></div><Button className="h-9" onClick={close} variant="ghost">Close</Button></div>
      <div className="mt-4 grid gap-2 text-sm">
        <p className="flex items-center gap-2"><Clock3 className="h-4 w-4" />{formatDate(item.startsAt)} to {formatDate(item.endsAt)}</p>
        {item.location ? <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{item.location}</p> : null}
        {item.classroom ? <p className="flex items-center gap-2"><UsersRound className="h-4 w-4" />{item.classroom.title} - {item.classroom.course} - {item.classroom.section}</p> : null}
        {item.lesson ? <p className="flex items-center gap-2"><BookOpen className="h-4 w-4" />Lesson: {item.lesson.title}{item.lesson.subject ? ` - ${item.lesson.subject}` : ""}</p> : null}
        {item.description ? <p className="mt-2 leading-6 text-muted-foreground">{item.description}</p> : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.classroom ? <Link className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground" href={`/classrooms/${item.classroom.id}`}>Open class</Link> : null}
        {item.lesson ? <Link className="rounded-md border px-3 py-2 text-xs font-medium" href="/teacher/workspace/lessons">Open lesson</Link> : null}
        <Link className="rounded-md border px-3 py-2 text-xs font-medium" href={`/teacher/ai-studio/create/lesson-generator?context=${encodeURIComponent(item.title)}`}>Prepare with AI</Link>
      </div>
      {item.owned ? <details className="mt-4 border-t pt-3"><summary className="cursor-pointer text-sm font-semibold">Edit item</summary><PlannerItemForm data={data} item={item} /></details> : null}
      <ItemActions item={item} />
    </section>
  );
}

export function TeacherPlanner({ data }: { data: Data }) {
  const [view, setView] = useState<View>("week");
  const [cursor, setCursor] = useState(startOfDay(new Date()));
  const [selected, setSelected] = useState<PlannerItem | null>(null);
  const [createKind, setCreateKind] = useState<Kind>("EVENT");
  const createRef = useRef<HTMLDetailsElement>(null);
  const activePlanner = data.planner.filter((item) => item.status !== "ARCHIVED" && item.status !== "CANCELLED");
  const today = startOfDay(new Date());

  const openCreate = (kind: Kind) => {
    setCreateKind(kind);
    if (createRef.current) createRef.current.open = true;
    requestAnimationFrame(() => createRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const bounds = useMemo(() => {
    if (view === "day") return [startOfDay(cursor), endOfDay(cursor)] as const;
    if (view === "week") { const start = startOfWeek(cursor); return [start, endOfDay(new Date(start.getTime() + 6 * dayMs))] as const; }
    if (view === "month") return [new Date(cursor.getFullYear(), cursor.getMonth(), 1), endOfDay(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0))] as const;
    return [today, endOfDay(new Date(today.getTime() + 90 * dayMs))] as const;
  }, [cursor, today, view]);

  const visible = activePlanner.filter((item) => { const at = new Date(item.startsAt); return at >= bounds[0] && at <= bounds[1]; });
  const sourceItems = useMemo(() => {
    const dated = [
      ...data.assignments.filter((item) => item.dueDate).map((item) => ({ id: `assignment-${item.id}`, title: item.title, at: item.dueDate!, kind: "ASSIGNMENT", detail: `${item.classroom}${item.subject ? ` - ${item.subject}` : ""}`, href: item.href })),
      ...data.exams.map((item) => ({ id: `exam-${item.id}`, title: item.title, at: item.startsAt, kind: "EXAM", detail: item.course, href: "/exams" }))
    ].filter((item) => { const at = new Date(item.at); return at >= bounds[0] && at <= bounds[1]; });
    const schedule = view === "day"
      ? data.timetable.filter((item) => item.day === cursor.toLocaleDateString("en", { weekday: "long" }).toUpperCase())
      : view === "week" ? data.timetable : [];
    return [
      ...schedule.map((item) => ({ id: `class-${item.id}`, title: item.title, at: `${item.day} - ${item.time}`, kind: "CLASS", detail: "Recurring class schedule", href: item.href })),
      ...dated
    ];
  }, [bounds, cursor, data.assignments, data.exams, data.timetable, view]);
  const tasks = activePlanner.filter((item) => item.kind === "TASK" && item.status === "PENDING");
  const todayItems = activePlanner.filter((item) => startOfDay(new Date(item.startsAt)).getTime() === today.getTime());
  const todayDay = today.toLocaleDateString("en", { weekday: "long" }).toUpperCase();
  const todayClasses = data.timetable.filter((item) => item.day === todayDay);
  const pendingAssignments = data.assignments.filter((item) => item.status !== "CLOSED" && (item.pendingReviews > 0 || item.dueDate));

  const responsibilities = (() => {
    const items = [
      ...activePlanner.filter((item) => item.status === "PENDING").map((item) => ({ id: `planner-${item.id}`, title: item.title, at: item.startsAt, kind: item.kind, href: "#calendar" })),
      ...data.assignments.filter((item) => item.dueDate).map((item) => ({ id: `assignment-${item.id}`, title: item.title, at: item.dueDate!, kind: "ASSIGNMENT", href: item.href })),
      ...data.exams.map((item) => ({ id: `exam-${item.id}`, title: item.title, at: item.startsAt, kind: "EXAM", href: "/exams" }))
    ].sort((a, b) => a.at.localeCompare(b.at));
    const tomorrow = new Date(today.getTime() + dayMs);
    const weekEnd = new Date(startOfWeek(today).getTime() + 7 * dayMs);
    return {
      Today: items.filter((item) => startOfDay(new Date(item.at)).getTime() === today.getTime()),
      Tomorrow: items.filter((item) => startOfDay(new Date(item.at)).getTime() === tomorrow.getTime()),
      "This Week": items.filter((item) => new Date(item.at) > tomorrow && new Date(item.at) < weekEnd),
      Later: items.filter((item) => new Date(item.at) >= weekEnd).slice(0, 20)
    };
  })();

  const move = (direction: number) => setCursor((current) => {
    const next = new Date(current);
    if (view === "month") next.setMonth(next.getMonth() + direction);
    else next.setDate(next.getDate() + direction * (view === "week" ? 7 : 1));
    return next;
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Button onClick={() => openCreate("EVENT")}><CirclePlus className="mr-2 h-4 w-4" />Create Event</Button>
        <Button onClick={() => openCreate("LESSON")} variant="secondary"><BookOpen className="mr-2 h-4 w-4" />Plan Lesson</Button>
        <Button onClick={() => openCreate("TASK")} variant="secondary"><ListTodo className="mr-2 h-4 w-4" />Create Task</Button>
        <Button onClick={() => document.getElementById("calendar")?.scrollIntoView({ behavior: "smooth" })} variant="secondary"><CalendarDays className="mr-2 h-4 w-4" />Open Calendar</Button>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <Card className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Today</p><h2 className="text-xl font-semibold">Schedule and next actions</h2></div><Clock3 className="h-5 w-5 text-sky-700" /></div><div className="mt-4 space-y-3">{todayClasses.map((item) => <Link className="block border-l-4 border-l-emerald-500 bg-background p-3 text-sm" href={item.href} key={item.id}><strong>{item.time} - {item.title}</strong><span className="block text-muted-foreground">Open class and teaching tools</span></Link>)}{todayItems.map((item) => <PlannerItemCard item={item} key={item.id} onSelect={setSelected} />)}{!todayClasses.length && !todayItems.length ? <PlannerEmpty icon={<CalendarDays className="h-5 w-5" />} title="No classes scheduled today" description="Open Teaching to add a class or create a planning item."><Link className="font-semibold text-sky-700" href="/teacher/workspace/classrooms">Open Teaching</Link></PlannerEmpty> : null}</div></Card>
        <Card className="p-5"><h2 className="text-xl font-semibold">Planning alerts</h2><div className="mt-4 space-y-3">{tasks.filter((item) => new Date(item.startsAt) < new Date(today.getTime() + 2 * dayMs)).slice(0, 5).map((item) => <button className="flex w-full gap-3 border-b pb-3 text-left text-sm" key={item.id} onClick={() => setSelected(item)}><AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" /><span><b>{item.title}</b><span className="block text-muted-foreground">Due {formatDate(item.startsAt)}</span></span></button>)}{data.notifications.filter((item) => /class|task|assignment|meeting|schedule|planner|deadline/i.test(`${item.title} ${item.body ?? ""}`)).slice(0, 4).map((item) => item.link ? <Link className="flex gap-3 border-b pb-3 text-sm" href={item.link} key={item.id}><AlertTriangle className="mt-0.5 h-4 w-4 text-sky-700" /><span><b>{item.title}</b><span className="block text-muted-foreground">{item.body}</span></span></Link> : <div className="flex gap-3 border-b pb-3 text-sm" key={item.id}><AlertTriangle className="mt-0.5 h-4 w-4 text-sky-700" /><span><b>{item.title}</b><span className="block text-muted-foreground">{item.body}</span></span></div>)}{!tasks.length && !data.notifications.some((item) => /class|task|assignment|meeting|schedule|planner|deadline/i.test(`${item.title} ${item.body ?? ""}`)) ? <PlannerEmpty icon={<Check className="h-5 w-5" />} title="No planning alerts" description="Create a task for preparation or follow-up."><button className="font-semibold text-sky-700" onClick={() => openCreate("TASK")} type="button">Create Task</button></PlannerEmpty> : null}</div></Card>
      </section>

      <details className="border bg-surface p-5" ref={createRef}><summary className="cursor-pointer font-semibold"><CirclePlus className="mr-2 inline h-4 w-4" />Create planning item</summary><PlannerItemForm data={data} defaultKind={createKind} key={createKind} /></details>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5"><h2 className="font-semibold">Upcoming classes</h2><div className="mt-3 space-y-2">{data.timetable.slice(0, 8).map((item) => <Link className="block border-b py-2 text-sm" href={item.href} key={item.id}><b>{item.day} - {item.time}</b><span className="block text-muted-foreground">{item.title}</span></Link>)}{!data.timetable.length ? <p className="text-sm text-muted-foreground">No classes scheduled. Open Teaching to assign a schedule.</p> : null}</div></Card>
        <Card className="p-5"><h2 className="font-semibold">Pending assignments</h2><div className="mt-3 space-y-2">{pendingAssignments.slice(0, 8).map((item) => <Link className="block border-b py-2 text-sm" href={item.href} key={item.id}><b>{item.title}</b><span className="block text-muted-foreground">{item.classroom}{item.dueDate ? ` - due ${formatDate(item.dueDate, { dateStyle: "medium" })}` : ""} - {item.pendingReviews} to review</span></Link>)}{!pendingAssignments.length ? <p className="text-sm text-muted-foreground">No pending assignment work.</p> : null}</div></Card>
        <Card className="p-5"><h2 className="font-semibold">Upcoming lessons</h2><div className="mt-3 space-y-2">{activePlanner.filter((item) => item.kind === "LESSON" && new Date(item.startsAt) >= today).slice(0, 8).map((item) => <button className="block w-full border-b py-2 text-left text-sm" key={item.id} onClick={() => setSelected(item)}><b>{item.title}</b><span className="block text-muted-foreground">{formatDate(item.startsAt)}{item.classroom ? ` - ${item.classroom.title}` : ""}</span></button>)}{!activePlanner.some((item) => item.kind === "LESSON" && new Date(item.startsAt) >= today) ? <div className="text-sm text-muted-foreground"><p>No lessons planned.</p><button className="mt-2 font-semibold text-sky-700" onClick={() => openCreate("LESSON")} type="button">Plan a Lesson</button></div> : null}</div></Card>
        <Card className="p-5"><h2 className="font-semibold">AI planning</h2><div className="mt-3 grid gap-2">{[["Plan today's lessons", "lesson-generator"], ["Create weekly lesson plan", "lesson-generator"], ["Prepare classroom activity", "classroom-activity-generator"], ["Generate homework", "homework-generator"], ["Prepare assessment", "question-paper-builder"]].map(([label, tool]) => <Link className="flex items-center gap-2 border-b py-2 text-sm font-medium" href={`/teacher/ai-studio/create/${tool}?context=${encodeURIComponent(label)}`} key={label}><Sparkles className="h-4 w-4 text-sky-700" />{label}</Link>)}</div></Card>
      </section>

      <section className="space-y-4" id="calendar">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-xl font-semibold">Calendar</h2><p className="text-sm text-muted-foreground">Classes, lessons, assignments, exams, meetings, events, tasks, and reminders.</p></div><div className="flex items-center gap-2"><Button aria-label="Previous period" className="h-9 w-9 p-0" onClick={() => move(-1)} variant="ghost"><ChevronLeft className="h-4 w-4" /></Button><Button className="h-9" onClick={() => setCursor(today)} variant="secondary">Today</Button><Button aria-label="Next period" className="h-9 w-9 p-0" onClick={() => move(1)} variant="ghost"><ChevronRight className="h-4 w-4" /></Button></div></div>
        <div className="flex gap-2 overflow-x-auto pb-1">{(["day", "week", "month", "agenda"] as View[]).map((item) => <Button className="h-9 shrink-0" key={item} onClick={() => setView(item)} variant={view === item ? "primary" : "secondary"}>{item[0].toUpperCase() + item.slice(1)}</Button>)}</div>
        <p className="font-semibold">{view === "month" ? cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" }) : `${formatDate(bounds[0], { dateStyle: "medium" })} - ${formatDate(bounds[1], { dateStyle: "medium" })}`}</p>
        {visible.length || sourceItems.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{visible.map((item) => <PlannerItemCard item={item} key={item.id} onSelect={setSelected} />)}{sourceItems.map((item) => <Link className="border-l-4 border-l-emerald-500 bg-surface p-4" href={item.href} key={item.id}><Badge>{item.kind}</Badge><h3 className="mt-2 font-semibold">{item.title}</h3><p className="mt-1 text-sm text-muted-foreground">{item.at}</p><p className="mt-1 text-sm">{item.detail}</p></Link>)}</div> : <PlannerEmpty icon={<CalendarDays className="h-5 w-5" />} title={`No ${view} events`} description="Create an event or plan a lesson for this period."><button className="font-semibold text-sky-700" onClick={() => openCreate("EVENT")} type="button">Create Event</button></PlannerEmpty>}
      </section>

      {selected ? <Detail close={() => setSelected(null)} data={data} item={selected} /> : null}

      <section><h2 className="text-xl font-semibold">Upcoming work</h2><div className="mt-4 grid gap-4 lg:grid-cols-4">{Object.entries(responsibilities).map(([group, items]) => <Card className="p-4" key={group}><h3 className="font-semibold">{group}</h3><div className="mt-3 space-y-2">{items.map((item) => <Link className="block border-b py-2 text-sm" href={item.href} key={item.id}><Badge>{item.kind}</Badge><span className="mt-1 block font-medium">{item.title}</span><span className="text-xs text-muted-foreground">{formatDate(item.at)}</span></Link>)}{!items.length ? <p className="text-sm text-muted-foreground">Nothing planned.</p> : null}</div></Card>)}</div></section>
    </div>
  );
}
