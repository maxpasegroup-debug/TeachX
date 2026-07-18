import { Bookmark, Copy, Edit3, FileText, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ExportToolbar } from "@/features/ai-studio/components/export-toolbar";
import { deleteAIConversationAction, favoriteAIItemAction } from "@/features/ai-studio/actions";

type HistoryItem = {
  id: string;
  title: string;
  updatedAt: Date;
  messages: unknown;
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
  const groups = group(items);

  if (!items.length) {
    return <EmptyState icon={<FileText className="h-5 w-5" />} title="No AI history yet" description="Every generation you create in AI Studio will be stored here." />;
  }

  return (
    <div className="space-y-8">
      {groups.map((entry) => (
        <section key={entry.label}>
          <h2 className="mb-4 text-2xl font-semibold">{entry.label}</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {entry.items.map((item) => {
              const tokens = item.usages.reduce((total, usage) => total + usage.totalTokens, 0);
              const text = JSON.stringify(item.messages, null, 2);

              return (
                <Card className="p-5 shadow-soft" key={item.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{tokens} tokens</p>
                    </div>
                    <FileText className="h-5 w-5 text-sky-700" />
                  </div>
                  <pre className="mt-4 max-h-40 overflow-hidden whitespace-pre-wrap rounded-xl bg-background p-4 text-xs leading-6 text-muted-foreground">{text}</pre>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <form action={favoriteAIItemAction}><input name="entityId" type="hidden" value={item.id} /><input name="title" type="hidden" value={item.title} /><input name="type" type="hidden" value="ai-generation" /><button className="rounded-full border border-border px-3 py-1 text-xs font-medium" type="submit"><Bookmark className="mr-1 inline h-3 w-3" />Bookmark</button></form>
                    <button className="rounded-full border border-border px-3 py-1 text-xs font-medium" type="button"><Copy className="mr-1 inline h-3 w-3" />Duplicate</button>
                    <button className="rounded-full border border-border px-3 py-1 text-xs font-medium" type="button"><Edit3 className="mr-1 inline h-3 w-3" />Edit</button>
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
