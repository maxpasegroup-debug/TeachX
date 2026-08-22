"use client";

import Link from "next/link";
import { useActionState, useMemo, useRef, useState } from "react";
import {
  Archive, Bell, BookOpen, CalendarDays, Check, Clock, Copy, Download, ExternalLink, FileText,
  GraduationCap, History, NotebookPen, Plus, RotateCcw, Search, Star, Trash2, UsersRound
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  archiveTeacherContentAction, createTeacherContentAction, createTeacherPlannerEventAction,
  deleteTeacherContentAction, deleteTeacherNoteAction, deleteTeacherNotificationAction,
  deleteTeacherPlannerEventAction, duplicateTeacherContentAction, markTeacherNotificationReadAction,
  restoreTeacherContentAction, saveTeacherNoteAction, setTeacherNoteStateAction,
  teacherWorkspaceSearchAction, toggleTeacherFavoriteAction, updateTeacherContentAction,
  type TeacherSearchState
} from "@/features/teacher-workspace/actions";
import { deleteAIConversationAction, duplicateAIConversationAction } from "@/features/ai-studio/actions";
import { createStandaloneClassAction } from "@/features/classrooms/actions";
import { TeacherPlanner } from "@/features/teacher-workspace/components/teacher-planner";
import type { getTeacherWorkspaceData, TeacherWorkspaceModule } from "@/services/teacher-workspace-service";

type WorkspaceData = Awaited<ReturnType<typeof getTeacherWorkspaceData>>;

const nav: { slug: TeacherWorkspaceModule; label: string; icon: typeof BookOpen }[] = [
  { slug: "classrooms", label: "My Classroom", icon: UsersRound },
  { slug: "lessons", label: "Lesson Library", icon: BookOpen },
  { slug: "resources", label: "Resource Library", icon: FileText },
  { slug: "planner", label: "Planner & Calendar", icon: CalendarDays },
  { slug: "notes", label: "Notes", icon: NotebookPen },
  { slug: "saved-ai", label: "Saved AI Outputs", icon: Star },
  { slug: "activity", label: "Recent Activity", icon: History },
  { slug: "notifications", label: "Notifications", icon: Bell },
  { slug: "search", label: "Global Search", icon: Search }
];

const moduleCopy: Record<TeacherWorkspaceModule, { title: string; description: string }> = {
  classrooms: { title: "My Classroom", description: "Classes, sections, subjects, students, attendance, resources, homework, and timetable." },
  lessons: { title: "Lesson Library", description: "Create, find, preview, version, favorite, duplicate, archive, restore, export, and delete lessons." },
  resources: { title: "Resource Library", description: "Manage your resources, purchased materials, downloads, and upload history." },
  planner: { title: "Planner & Calendar", description: "Daily, weekly, and monthly teaching plans, exams, events, reminders, and deadlines." },
  notes: { title: "Notes", description: "Personal, teaching, and AI notes with rich text, pinning, archive, restore, and search." },
  "saved-ai": { title: "Saved AI Outputs", description: "Search and reuse saved lessons, worksheets, quizzes, papers, reports, and certificates." },
  activity: { title: "Recent Activity", description: "A chronological view of creation, uploads, edits, marketplace, community, and downloads." },
  notifications: { title: "Notification Center", description: "Platform, marketplace, community, student, and AI notifications in one inbox." },
  search: { title: "Global Search", description: "Search lessons, resources, AI outputs, notes, community, and marketplace." }
};

function date(value: string) {
  return new Date(value).toLocaleString();
}

