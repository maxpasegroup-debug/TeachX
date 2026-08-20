"use client";

import Link from "next/link";
import { Archive, Copy, Download, ExternalLink, FileText, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { deleteLearningResourceAction, duplicateLearningResourceAction, updateResourceStatusAction } from "@/features/learning-marketplace/actions";

export type TeacherResourceRow = {
  id: string;
  title: string;
  status: string;
  type: string;
  category: string;
  subject: string;
  grade: string;
  language: string;
  tags: string[];
  views: number;
  downloads: number;
  updatedAt: string;
  fileUrl: string | null;
  externalUrl: string | null;
};

function Action({ action, resourceId, label, intent, icon }: { action: (data: FormData) => void | Promise<void>; resourceId: string; label: string; intent?: string; icon?: ReactNode }) {
  return <form action={action}><input name="resourceId" type="hidden" value={resourceId} />{intent ? <input name="intent" type="hidden" value={intent} /> : null}<button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm transition hover:bg-sky-50" type="submit">{icon}{label}</button></form>;
}

export function TeacherResourceStudio({ resources, savedResources, downloads }: { resources: TeacherResourceRow[]; savedResources: TeacherResourceRow[]; downloads: TeacherResourceRow[] }) {
  const [tab, setTab] = useState<"mine" | "saved" | "downloads">("mine");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [sort, setSort] = useState("recent");
  const source = tab === "mine" ? resources : tab === "saved" ? savedResources : downloads;
  const types = Array.from(new Set(resources.map((item) => item.type))).sort();
  const visible = useMemo(() => source.filter((item) => {
    const haystack = `${item.title} ${item.category} ${item.subject} ${item.grade} ${item.language} ${item.tags.join(" ")}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (status === "All" || item.status === status) && (type === "All" || item.type === type);
  }).sort((a, b) => sort === "title" ? a.title.localeCompare(b.title) : sort === "views" ? b.views - a.views : sort === "downloads" ? b.downloads - a.downloads : b.updatedAt.localeCompare(a.updatedAt)), [query, sort, source, status, type]);

  return <Card className="p-5 shadow-soft sm:p-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-semibold">Resource library</h2><p className="mt-1 text-sm text-muted-foreground">Created, saved, and downloaded resources stay separate.</p></div><Link className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-sky-50" href="/teacher/workspace/resources">Open teaching resource tools</Link></div>
    <div className="mt-5 flex flex-wrap gap-2">{([ ["mine", "My resources"], ["saved", "Saved resources"], ["downloads", "Downloads"] ] as const).map(([value, label]) => <button className={`min-h-10 rounded-full px-4 text-sm font-medium ${tab === value ? "bg-primary text-primary-foreground" : "border border-border bg-background"}`} key={value} onClick={() => setTab(value)} type="button">{label}</button>)}</div>
    <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_repeat(3,auto)]"><label className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-3"><Search className="h-4 w-4 text-muted-foreground" /><input aria-label="Search resources" className="min-w-0 flex-1 bg-transparent outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="Search title, tag, subject, grade..." type="search" value={query} /></label><select aria-label="Filter resource status" className="rounded-xl border border-border bg-background px-3 text-sm" onChange={(event) => setStatus(event.target.value)} value={status}><option>All</option><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select><select aria-label="Filter resource type" className="rounded-xl border border-border bg-background px-3 text-sm" onChange={(event) => setType(event.target.value)} value={type}><option>All</option>{types.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Sort resources" className="rounded-xl border border-border bg-background px-3 text-sm" onChange={(event) => setSort(event.target.value)} value={sort}><option value="recent">Recently updated</option><option value="title">Title</option><option value="views">Most viewed</option><option value="downloads">Most downloaded</option></select></div>
    <div className="mt-5 space-y-3">{visible.length ? visible.slice(0, 40).map((resource) => <article className="grid gap-4 rounded-2xl border border-border bg-background p-4 lg:grid-cols-[1fr_auto] lg:items-center" key={resource.id}><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{resource.status}</span><span className="text-xs text-muted-foreground">{resource.category || resource.type}</span></div><h3 className="mt-2 font-semibold">{resource.title}</h3><p className="mt-1 text-sm text-muted-foreground">{[resource.subject, resource.grade, resource.language].filter(Boolean).join(" · ") || resource.type} · {resource.views} views · {resource.downloads} downloads</p>{resource.tags.length ? <p className="mt-2 text-xs text-muted-foreground">{resource.tags.map((tag) => `#${tag}`).join(" ")}</p> : null}</div><div className="flex flex-wrap gap-2">{tab === "mine" ? <>{resource.status !== "PUBLISHED" ? <Action action={updateResourceStatusAction} intent="publish" label="Publish" resourceId={resource.id} /> : <Action action={updateResourceStatusAction} intent="archive" label="Archive" resourceId={resource.id} icon={<Archive className="h-4 w-4" />} />}<Action action={duplicateLearningResourceAction} label="Duplicate" resourceId={resource.id} icon={<Copy className="h-4 w-4" />} />{resource.status !== "PUBLISHED" ? <Action action={deleteLearningResourceAction} label="Delete" resourceId={resource.id} icon={<Trash2 className="h-4 w-4" />} /> : <Link className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm hover:bg-sky-50" href="/teacher/business/marketplace">Marketplace</Link>}</> : null}{resource.fileUrl || resource.externalUrl ? <Link className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm hover:bg-sky-50" href={resource.fileUrl ?? resource.externalUrl ?? "#"} target="_blank"><Download className="h-4 w-4" />Open</Link> : null}<Link className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm hover:bg-sky-50" href={resource.status === "PUBLISHED" ? `/resources/${resource.id}` : "/teacher/workspace/resources"}><ExternalLink className="h-4 w-4" />Details</Link></div></article>) : <EmptyState icon={<FileText className="h-5 w-5" />} title={tab === "mine" ? "No resources match" : tab === "saved" ? "No saved resources yet" : "No downloads yet"} description={tab === "mine" ? "Try a different search or create your first resource." : tab === "saved" ? "Save useful published resources to return to them here." : "Resources you download from your workspace appear here."} />}</div>
    {visible.length > 40 ? <p className="mt-4 text-sm text-muted-foreground">Showing the newest 40 matching resources. Refine search or filters to narrow the list.</p> : null}
  </Card>;
}
