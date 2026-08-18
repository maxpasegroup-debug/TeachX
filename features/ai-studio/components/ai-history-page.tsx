"use client";

import { Bookmark, Copy, Edit3, FileText, History, Trash2 } from "lucide-react";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ExportToolbar } from "@/features/ai-studio/components/export-toolbar";
import { deleteAIConversationAction, duplicateAIConversationAction, favoriteAIItemAction, saveAIConversationContentAction } from "@/features/ai-studio/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type HistoryItem = {
  id: string;
  title: string;
  updatedAt: Date;
  messages: unknown;
  context?: unknown;
  usages: { totalTokens: number; promptTokens: number; completionTokens: number; costEstimate: unknown }[];
};

function group(items: HistoryItem[]) {
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = yesterday.toDateString();
  return [
    { label: "Today", items: items.filter((item) => item.updatedAt.toDateString() === today) },
    { label: "Yesterday", items: items.filter((item) => item.updatedAt.toDateString() === yesterdayKey) },
    { label: "Earlier", items: items.filter((item) => ![today, yesterdayKey].includes(item.updatedAt.toDateString())) }
  ].filter((entry) => entry.items.length);
}

export function AIHistoryPage({ items }: { items: HistoryItem[] }) {
  const [query, setQuery] = useState("");
  const filtered = items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()) || JSON.stringify(item.messages).toLowerCase().includes(query.toLowerCase()));
  const groups = group(filtered);

  if (!items.length) {
    return <EmptyState icon={<FileText className="h-5 w-5" />} title="No AI history yet" description="Every generation you create in AI Studio will be stored here." />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Recent History</h1>
        <p className="mt-2 text-muted-foreground">Search, edit, duplicate, favorite, export, or delete any Studio generation.</p>
        <Input className="mt-5 max-w-xl" onChange={(event) => setQuery(event.target.value)} placeholder="Search generated materials..." type="search" value={query} />
      </div>
      {!filtered.length ? <EmptyState icon={<FileText className="h-5 w-5" />} title="No matching generations" description="Try another title, topic, or phrase." /> : null}
      {groups.map((entry) => (
        <section key={entry.label}>
          <h2 className="mb-4 text-2xl font-semibold">{entry.label}</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {entry.items.map((item) => {
              const tokens = item.usages.reduce((total, usage) => total + usage.totalTokens, 0);
              const messages = Array.isArray(item.messages) ? item.messages : [];
              const assistant = [...messages].reverse().find((message) => message && typeof message === "object" && (message as { role?: string }).role === "assistant") as { content?: string } | undefined;
              const text = assistant?.content ?? JSON.stringify(item.messages, null, 2);
              const version = item.context && typeof item.context === "object" && !Array.isArray(item.context) ? Number((item.context as { version?: number }).version ?? 1) : 1;
              const versions = item.context && typeof item.context === "object" && !Array.isArray(item.context) && Array.isArray((item.context as { versions?: unknown[] }).versions)
                ? (item.context as { versions: { version?: number; content?: string; savedAt?: string }[] }).versions
                : [];

              return (
                <Card className="p-5 shadow-soft" key={item.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Version {version} - {tokens} tokens - {item.updatedAt.toLocaleString()}</p>
                    </div>
                    <FileText className="h-5 w-5 text-sky-700" />
                  </div>
                  <details className="mt-4 rounded-xl border border-border bg-background p-4">
                    <summary className="cursor-pointer text-sm font-medium"><Edit3 className="mr-2 inline h-4 w-4" />Open and edit</summary>
                    <form action={saveAIConversationContentAction} className="mt-4">
                      <input name="conversationId" type="hidden" value={item.id} />
                      <Textarea className="min-h-72 font-mono text-sm" defaultValue={text} name="content" required />
                      <button className="mt-3 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" type="submit">Save new version</button>
                    </form>
                  </details>
                  {versions.length ? (
                    <details className="mt-3 rounded-xl border border-border bg-background p-4">
                      <summary className="cursor-pointer text-sm font-medium"><History className="mr-2 inline h-4 w-4" />Version history ({versions.length})</summary>
                      <div className="mt-3 space-y-3">
                        {versions.map((entry, index) => <div className="rounded-lg bg-surface p-3" key={`${entry.version}-${index}`}><p className="text-xs font-semibold">Version {entry.version} - {entry.savedAt ? new Date(entry.savedAt).toLocaleString() : "Earlier save"}</p><pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">{entry.content}</pre></div>)}
                      </div>
                    </details>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <form action={favoriteAIItemAction}><input name="entityId" type="hidden" value={item.id} /><input name="title" type="hidden" value={item.title} /><input name="type" type="hidden" value="ai-generation" /><button className="rounded-full border border-border px-3 py-1 text-xs font-medium" type="submit"><Bookmark className="mr-1 inline h-3 w-3" />Bookmark</button></form>
                    <form action={duplicateAIConversationAction}><input name="conversationId" type="hidden" value={item.id} /><button className="rounded-full border border-border px-3 py-1 text-xs font-medium" type="submit"><Copy className="mr-1 inline h-3 w-3" />Duplicate</button></form>
                    <form action={deleteAIConversationAction}><input name="conversationId" type="hidden" value={item.id} /><button className="rounded-full border border-border px-3 py-1 text-xs font-medium text-red-600" type="submit"><Trash2 className="mr-1 inline h-3 w-3" />Delete</button></form>
                  </div>
                  <div className="mt-4"><ExportToolbar text={text} /></div>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
