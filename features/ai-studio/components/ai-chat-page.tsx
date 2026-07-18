import { MessageSquare, Pin, Search, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ExportToolbar } from "@/features/ai-studio/components/export-toolbar";
import { deleteAIConversationAction, favoriteAIItemAction, renameAIConversationAction } from "@/features/ai-studio/actions";

type Chat = {
  id: string;
  title: string;
  updatedAt: Date;
  messages: unknown;
};

export function AIChatPage({ chats }: { chats: Chat[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
      <Card className="p-4 shadow-soft">
        <div className="flex h-12 items-center gap-3 rounded-xl border border-border bg-background px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Search chats" aria-label="Search chats" />
        </div>
        <div className="mt-4 space-y-3">
          {chats.length ? chats.map((chat) => (
            <article className="rounded-2xl border border-border bg-background p-3" key={chat.id}>
              <p className="font-semibold">{chat.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{chat.updatedAt.toLocaleString()}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <form action={favoriteAIItemAction}><input name="entityId" type="hidden" value={chat.id} /><input name="title" type="hidden" value={chat.title} /><input name="type" type="hidden" value="pinned-chat" /><button className="rounded-full border border-border px-3 py-1 text-xs" type="submit"><Pin className="mr-1 inline h-3 w-3" />Pin</button></form>
                <form action={deleteAIConversationAction}><input name="conversationId" type="hidden" value={chat.id} /><button className="rounded-full border border-border px-3 py-1 text-xs text-red-600" type="submit"><Trash2 className="mr-1 inline h-3 w-3" />Delete</button></form>
              </div>
            </article>
          )) : <EmptyState icon={<MessageSquare className="h-5 w-5" />} title="No chats yet" description="Ask TeachX AI to prepare tomorrow's lesson, generate homework, or create a report." />}
        </div>
      </Card>

      <Card className="p-5 shadow-soft">
        <h1 className="text-3xl font-semibold">Teacher AI Assistant</h1>
        <p className="mt-3 text-muted-foreground">Try: Prepare tomorrow's lesson. Generate worksheet. Create homework. Prepare report.</p>
        <div className="mt-6 rounded-2xl border border-border bg-background p-5">
          {chats[0] ? <pre className="whitespace-pre-wrap text-sm leading-7">{JSON.stringify(chats[0].messages, null, 2)}</pre> : <p className="text-muted-foreground">Conversation history will appear here.</p>}
        </div>
        <form action={renameAIConversationAction} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input name="conversationId" type="hidden" value={chats[0]?.id ?? ""} />
          <Input name="title" placeholder="Rename selected chat" />
          <button className="rounded-xl bg-primary px-5 font-medium text-primary-foreground" type="submit">Rename</button>
        </form>
        <Textarea className="mt-5" placeholder="Ask TeachX AI..." />
        <div className="mt-5"><ExportToolbar text={chats[0] ? JSON.stringify(chats[0].messages, null, 2) : ""} /></div>
      </Card>
    </div>
  );
}
