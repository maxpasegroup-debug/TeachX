"use client";

import Link from "next/link";
import { Clock, Search, Star } from "lucide-react";
import { useState } from "react";
import type { PromptTemplate } from "@prisma/client";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { favoriteAIItemAction } from "@/features/ai-studio/actions";

export function PromptLibraryPage({ templates }: { templates: PromptTemplate[] }) {
  const [query, setQuery] = useState("");
  const filtered = templates.filter((template) => `${template.name} ${template.key} ${template.userPrompt}`.toLowerCase().includes(query.toLowerCase()));

  return <div className="space-y-8">
    <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8">
      <h1 className="text-4xl font-semibold tracking-tight">Prompt Library</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Browse the shared prompt library available to your workspace, then send a prompt directly to TeachX AI.</p>
      <div className="mt-6 flex h-12 max-w-xl items-center gap-3 rounded-xl border border-border bg-surface px-4"><Search className="h-4 w-4 text-muted-foreground" /><input aria-label="Search prompts" className="min-w-0 flex-1 bg-transparent outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="Search prompts" type="search" value={query} /></div>
    </section>
    {templates.length && !filtered.length ? <EmptyState icon={<Search className="h-5 w-5" />} title="No matching prompts" description="Try a topic, tool, or prompt name." /> : null}
    {filtered.length ? <section className="grid gap-4 lg:grid-cols-2">{filtered.map((template) => <Card className="p-5 shadow-soft" key={template.id}>
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase text-sky-700">{template.institutionId ? "Institution template" : "Global template"}</p><h2 className="mt-2 text-xl font-semibold">{template.name}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{template.key}</p></div><Star className="h-5 w-5 text-sky-700" /></div>
      <pre className="mt-4 max-h-32 overflow-auto whitespace-pre-wrap rounded-xl bg-background p-4 text-xs leading-6 text-muted-foreground">{template.userPrompt}</pre>
      <div className="mt-4 flex flex-wrap gap-2"><Link className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground" href={`/teacher/ai-studio/chat?prompt=${encodeURIComponent(template.userPrompt)}`}>Use prompt</Link><form action={favoriteAIItemAction}><input name="entityId" type="hidden" value={template.id} /><input name="title" type="hidden" value={template.name} /><input name="type" type="hidden" value="prompt" /><button className="rounded-full border border-border px-3 py-1 text-xs font-medium" type="submit"><Star className="mr-1 inline h-3 w-3" />Favorite</button></form></div>
    </Card>)}</section> : !templates.length ? <EmptyState icon={<Clock className="h-5 w-5" />} title="No prompt templates yet" description="Workspace-approved prompt templates will appear here when they are available." /> : null}
  </div>;
}
