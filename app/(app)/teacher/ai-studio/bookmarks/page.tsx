import Link from "next/link";
import { Bookmark, Trash2 } from "lucide-react";

import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getUserPreferences } from "@/services/preference-service";
import { unfavoriteAIItemAction } from "@/features/ai-studio/actions";

export default async function AIStudioBookmarksPage() {
  const session = await auth();
  const preferences = await getUserPreferences(session?.user.id);
  const items = preferences.favoriteItems.filter((item) => item.type.includes("ai") || item.type === "prompt" || item.type.includes("chat"));

  return items.length ? (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => <Card className="p-5 shadow-soft" key={item.id}><Bookmark className="h-5 w-5 text-sky-700" /><h1 className="mt-4 text-xl font-semibold">{item.title}</h1><p className="mt-2 text-sm text-muted-foreground">{item.type}</p><div className="mt-4 flex gap-2">{item.link ? <Link className="rounded-full border border-border px-3 py-1 text-xs font-medium" href={item.link}>Open</Link> : null}<form action={unfavoriteAIItemAction}><input name="entityId" type="hidden" value={item.entityId} /><input name="type" type="hidden" value={item.type} /><button className="rounded-full border border-border px-3 py-1 text-xs font-medium text-red-600" type="submit"><Trash2 className="mr-1 inline h-3 w-3" />Remove</button></form></div></Card>)}
    </div>
  ) : (
    <EmptyState icon={<Bookmark className="h-5 w-5" />} title="No AI bookmarks yet" description="Bookmark generations, prompts, and chats for quick access." />
  );
}
