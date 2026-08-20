"use client";

import { MessageSquare, Pin, Search, Send, Trash2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ExportToolbar } from "@/features/ai-studio/components/export-toolbar";
import { deleteAIConversationAction, favoriteAIItemAction, generateTeacherAIChat, renameAIConversationAction, type AIStudioGenerationState } from "@/features/ai-studio/actions";

type Chat = { id: string; title: string; updatedAt: Date; messages: unknown };
const initialState: AIStudioGenerationState = {};

function messageText(messages: unknown) {
  if (!Array.isArray(messages)) return "";
  return messages.map((message) => {
    if (!message || typeof message !== "object") return "";
    const item = message as { role?: string; content?: string };
    return `${item.role === "user" ? "Teacher" : "TeachX AI"}: ${item.content ?? ""}`;
  }).filter(Boolean).join("\n\n");
}

export function AIChatPage({ chats, initialPrompt }: { chats: Chat[]; initialPrompt?: string }) {
  const [state, action, pending] = useActionState(generateTeacherAIChat, initialState);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(chats[0]?.id ?? "");
  const [question, setQuestion] = useState(initialPrompt ?? "");
  const [answer, setAnswer] = useState("");
  const visibleChats = chats.filter((chat) => `${chat.title} ${messageText(chat.messages)}`.toLowerCase().includes(query.toLowerCase()));
  const selected = chats.find((chat) => chat.id === selectedId) ?? chats[0];

  useEffect(() => {
    if (state.text) setAnswer(state.text);
    if (state.conversationId) setSelectedId(state.conversationId);
  }, [state.conversationId, state.text]);

  return <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
    <Card className="max-h-[calc(100vh-9rem)] overflow-y-auto p-4 shadow-soft">
      <div className="flex h-12 items-center gap-3 rounded-xl border border-border bg-background px-4"><Search className="h-4 w-4 text-muted-foreground" /><input aria-label="Search chats" className="min-w-0 flex-1 bg-transparent outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="Search chats" type="search" value={query} /></div>
      <div className="mt-4 space-y-3">
        {visibleChats.length ? visibleChats.map((chat) => <article className={`rounded-2xl border p-3 ${selected?.id === chat.id ? "border-sky-300 bg-sky-50" : "border-border bg-background"}`} key={chat.id}>
          <button className="w-full text-left" onClick={() => { setSelectedId(chat.id); setAnswer(""); }} type="button"><p className="font-semibold">{chat.title}</p><p className="mt-1 text-xs text-muted-foreground">{chat.updatedAt.toLocaleString()}</p></button>
          <div className="mt-3 flex flex-wrap gap-2"><form action={favoriteAIItemAction}><input name="entityId" type="hidden" value={chat.id} /><input name="title" type="hidden" value={chat.title} /><input name="type" type="hidden" value="pinned-chat" /><button className="rounded-full border border-border px-3 py-1 text-xs" type="submit"><Pin className="mr-1 inline h-3 w-3" />Pin</button></form><form action={deleteAIConversationAction}><input name="conversationId" type="hidden" value={chat.id} /><button className="rounded-full border border-border px-3 py-1 text-xs text-red-600" type="submit"><Trash2 className="mr-1 inline h-3 w-3" />Delete</button></form></div>
        </article>) : <EmptyState icon={<MessageSquare className="h-5 w-5" />} title={chats.length ? "No matching chats" : "No chats yet"} description={chats.length ? "Try another phrase." : "Ask TeachX AI to prepare tomorrow's lesson, generate homework, or create a report."} />}
      </div>
    </Card>
    <Card className="p-5 shadow-soft sm:p-6">
      <h1 className="text-3xl font-semibold">Teacher AI Assistant</h1><p className="mt-3 text-muted-foreground">Ask for a lesson plan, homework, an activity, an explanation, or a parent message. Your available AI credits and permissions still apply.</p>
      <div aria-live="polite" className="mt-6 min-h-72 rounded-2xl border border-border bg-background p-5">{pending ? <p className="text-sm text-muted-foreground">Preparing a classroom-ready response...</p> : answer ? <pre className="whitespace-pre-wrap font-sans text-sm leading-7">{answer}</pre> : selected ? <pre className="whitespace-pre-wrap font-sans text-sm leading-7">{messageText(selected.messages)}</pre> : <p className="text-muted-foreground">Start a conversation below. Your new response will also appear in AI History.</p>}</div>
      {state.error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{state.error}</p> : null}
      {selected ? <form action={renameAIConversationAction} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]"><input name="conversationId" type="hidden" value={selected.id} /><Input name="title" placeholder="Rename selected chat" /><Button type="submit" variant="secondary">Rename</Button></form> : null}
      <form action={action} className="mt-5 space-y-3"><Textarea aria-label="Ask TeachX AI" className="min-h-28" name="question" onChange={(event) => setQuestion(event.target.value)} placeholder="For example: Plan tomorrow's science lesson for Class 7." required value={question} /><Button disabled={pending} type="submit"><Send className="mr-2 h-4 w-4" />{pending ? "Thinking..." : "Ask TeachX AI"}</Button></form>
      <div className="mt-5"><ExportToolbar text={answer || (selected ? messageText(selected.messages) : "")} /></div>
    </Card>
  </div>;
}