function safeRichText(value: string) {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

function ActionButton({ children, danger = false }: { children: React.ReactNode; danger?: boolean }) {
  return <button className={`rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted ${danger ? "text-red-600" : ""}`} type="submit">{children}</button>;
}

function DownloadButton({ title, text }: { title: string; text: string }) {
  function download() {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "teachx-resource"}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
  return <button className="rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted" onClick={download} type="button"><Download className="mr-1 inline h-3 w-3" />Export</button>;
}

function RichTextEditor({ defaultValue = "" }: { defaultValue?: string }) {
  const hidden = useRef<HTMLInputElement>(null);
  function format(command: "bold" | "italic" | "insertUnorderedList") {
    document.execCommand(command);
    if (hidden.current) hidden.current.value = hidden.current.previousElementSibling?.innerHTML ?? "";
  }
  return (
    <div>
      <div className="flex gap-2 rounded-t-xl border border-border bg-muted p-2">
        <button className="rounded bg-surface px-3 py-1 text-sm font-bold" onClick={() => format("bold")} type="button">B</button>
        <button className="rounded bg-surface px-3 py-1 text-sm italic" onClick={() => format("italic")} type="button">I</button>
        <button className="rounded bg-surface px-3 py-1 text-sm" onClick={() => format("insertUnorderedList")} type="button">• List</button>
      </div>
      <div className="min-h-32 rounded-b-xl border border-t-0 border-border bg-surface p-4 outline-none focus:ring-2 focus:ring-primary/10" contentEditable dangerouslySetInnerHTML={{ __html: safeRichText(defaultValue) }} onInput={(event) => { if (hidden.current) hidden.current.value = event.currentTarget.innerHTML; }} suppressContentEditableWarning />
      <input defaultValue={defaultValue} name="content" ref={hidden} type="hidden" />
    </div>
  );
}

function ContentActions({ item }: { item: WorkspaceData["content"][number] }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link className="rounded-full border border-border px-3 py-1.5 text-xs font-medium" href="/teacher/workspace/planner">Schedule</Link>
      <Link className="rounded-full border border-border px-3 py-1.5 text-xs font-medium" href="/teacher/workspace/classrooms">Use in class</Link>
      <form action={toggleTeacherFavoriteAction}><input name="entityId" type="hidden" value={item.id} /><input name="type" type="hidden" value="teacher-content" /><input name="title" type="hidden" value={item.title} /><input name="link" type="hidden" value="/teacher/workspace/lessons" /><ActionButton><Star className={`mr-1 inline h-3 w-3 ${item.favorite ? "fill-current" : ""}`} />{item.favorite ? "Unfavorite" : "Favorite"}</ActionButton></form>
      <form action={duplicateTeacherContentAction}><input name="id" type="hidden" value={item.id} /><ActionButton><Copy className="mr-1 inline h-3 w-3" />Duplicate</ActionButton></form>
      {item.status === "ARCHIVED" ? <form action={restoreTeacherContentAction}><input name="id" type="hidden" value={item.id} /><ActionButton><RotateCcw className="mr-1 inline h-3 w-3" />Restore</ActionButton></form> : <form action={archiveTeacherContentAction}><input name="id" type="hidden" value={item.id} /><ActionButton><Archive className="mr-1 inline h-3 w-3" />Archive</ActionButton></form>}
      <form action={deleteTeacherContentAction}><input name="id" type="hidden" value={item.id} /><ActionButton danger><Trash2 className="mr-1 inline h-3 w-3" />Delete</ActionButton></form>
      <DownloadButton text={`${item.title}\n\n${item.description ?? ""}\n\n${item.fileUrl ?? ""}`} title={item.title} />
    </div>
  );
}

