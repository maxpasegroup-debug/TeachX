"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Activity, AlertTriangle, BookOpen, Building2, Bus, ClipboardCheck, Download, Search, ShieldAlert, UsersRound, Wrench } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import type { getCampusOperations } from "@/services/campus-operations-service";

type CampusData = Awaited<ReturnType<typeof getCampusOperations>>;
type Module = "overview" | "attendance" | "visitors" | "transport" | "hostel" | "library" | "maintenance" | "inventory" | "security" | "settings";

const modules: { id: Module; label: string; icon: typeof Activity }[] = [
  { id: "overview", label: "Command center", icon: Activity }, { id: "attendance", label: "Attendance", icon: ClipboardCheck }, { id: "visitors", label: "Visitors", icon: UsersRound }, { id: "transport", label: "Transport", icon: Bus }, { id: "hostel", label: "Hostel", icon: Building2 }, { id: "library", label: "Library", icon: BookOpen }, { id: "maintenance", label: "Maintenance", icon: Wrench }, { id: "inventory", label: "Inventory", icon: ClipboardCheck }, { id: "security", label: "Security", icon: ShieldAlert }, { id: "settings", label: "Settings", icon: Activity }
];

export function CampusOperationsCenter({ data, institutionName, initialModule = "overview" }: { data: CampusData; institutionName: string; initialModule?: string }) {
  const [active, setActive] = useState<Module>(modules.some(({ id }) => id === initialModule) ? initialModule as Module : "overview");
  const [query, setQuery] = useState("");
  const q = query.toLowerCase();
  const visitors = useMemo(() => data.visitors.filter((item) => [item.name, item.purpose, item.status].join(" ").toLowerCase().includes(q)), [data.visitors, q]);
  const attendance = useMemo(() => data.attendance.filter((item) => [item.classroom, item.batch, item.remarks].join(" ").toLowerCase().includes(q)), [data.attendance, q]);
  const exportRows = () => {
    const rows = active === "attendance" ? attendance : active === "visitors" ? visitors : data.activity;
    const content = ["CampusX export", JSON.stringify(rows, null, 2)].join("\n");
    const anchor = document.createElement("a"); anchor.href = URL.createObjectURL(new Blob([content], { type: "application/json" })); anchor.download = `campusx-${active}.json`; anchor.click(); URL.revokeObjectURL(anchor.href);
  };
  const unavailable = (title: string, detail: string, href?: string) => <EmptyState icon={<Building2 className="h-5 w-5" />} title={`${title} is not connected yet`} description={detail} />;

  return <main className="min-h-[calc(100vh-7rem)] text-slate-950">
    <header className="overflow-hidden border border-slate-200 bg-[radial-gradient(circle_at_90%_15%,#b9f5d0,transparent_26%),linear-gradient(118deg,#073b3a,#0d5d5b_55%,#0b6c79)] px-6 py-8 text-white shadow-xl sm:px-9">
      <p className="text-xs font-bold uppercase tracking-[.24em] text-emerald-200">CampusX Guru · daily operations</p>
      <div className="mt-3 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><h1 className="text-3xl font-black tracking-tight sm:text-5xl">The campus, in one clear signal.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50">{institutionName} · live operational evidence is separated from readiness states so every action is accountable.</p></div><div className="border-l border-white/30 pl-5"><p className="text-xs uppercase tracking-widest text-emerald-200">Operational status</p><p className="mt-1 text-xl font-bold">{data.summary.health}</p></div></div>
    </header>
    <section className="mt-5 flex flex-col gap-3 border-y border-slate-200 bg-white py-3 lg:flex-row"><label className="flex flex-1 items-center gap-2 border border-slate-300 bg-slate-50 px-3"><Search className="h-4 w-4 text-slate-500"/><input aria-label="Search campus records" className="w-full bg-transparent py-2 text-sm outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="Search attendance, visitors, activities" value={query}/></label><Button className="gap-2" onClick={exportRows} variant="secondary"><Download className="h-4 w-4"/>Export current view</Button></section>
    <nav aria-label="Campus modules" className="my-5 flex gap-2 overflow-x-auto pb-2">{modules.map(({ id, label, icon: Icon }) => <button className={`flex shrink-0 items-center gap-2 border px-3 py-2 text-sm font-semibold transition ${active === id ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-400"}`} key={id} onClick={() => setActive(id)}><Icon className="h-4 w-4"/>{label}</button>)}</nav>
    {active === "overview" && <><section className="grid gap-px overflow-hidden border border-slate-200 bg-slate-200 sm:grid-cols-2 xl:grid-cols-5">{[["Attendance", data.summary.attendanceRate === null ? "—" : `${data.summary.attendanceRate}%`, "saved sessions only"],["Sessions today", data.summary.sessionsToday, "academic attendance"],["Visitors today", data.summary.visitorsToday, "reception register"],["Alerts", data.summary.criticalAlerts, "unread notifications"],["Campus health", data.summary.health, "evidence-based"]].map(([label, value, note]) => <div className="bg-white p-5" key={String(label)}><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-3 text-2xl font-black text-slate-900">{value}</p><p className="mt-2 text-xs text-slate-500">{note}</p></div>)}</section><section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]"><Evidence title="Today’s operational evidence" items={data.activity.map(item => ({ title: item.title, meta: `${item.entity ?? "Activity"} · ${new Date(item.createdAt).toLocaleString()}`, body: item.body }))} empty="No institution activity has been recorded yet."/><Evidence title="Attention queue" items={data.notifications.map(item => ({ title: item.title, meta: new Date(item.createdAt).toLocaleString(), body: item.body, href: item.link }))} empty="No unread institutional alerts."/></section></>}
    {active === "attendance" && <Evidence title="Saved attendance sessions" items={attendance.map(item => ({ title: `${item.classroom} · ${item.batch}`, meta: `${new Date(item.date).toLocaleDateString()} · ${item.total ? `${Math.round(item.present / item.total * 100)}% present` : "No records"}`, body: item.remarks }))} empty="No saved attendance sessions match this view." action={<Link className="text-sm font-semibold text-emerald-700 underline" href="/classrooms">Open attendance workflow</Link>}/>}
    {active === "visitors" && <Evidence title="Visitor register" items={visitors.map(item => ({ title: item.name, meta: `${item.status} · ${new Date(item.visitedAt).toLocaleString()}`, body: [item.purpose, item.phone, item.remarks].filter(Boolean).join(" · ") }))} empty="No visitor entries match this view." action={<Link className="text-sm font-semibold text-emerald-700 underline" href="/reception">Open reception register</Link>}/>}
    {active === "security" && <Evidence title="Security and audit activity" items={data.audits.filter(item => [item.action, item.entity, item.message].join(" ").toLowerCase().includes(q)).map(item => ({ title: `${item.action} · ${item.entity}`, meta: new Date(item.createdAt).toLocaleString(), body: item.message }))} empty="No institution audit events match this view."/>}
    {["transport", "hostel", "library", "maintenance", "inventory", "settings"].includes(active) && <section className="py-8">{unavailable(modules.find(item => item.id === active)?.label ?? "Operations", "This operational domain is not represented in the shared data model yet. CampusX will surface it here when its existing source workflow is connected; no duplicate records or mock metrics are being created.")}</section>}
  </main>;
}

function Evidence({ title, items, empty, action }: { title: string; items: { title: string; meta: string; body?: string | null; href?: string | null }[]; empty: string; action?: React.ReactNode }) {
  return <section className="border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-4"><h2 className="text-lg font-black">{title}</h2>{action}</div>{items.length ? <div className="mt-4 divide-y divide-slate-100">{items.slice(0, 20).map((item, index) => <article className="py-4" key={`${item.title}-${index}`}><div className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 bg-emerald-500"/><div><p className="font-semibold">{item.href ? <Link href={item.href}>{item.title}</Link> : item.title}</p><p className="mt-1 text-xs text-slate-500">{item.meta}</p>{item.body ? <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p> : null}</div></div></article>)}</div> : <div className="mt-5"><EmptyState icon={<AlertTriangle className="h-5 w-5"/>} title="Nothing to show" description={empty}/></div>}</section>;
}
