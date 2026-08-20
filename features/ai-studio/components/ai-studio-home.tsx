"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, Clock, FileText, MessageSquare, Search, Sparkles, Star, WalletCards } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { aiStudioTools, type AIStudioTool } from "@/services/ai-studio-service";
import { GlobalCommandBar } from "@/features/workspace/components/global-command-bar";

type AIStudioHomeProps = {
  name?: string | null;
  credits: { current: number; allocation: number; todayUsage: number; monthlyUsage: number; estimatedRemaining: number };
  usage: { promptTokens: number; completionTokens: number; totalTokens: number; generationCount: number; estimatedCost: number };
  recent: { id: string; title: string; updatedAt: Date }[];
  favoriteCount: number;
};

function groupedTools() {
  return aiStudioTools.reduce<Record<string, AIStudioTool[]>>((groups, tool) => {
    groups[tool.category] = [...(groups[tool.category] ?? []), tool];
    return groups;
  }, {});
}

export function AIStudioHome({ name, credits, usage, recent, favoriteCount }: AIStudioHomeProps) {
  const groups = groupedTools();
  const [search, setSearch] = useState("");
  const visibleGroups = Object.fromEntries(Object.entries(groups).map(([category, tools]) => [
    category,
    tools.filter((tool) => `${tool.title} ${tool.description} ${tool.category}`.toLowerCase().includes(search.toLowerCase()))
  ]).filter(([, tools]) => (tools as AIStudioTool[]).length)) as Record<string, AIStudioTool[]>;

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8">
        <Badge>AI Studio</Badge>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Good Morning {name?.split(" ")[0] ?? "Teacher"}</h1>
            <p className="mt-4 max-w-2xl text-xl leading-9 text-muted-foreground">What would you like to create today?</p>
          </div>
          <Card className="p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Credits</p>
                <p className="mt-1 text-2xl font-semibold">{credits.current}</p>
              </div>
              <WalletCards className="h-6 w-6 text-sky-700" />
            </div>
            <Progress className="mt-5" value={credits.allocation > 0 ? (credits.estimatedRemaining / credits.allocation) * 100 : 0} />
            <p className="mt-2 text-sm text-muted-foreground">{credits.allocation > 0 ? `${credits.estimatedRemaining} estimated credits remaining` : "AI access is not active for this workspace."}</p>
          </Card>
        </div>
      </section>

      <GlobalCommandBar />

      <div className="flex h-14 items-center gap-3 rounded-2xl border border-border bg-surface px-5 shadow-sm">
        <Search className="h-5 w-5 text-muted-foreground" />
        <input aria-label="Search AI Teaching Studio tools" className="min-w-0 flex-1 bg-transparent outline-none" onChange={(event) => setSearch(event.target.value)} placeholder="Search lesson, worksheet, assessment, communication..." type="search" value={search} />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5 shadow-soft"><Clock className="h-5 w-5 text-sky-700" /><p className="mt-4 text-2xl font-semibold">{usage.generationCount}</p><p className="text-sm text-muted-foreground">Generations today</p></Card>
        <Card className="p-5 shadow-soft"><Sparkles className="h-5 w-5 text-sky-700" /><p className="mt-4 text-2xl font-semibold">{usage.totalTokens}</p><p className="text-sm text-muted-foreground">Tokens used</p></Card>
        <Card className="p-5 shadow-soft"><Star className="h-5 w-5 text-sky-700" /><p className="mt-4 text-2xl font-semibold">{favoriteCount}</p><p className="text-sm text-muted-foreground">Favorites</p></Card>
        <Card className="p-5 shadow-soft"><FileText className="h-5 w-5 text-sky-700" /><p className="mt-4 text-2xl font-semibold">${usage.estimatedCost}</p><p className="text-sm text-muted-foreground">Estimated cost</p></Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link className="rounded-2xl border border-border bg-surface p-5 shadow-soft hover:border-sky-200 hover:bg-sky-50" href="/teacher/ai-studio/chat"><MessageSquare className="h-5 w-5 text-sky-700" /><p className="mt-4 font-semibold">AI Chat</p><p className="mt-1 text-sm text-muted-foreground">Ask, prepare, revise, and continue chats.</p></Link>
        <Link className="rounded-2xl border border-border bg-surface p-5 shadow-soft hover:border-sky-200 hover:bg-sky-50" href="/teacher/ai-studio/prompts"><Bookmark className="h-5 w-5 text-sky-700" /><p className="mt-4 font-semibold">Prompt Library</p><p className="mt-1 text-sm text-muted-foreground">Categories, templates, favorites.</p></Link>
        <Link className="rounded-2xl border border-border bg-surface p-5 shadow-soft hover:border-sky-200 hover:bg-sky-50" href="/teacher/ai-studio/history"><Clock className="h-5 w-5 text-sky-700" /><p className="mt-4 font-semibold">AI History</p><p className="mt-1 text-sm text-muted-foreground">Open, duplicate, edit, export.</p></Link>
        <Link className="rounded-2xl border border-border bg-surface p-5 shadow-soft hover:border-sky-200 hover:bg-sky-50" href="/teacher/ai-studio/bookmarks"><Star className="h-5 w-5 text-sky-700" /><p className="mt-4 font-semibold">Favorites</p><p className="mt-1 text-sm text-muted-foreground">Return to saved teaching materials.</p></Link>
      </section>

      <section className="space-y-8">
        {Object.entries(visibleGroups).map(([category, tools]) => (
          <div key={category}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold">{category}</h2>
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {tools.map((tool) => (
                <Link className="group rounded-2xl border border-border bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-primary" href={`/teacher/ai-studio/create/${tool.slug}`} key={tool.slug}>
                  <Sparkles className="h-5 w-5 text-sky-700" />
                  <h3 className="mt-4 text-lg font-semibold">{tool.title}</h3>
                  <p className="mt-2 min-h-16 text-sm leading-6 text-muted-foreground">{tool.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-700">
                    Create
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
      {!Object.keys(visibleGroups).length ? <EmptyState icon={<Search className="h-5 w-5" />} title="No matching tools" description="Try a different tool name or teaching task." /> : null}

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Recent Generations</h2>
        {recent.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{recent.map((item) => <Link className="rounded-2xl border border-border bg-surface p-4 shadow-sm hover:bg-muted" href="/teacher/ai-studio/history" key={item.id}><p className="font-semibold">{item.title}</p><p className="mt-2 text-sm text-muted-foreground">{item.updatedAt.toLocaleDateString()}</p></Link>)}</div> : <EmptyState icon={<Sparkles className="h-5 w-5" />} title="No AI generations yet" description="Choose a creation card above to start your first teacher-ready asset." /> }
      </section>
    </div>
  );
}