function Library({ data, lessonsOnly = false }: { data: WorkspaceData; lessonsOnly?: boolean }) {
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("ALL");
  const [status, setStatus] = useState("ACTIVE");
  const [sort, setSort] = useState("UPDATED");
  const lessonTypes = ["NOTES", "DOCUMENT", "PPT"];
  const visible = useMemo(() => data.content
    .filter((item) => !lessonsOnly || lessonTypes.includes(item.type))
    .filter((item) => `${item.title} ${item.description} ${item.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()))
    .filter((item) => course === "ALL" || item.courseId === course)
    .filter((item) => status === "ALL" || (status === "ACTIVE" ? item.status !== "ARCHIVED" : item.status === status))
    .sort((a, b) => sort === "TITLE" ? a.title.localeCompare(b.title) : sort === "OLDEST" ? a.updatedAt.localeCompare(b.updatedAt) : b.updatedAt.localeCompare(a.updatedAt)),
  [course, data.content, lessonsOnly, query, sort, status]);

  return (
    <div className="space-y-6">
      <details className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <summary className="cursor-pointer font-semibold"><Plus className="mr-2 inline h-4 w-4" />Create {lessonsOnly ? "lesson" : "resource"}</summary>
        <form action={createTeacherContentAction} className="mt-5 grid gap-4 md:grid-cols-2">
          <div><Label>Title</Label><Input name="title" required /></div>
          <div><Label>Category</Label><Select name="type" defaultValue={lessonsOnly ? "NOTES" : "DOCUMENT"}>{["NOTES", "DOCUMENT", "WORKSHEET", "QUESTION_PAPER", "PDF", "PPT", "EXTERNAL_LINK", "REFERENCE"].map((type) => <option key={type}>{type}</option>)}</Select></div>
          <div><Label>Grade / Course</Label><Select name="courseId" required><option value="">Select course</option>{data.courses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></div>
          <div><Label>Subject</Label><Select name="subjectId"><option value="">All subjects</option>{data.subjects.map((item) => <option key={item.id} value={item.id}>{item.name} - {item.course}</option>)}</Select></div>
          <div className="md:col-span-2"><Label>Description / Lesson Content</Label><Textarea name="description" required /></div>
          <div className="md:col-span-2"><Label>File or external URL</Label><Input name="externalUrl" type="url" /></div>
          <Button className="md:col-span-2 md:w-fit" type="submit">Create draft</Button>
        </form>
      </details>
      <div className="grid gap-3 md:grid-cols-4">
        <Input aria-label="Search library" onChange={(event) => setQuery(event.target.value)} placeholder="Search title, tags, subject..." type="search" value={query} />
        <Select aria-label="Course filter" onChange={(event) => setCourse(event.target.value)} value={course}><option value="ALL">All grades / courses</option>{data.courses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
        <Select aria-label="Status filter" onChange={(event) => setStatus(event.target.value)} value={status}><option value="ACTIVE">Active</option><option value="ALL">All statuses</option><option value="DRAFT">Drafts</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></Select>
        <Select aria-label="Sort library" onChange={(event) => setSort(event.target.value)} value={sort}><option value="UPDATED">Recently updated</option><option value="OLDEST">Oldest first</option><option value="TITLE">Title A-Z</option></Select>
      </div>
      {!visible.length ? <div className="space-y-4"><EmptyState icon={<BookOpen className="h-5 w-5" />} title={`No ${lessonsOnly ? "lessons" : "resources"} found`} description="Create your first item or adjust the current filters." /><div className="flex flex-wrap justify-center gap-2"><Link className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" href={lessonsOnly ? "/teacher/ai-studio/create/lesson-generator" : "/teacher/ai-studio"}>Create with AI</Link>{!lessonsOnly ? <Link className="rounded-xl border border-border px-4 py-2 text-sm font-medium" href="/teacher/resources">Open Resource Studio</Link> : null}</div></div> :
        <div className="grid gap-4 lg:grid-cols-2">{visible.map((item) => <Card className="p-5 shadow-soft" key={item.id}>
          <div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap gap-2"><Badge>{item.type.replaceAll("_", " ")}</Badge><Badge>{item.status}</Badge></div><h2 className="mt-3 text-xl font-semibold">{item.title}</h2><p className="mt-1 text-sm text-muted-foreground">{item.course}{item.subject ? ` - ${item.subject}` : ""} - Version {item.version}</p></div><Star className={`h-5 w-5 text-sky-700 ${item.favorite ? "fill-current" : ""}`} /></div>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">{item.description || "No description."}</p>
          <details className="my-4 rounded-xl bg-background p-3"><summary className="cursor-pointer text-sm font-medium">Preview and edit</summary><form action={updateTeacherContentAction} className="mt-4 space-y-3"><input name="id" type="hidden" value={item.id} /><Input defaultValue={item.title} name="title" required /><Textarea defaultValue={item.description ?? ""} name="description" /><Input defaultValue={item.fileUrl ?? ""} name="externalUrl" placeholder="File or external URL" /><Button type="submit" variant="secondary">Save changes</Button>{item.fileUrl ? <Link className="ml-3 inline-flex items-center text-sm font-semibold text-sky-700" href={item.fileUrl} target="_blank">Open file <ExternalLink className="ml-1 h-3 w-3" /></Link> : null}</form></details>
          <ContentActions item={item} />
        </Card>)}</div>}
    </div>
  );
}

function Classrooms({ data }: { data: WorkspaceData }) {
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("ALL");
  const [sort, setSort] = useState<"NAME" | "STUDENTS" | "PENDING">("NAME");
  const items = data.classrooms
    .filter((item) => `${item.title} ${item.course} ${item.section} ${item.subjects.join(" ")}`.toLowerCase().includes(query.toLowerCase()))
    .filter((item) => course === "ALL" || item.course === course)
    .sort((a, b) => sort === "STUDENTS" ? b.studentCount - a.studentCount : sort === "PENDING" ? b.homeworkPending - a.homeworkPending : a.title.localeCompare(b.title));
  const courses = [...new Set(data.classrooms.map((item) => item.course))];
  const pending = data.classrooms.reduce((total, item) => total + item.homeworkPending, 0);
  return <div className="space-y-6">
    <section className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]"><Card className="p-5 shadow-soft"><p className="text-sm text-muted-foreground">Teaching today</p><h2 className="mt-1 text-2xl font-semibold">Classes, work to review, and the next action.</h2><div className="mt-4 grid grid-cols-3 gap-3 text-sm"><div className="rounded-xl bg-background p-3"><b>{data.classrooms.length}</b><span className="block text-muted-foreground">Classes</span></div><div className="rounded-xl bg-background p-3"><b>{pending}</b><span className="block text-muted-foreground">Reviews</span></div><div className="rounded-xl bg-background p-3"><b>{data.timetable.length}</b><span className="block text-muted-foreground">Upcoming</span></div></div></Card><Card className="p-5 shadow-soft"><h2 className="font-semibold">Teaching quick actions</h2><div className="mt-4 grid gap-2"><Link className="rounded-xl border px-4 py-3 text-sm font-medium hover:bg-sky-50" href="/teacher/ai-studio/create/lesson-generator">Create lesson with AI</Link><Link className="rounded-xl border px-4 py-3 text-sm font-medium hover:bg-sky-50" href="/teacher/ai-studio/create/homework-generator">Create assignment with AI</Link><Link className="rounded-xl border px-4 py-3 text-sm font-medium hover:bg-sky-50" href="/teacher/workspace/planner">Open teaching schedule</Link></div></Card></section>
    {data.personalWorkspace ? <CreateClassForm /> : null}
    <div className="grid gap-3 md:grid-cols-[1fr_220px_180px]"><Input onChange={(event) => setQuery(event.target.value)} placeholder="Search classes, sections, or subjects..." type="search" value={query} /><Select aria-label="Filter classes by course" onChange={(event) => setCourse(event.target.value)} value={course}><option value="ALL">All courses</option>{courses.map((item) => <option key={item}>{item}</option>)}</Select><Select aria-label="Sort classes" onChange={(event) => setSort(event.target.value as typeof sort)} value={sort}><option value="NAME">Name A–Z</option><option value="STUDENTS">Most students</option><option value="PENDING">Most reviews</option></Select></div>
    {!items.length ? <div className="space-y-4"><EmptyState icon={<UsersRound className="h-5 w-5" />} title={data.classrooms.length ? "No classes match these filters" : "No classes yet"} description={data.classrooms.length ? "Adjust your search or course filter." : "Your teaching work can begin now while a class assignment is being prepared."} />{!data.classrooms.length ? <div className="flex flex-wrap justify-center gap-2"><Link className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" href="/teacher/ai-studio/create/lesson-generator">Plan a lesson</Link><Link className="rounded-xl border border-border px-4 py-2 text-sm font-medium" href="/teacher/workspace/planner">Open Planner</Link></div> : null}</div> : <div className="grid gap-5 xl:grid-cols-2">{items.map((item) => <Card className="p-5 shadow-soft" key={item.id}><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">{item.title}</h2><p className="mt-1 text-sm text-muted-foreground">{item.course} · Section {item.section}</p></div><Badge>{item.studentCount} students</Badge></div><div className="mt-5 grid grid-cols-3 gap-3"><div className="rounded-xl bg-background p-3"><p className="text-xs text-muted-foreground">Attendance</p><p className="mt-1 font-semibold">{item.attendanceRate === null ? "Not taken" : `${item.attendanceRate}%`}</p></div><div className="rounded-xl bg-background p-3"><p className="text-xs text-muted-foreground">Resources</p><p className="mt-1 font-semibold">{item.resourceCount}</p></div><div className="rounded-xl bg-background p-3"><p className="text-xs text-muted-foreground">To review</p><p className="mt-1 font-semibold">{item.homeworkPending}</p></div></div><p className="mt-4 text-sm"><strong>Subjects:</strong> {item.subjects.join(", ") || "Not assigned"}</p>{item.timetable.length ? <p className="mt-2 text-sm text-muted-foreground">Next schedule: {item.timetable[0]?.day} · {item.timetable[0]?.time}</p> : null}<div className="mt-4 flex flex-wrap gap-2"><Link className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground" href={`/classrooms/${item.id}`}>Open class</Link><Link className="rounded-full border border-border px-4 py-2 text-xs font-medium" href={`/classrooms/${item.id}#attendance`}>Take attendance</Link><Link className="rounded-full border border-border px-4 py-2 text-xs font-medium" href={`/classrooms/${item.id}#assignments`}>Review work</Link><Link className="rounded-full border border-border px-4 py-2 text-xs font-medium" href={`/classrooms/${item.id}#materials`}>Resources</Link></div></Card>)}</div>}
  </div>;
}

function CreateClassForm() {
  const [message, action, pending] = useActionState(createStandaloneClassAction, undefined);
  const classroomId = message?.startsWith("CLASS_CREATED:") ? message.slice("CLASS_CREATED:".length) : null;
  return <Card className="p-5 shadow-soft">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div><h2 className="text-xl font-semibold">Create your first class</h2><p className="mt-1 text-sm text-muted-foreground">Set up a class, then add your students and start teaching.</p></div>
      {classroomId ? <Link className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground" href={`/classrooms/${classroomId}`}>Open class and add students</Link> : null}
    </div>
    <form action={action} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <div><Label htmlFor="className">Class name</Label><Input className="mt-2" id="className" name="className" placeholder="Class 7A" required /></div>
      <div><Label htmlFor="subjectName">Subject</Label><Input className="mt-2" id="subjectName" name="subjectName" placeholder="Science" required /></div>
      <div><Label htmlFor="section">Section</Label><Input className="mt-2" defaultValue="Main" id="section" name="section" required /></div>
      <div><Label htmlFor="mode">Teaching mode</Label><Select className="mt-2" id="mode" name="mode" defaultValue="OFFLINE"><option value="OFFLINE">In person</option><option value="LIVE">Online live</option><option value="HYBRID">Hybrid</option></Select></div>
      <div><Label htmlFor="capacity">Maximum students</Label><Input className="mt-2" defaultValue="30" id="capacity" max="200" min="1" name="capacity" type="number" required /></div>
      <div className="sm:col-span-2 lg:col-span-5"><Button className="min-h-11" disabled={pending} type="submit"><Plus className="mr-2 h-4 w-4" />{pending ? "Creating class" : "Create class"}</Button>{message && !classroomId ? <p className="mt-3 text-sm" role="status">{message}</p> : null}{classroomId ? <p className="mt-3 text-sm text-emerald-700" role="status">Class created. Add your students next.</p> : null}</div>
    </form>
  </Card>;
}

function Resources({ data }: { data: WorkspaceData }) {
  const [tab, setTab] = useState<"mine" | "purchased" | "downloads">("mine");
  return <div className="space-y-6"><div className="flex flex-wrap gap-2">{(["mine", "purchased", "downloads"] as const).map((item) => <button className={`rounded-full px-4 py-2 text-sm font-medium ${tab === item ? "bg-primary text-primary-foreground" : "border border-border bg-surface"}`} key={item} onClick={() => setTab(item)} type="button">{item === "mine" ? "My Resources & Upload History" : item === "purchased" ? "Purchased Resources" : "Downloads"}</button>)}</div>{tab === "mine" ? <Library data={data} /> : tab === "purchased" ? <ResourceRows empty="No purchased resources yet." items={data.purchases.map((item) => ({ id: item.id, title: item.title, meta: `${item.course} - ${item.currency} ${item.total} - ${date(item.purchasedAt)}`, url: item.fileUrl }))} /> : <ResourceRows empty="No downloads yet." items={data.downloads.map((item) => ({ id: item.id, title: item.title, meta: `${item.course}${item.subject ? ` - ${item.subject}` : ""} - ${date(item.downloadedAt)}`, url: item.fileUrl }))} />}</div>;
}

function ResourceRows({ items, empty }: { items: { id: string; title: string; meta: string; url?: string | null }[]; empty: string }) {
  return items.length ? <div className="grid gap-3 md:grid-cols-2">{items.map((item) => <Card className="p-4" key={item.id}><h2 className="font-semibold">{item.title}</h2><p className="mt-1 text-sm text-muted-foreground">{item.meta}</p>{item.url ? <Link className="mt-3 inline-flex text-sm font-semibold text-sky-700" href={item.url} target="_blank">Preview / download</Link> : null}</Card>)}</div> : <EmptyState icon={<Download className="h-5 w-5" />} title={empty} description="Resource activity will appear here automatically." />;
}

function Planner({ data }: { data: WorkspaceData }) {
  const [view, setView] = useState<"daily" | "weekly" | "monthly">("weekly");
  const now = new Date();
  const range = data.planner.filter((item) => {
    const start = new Date(item.startsAt);
    if (view === "daily") return start.toDateString() === now.toDateString();
    if (view === "weekly") return Math.abs(start.getTime() - now.getTime()) <= 7 * 86400000;
    return start.getMonth() === now.getMonth() && start.getFullYear() === now.getFullYear();
  });
  return <div className="space-y-6"><details className="rounded-2xl border border-border bg-surface p-5 shadow-soft"><summary className="cursor-pointer font-semibold"><Plus className="mr-2 inline h-4 w-4" />Add event, reminder, or deadline</summary><form action={createTeacherPlannerEventAction} className="mt-5 grid gap-4 md:grid-cols-2"><div><Label>Title</Label><Input name="title" required /></div><div><Label>Calendar type</Label><Select name="type"><option value="EVENT">Teaching event / reminder / deadline</option><option value="HOLIDAY">Holiday</option><option value="SPECIAL_HOLIDAY">Special holiday</option></Select></div><div><Label>Starts</Label><Input name="startsAt" required type="datetime-local" /></div><div><Label>Ends</Label><Input name="endsAt" required type="datetime-local" /></div><div className="md:col-span-2"><Label>Description and reminder details</Label><Textarea name="description" /></div><Button className="md:w-fit" type="submit">Add to planner</Button></form></details><div className="flex gap-2">{(["daily", "weekly", "monthly"] as const).map((item) => <button className={`rounded-full px-4 py-2 text-sm font-medium ${view === item ? "bg-primary text-primary-foreground" : "border border-border"}`} key={item} onClick={() => setView(item)} type="button">{item[0].toUpperCase() + item.slice(1)}</button>)}</div><div className="grid gap-5 lg:grid-cols-2"><Card className="p-5"><h2 className="text-xl font-semibold">Teaching Schedule</h2><div className="mt-4 space-y-2">{data.timetable.length ? data.timetable.map((item) => <Link className="block rounded-xl bg-background p-3 text-sm" href={item.href} key={item.id}><strong>{item.day} - {item.time}</strong><span className="block text-muted-foreground">{item.title}</span></Link>) : <p className="text-sm text-muted-foreground">No teaching schedule assigned.</p>}</div></Card><Card className="p-5"><h2 className="text-xl font-semibold">Exam Schedule</h2><div className="mt-4 space-y-2">{data.exams.length ? data.exams.map((item) => <div className="rounded-xl bg-background p-3 text-sm" key={item.id}><strong>{item.title}</strong><span className="block text-muted-foreground">{item.course} - {date(item.startsAt)}</span></div>) : <p className="text-sm text-muted-foreground">No upcoming exams.</p>}</div></Card></div><section><h2 className="mb-4 text-xl font-semibold">{view[0].toUpperCase() + view.slice(1)} Calendar</h2>{range.length ? <div className="grid gap-3 md:grid-cols-2">{range.map((item) => <Card className="p-4" key={item.id}><div className="flex justify-between gap-3"><div><Badge>{item.type}</Badge><h3 className="mt-2 font-semibold">{item.title}</h3><p className="mt-1 text-sm text-muted-foreground">{date(item.startsAt)} - {date(item.endsAt)}</p>{item.description ? <p className="mt-2 text-sm">{item.description}</p> : null}</div><form action={deleteTeacherPlannerEventAction}><input name="id" type="hidden" value={item.id} /><ActionButton danger><Trash2 className="h-3 w-3" /></ActionButton></form></div></Card>)}</div> : <EmptyState icon={<CalendarDays className="h-5 w-5" />} title={`No ${view} events`} description="Add an event, reminder, or deadline above." />}</section></div>;
}

function Notes({ data }: { data: WorkspaceData }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ACTIVE");
  const notes = data.notes.filter((note) => `${note.title} ${note.content} ${note.kind}`.toLowerCase().includes(query.toLowerCase())).filter((note) => filter === "ALL" || (filter === "ARCHIVED" ? note.archived : !note.archived)).sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
  return <div className="space-y-6"><details className="rounded-2xl border border-border bg-surface p-5"><summary className="cursor-pointer font-semibold"><Plus className="mr-2 inline h-4 w-4" />Create note</summary><form action={saveTeacherNoteAction} className="mt-5 space-y-4"><div className="grid gap-4 md:grid-cols-2"><div><Label>Title</Label><Input name="title" required /></div><div><Label>Type</Label><Select name="kind"><option>PERSONAL</option><option>TEACHING</option><option>AI</option></Select></div></div><Label>Rich text</Label><RichTextEditor /><Button type="submit">Save note</Button></form></details><div className="grid gap-3 md:grid-cols-[1fr_220px]"><Input onChange={(event) => setQuery(event.target.value)} placeholder="Search notes..." type="search" value={query} /><Select onChange={(event) => setFilter(event.target.value)} value={filter}><option value="ACTIVE">Active notes</option><option value="ARCHIVED">Archived notes</option><option value="ALL">All notes</option></Select></div>{notes.length ? <div className="grid gap-4 lg:grid-cols-2">{notes.map((note) => <Card className="p-5" key={note.id}><div className="flex justify-between gap-3"><div><Badge>{note.kind}</Badge><h2 className="mt-2 text-xl font-semibold">{note.title}</h2><p className="mt-1 text-xs text-muted-foreground">{date(note.updatedAt)}</p></div>{note.pinned ? <Star className="h-5 w-5 fill-current text-sky-700" /> : null}</div><div className="prose prose-sm mt-4 max-h-44 overflow-auto rounded-xl bg-background p-4" dangerouslySetInnerHTML={{ __html: safeRichText(note.content) }} /><details className="my-4"><summary className="cursor-pointer text-sm font-medium">Edit note</summary><form action={saveTeacherNoteAction} className="mt-3 space-y-3"><input name="id" type="hidden" value={note.id} /><input name="key" type="hidden" value={note.key} /><input name="pinned" type="hidden" value={String(note.pinned)} /><input name="archived" type="hidden" value={String(note.archived)} /><Input defaultValue={note.title} name="title" /><Select defaultValue={note.kind} name="kind"><option>PERSONAL</option><option>TEACHING</option><option>AI</option></Select><RichTextEditor defaultValue={note.content} /><Button type="submit" variant="secondary">Save changes</Button></form></details><div className="flex flex-wrap gap-2"><form action={setTeacherNoteStateAction}><input name="id" type="hidden" value={note.id} /><input name="field" type="hidden" value="pinned" /><input name="enabled" type="hidden" value={String(!note.pinned)} /><ActionButton>{note.pinned ? "Unpin" : "Pin"}</ActionButton></form><form action={setTeacherNoteStateAction}><input name="id" type="hidden" value={note.id} /><input name="field" type="hidden" value="archived" /><input name="enabled" type="hidden" value={String(!note.archived)} /><ActionButton>{note.archived ? "Restore" : "Archive"}</ActionButton></form><form action={deleteTeacherNoteAction}><input name="id" type="hidden" value={note.id} /><ActionButton danger>Delete</ActionButton></form></div></Card>)}</div> : <EmptyState icon={<NotebookPen className="h-5 w-5" />} title="No notes found" description="Create a note or adjust the search and archive filter." />}</div>;
}

function SavedAI({ data }: { data: WorkspaceData }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("ALL");
  const types = [...new Set(data.aiOutputs.map((item) => item.type))];
  const items = data.aiOutputs.filter((item) => `${item.title} ${item.type} ${item.text}`.toLowerCase().includes(query.toLowerCase())).filter((item) => type === "ALL" || item.type === type);
  return <div className="space-y-6"><div className="grid gap-3 md:grid-cols-[1fr_260px]"><Input onChange={(event) => setQuery(event.target.value)} placeholder="Search saved AI outputs..." type="search" value={query} /><Select onChange={(event) => setType(event.target.value)} value={type}><option value="ALL">All output types</option>{types.map((item) => <option key={item}>{item.replaceAll("-", " ")}</option>)}</Select></div>{items.length ? <div className="grid gap-4 lg:grid-cols-2">{items.map((item) => <Card className="p-5" key={item.id}><div className="flex justify-between"><div><Badge>{item.type.replaceAll("-", " ")}</Badge><h2 className="mt-2 text-xl font-semibold">{item.title}</h2><p className="mt-1 text-xs text-muted-foreground">{date(item.updatedAt)}</p></div>{item.favorite ? <Star className="h-5 w-5 fill-current text-sky-700" /> : null}</div><details className="my-4 rounded-xl bg-background p-3"><summary className="cursor-pointer text-sm font-medium">Preview</summary><pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-sm">{item.text}</pre></details><div className="flex flex-wrap gap-2"><form action={toggleTeacherFavoriteAction}><input name="entityId" type="hidden" value={item.id} /><input name="type" type="hidden" value="ai-generation" /><input name="title" type="hidden" value={item.title} /><input name="link" type="hidden" value="/teacher/workspace/saved-ai" /><ActionButton>{item.favorite ? "Unfavorite" : "Favorite"}</ActionButton></form><form action={duplicateAIConversationAction}><input name="conversationId" type="hidden" value={item.id} /><ActionButton><Copy className="mr-1 inline h-3 w-3" />Duplicate</ActionButton></form><DownloadButton text={item.text} title={item.title} /><form action={deleteAIConversationAction}><input name="conversationId" type="hidden" value={item.id} /><ActionButton danger><Trash2 className="mr-1 inline h-3 w-3" />Delete</ActionButton></form></div></Card>)}</div> : <div className="space-y-4"><EmptyState icon={<Star className="h-5 w-5" />} title="No saved AI outputs found" description="Create teacher-ready material in AI Studio and it will appear here automatically." /><div className="flex justify-center"><Link className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" href="/teacher/ai-studio">Open AI Studio</Link></div></div>}</div>;
}

function Activity({ data }: { data: WorkspaceData }) {
  const [type, setType] = useState("ALL");
  const types = [...new Set(data.activities.map((item) => item.type))];
  const items = data.activities.filter((item) => type === "ALL" || item.type === type);
  return <div className="space-y-5"><Select className="max-w-xs" onChange={(event) => setType(event.target.value)} value={type}><option value="ALL">All activity</option>{types.map((item) => <option key={item}>{item}</option>)}</Select>{items.length ? <div className="relative space-y-3 before:absolute before:bottom-4 before:left-5 before:top-4 before:w-px before:bg-border">{items.map((item) => <Card className="relative ml-10 p-4" key={item.id}><span className="absolute -left-[2.15rem] top-5 h-3 w-3 rounded-full bg-sky-600 ring-4 ring-sky-50" /><div className="flex flex-wrap justify-between gap-2"><div><Badge>{item.type}</Badge><h2 className="mt-2 font-semibold">{item.title}</h2>{item.body ? <p className="mt-1 text-sm text-muted-foreground">{item.body}</p> : null}</div><p className="text-xs text-muted-foreground">{date(item.createdAt)}</p></div>{item.link ? <Link className="mt-3 inline-flex text-sm font-semibold text-sky-700" href={item.link}>Open activity</Link> : null}</Card>)}</div> : <EmptyState icon={<History className="h-5 w-5" />} title="No activity yet" description="AI generation, uploads, edits, community, marketplace, and downloads will appear here." />}</div>;
}

function Notifications({ data }: { data: WorkspaceData }) {
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const categories = [...new Set(data.notifications.map((item) => item.category))];
  const items = data.notifications.filter((item) => category === "ALL" || item.category === category).filter((item) => status === "ALL" || item.status === status);
  return <div className="space-y-5"><div className="grid gap-3 sm:grid-cols-2"><Select onChange={(event) => setCategory(event.target.value)} value={category}><option value="ALL">All notification types</option>{categories.map((item) => <option key={item}>{item}</option>)}</Select><Select onChange={(event) => setStatus(event.target.value)} value={status}><option value="ALL">All statuses</option><option>UNREAD</option><option>READ</option><option>ARCHIVED</option></Select></div>{items.length ? <div className="space-y-3">{items.map((item) => <Card className={`p-4 ${item.status === "UNREAD" ? "border-sky-200 bg-sky-50/40" : ""}`} key={item.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex gap-2"><Badge>{item.category}</Badge><Badge>{item.status}</Badge></div><h2 className="mt-2 font-semibold">{item.title}</h2>{item.body ? <p className="mt-1 text-sm text-muted-foreground">{item.body}</p> : null}<p className="mt-2 text-xs text-muted-foreground">{date(item.createdAt)}</p></div><div className="flex gap-2">{item.status === "UNREAD" ? <form action={markTeacherNotificationReadAction}><input name="id" type="hidden" value={item.id} /><ActionButton><Check className="mr-1 inline h-3 w-3" />Mark read</ActionButton></form> : null}<form action={deleteTeacherNotificationAction}><input name="id" type="hidden" value={item.id} /><ActionButton danger>Delete</ActionButton></form>{item.link ? <Link className="rounded-full border border-border px-3 py-1.5 text-xs font-medium" href={item.link}>Open</Link> : null}</div></div></Card>)}</div> : <EmptyState icon={<Bell className="h-5 w-5" />} title="No matching notifications" description="Adjust the type or status filter." />}</div>;
}

const initialSearch: TeacherSearchState = { results: [] };
function GlobalSearch() {
  const [state, action, pending] = useActionState(teacherWorkspaceSearchAction, initialSearch);
  return <div className="space-y-6"><form action={action} className="flex gap-3"><Input aria-label="Global teacher workspace search" name="query" placeholder="Search lessons, resources, AI outputs, notes, community, marketplace..." required /><Button disabled={pending} type="submit"><Search className="mr-2 h-4 w-4" />{pending ? "Searching..." : "Search"}</Button></form>{state.error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{state.error}</p> : null}{state.query && !state.results.length ? <EmptyState icon={<Search className="h-5 w-5" />} title="No results found" description={`Nothing matched "${state.query}".`} /> : <div className="grid gap-3 md:grid-cols-2">{state.results.map((item, index) => <Link className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:bg-muted" href={item.href} key={`${item.type}-${item.title}-${index}`}><Badge>{item.type}</Badge><h2 className="mt-2 font-semibold">{item.title}</h2>{item.subtitle ? <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p> : null}</Link>)}</div>}</div>;
}

export function TeacherWorkspacePage({ module, data }: { module: TeacherWorkspaceModule; data: WorkspaceData }) {
  const copy = moduleCopy[module];
  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link className="hover:text-foreground" href="/teacher">Teacher Home</Link><span className="mx-2">/</span><span className="text-foreground">{copy.title}</span></nav>
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8"><Badge>Teacher Workspace</Badge><h1 className="mt-4 text-4xl font-semibold tracking-tight">{copy.title}</h1><p className="mt-3 max-w-3xl text-lg text-muted-foreground">{copy.description}</p></section>
      <nav className="flex gap-2 overflow-x-auto pb-2" aria-label="Teacher Workspace modules">{nav.map((item) => { const Icon = item.icon; return <Link className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${module === item.slug ? "bg-primary text-primary-foreground" : "border border-border bg-surface hover:bg-muted"}`} href={`/teacher/workspace/${item.slug}`} key={item.slug}><Icon className="h-4 w-4" />{item.label}</Link>; })}</nav>
      {module === "classrooms" ? <Classrooms data={data} /> : module === "lessons" ? <Library data={data} lessonsOnly /> : module === "resources" ? <Resources data={data} /> : module === "planner" ? <TeacherPlanner data={data} /> : module === "notes" ? <Notes data={data} /> : module === "saved-ai" ? <SavedAI data={data} /> : module === "activity" ? <Activity data={data} /> : module === "notifications" ? <Notifications data={data} /> : <GlobalSearch />}
    </div>
  );
}
