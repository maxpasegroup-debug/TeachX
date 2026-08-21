"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { ArrowRight, Bot, CalendarDays, CheckCircle2, Clock3, GraduationCap, History, Loader2, MessageSquareText, RefreshCw, Send, Settings2, ShieldCheck, Sparkles, WalletCards, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { askTaraAction, saveTaraSettingsAction } from "@/features/tara/actions";
import type { getTaraData, TaraContextRole, TaraResultKind } from "@/services/tara-service";

type Data = Awaited<ReturnType<typeof getTaraData>>;
type Reply = { text: string; conversationId: string; role: TaraContextRole; structured: { kind: TaraResultKind; title: string; actions: Array<{ label: string; href: string }> } };
type Failure = { message: string; code?: string; recoveryHref?: string };

const contextRoles: Array<{ label: TaraContextRole; detail: string }> = [
  { label: "AI Co-worker", detail: "Save Time" }, { label: "AI Co-teacher", detail: "Teaching" }, { label: "AI Co-author", detail: "Creation" },
  { label: "Business Partner", detail: "Earn More" }, { label: "Learning Coach", detail: "Learn More" }, { label: "Future Life/Travel Buddy", detail: "Enjoy More" }
];

function firstName(name?: string) { return name?.split(" ").filter(Boolean)[0] ?? "there"; }
function stamp(value: Date) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }

function StructuredText({ text }: { text: string }) {
  const lines = text.split("\n").filter((line, index, all) => line.trim() || (index > 0 && all[index - 1]?.trim()));
  return <div className="space-y-2 text-sm leading-7 text-foreground">{lines.map((line, index) => {
    const clean = line.replace(/^#{1,4}\s*/, "").replace(/^\*\*(.*?)\*\*:?$/, "$1");
    if (/^#{1,4}\s/.test(line) || /^\*\*.*\*\*:?$/.test(line)) return <h3 className="pt-2 font-semibold" key={index}>{clean}</h3>;
    if (/^[-*]\s/.test(line)) return <div className="flex gap-2" key={index}><span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-600" /><p>{line.replace(/^[-*]\s*/, "")}</p></div>;
    if (/^\d+[.)]\s/.test(line)) return <div className="flex gap-2" key={index}><span className="shrink-0 font-semibold text-sky-700">{line.match(/^\d+/)?.[0]}.</span><p>{line.replace(/^\d+[.)]\s*/, "")}</p></div>;
    return <p key={index}>{line}</p>;
  })}</div>;
}

export function TaraWorkspace({ data }: { data: Data }) {
  const teacher = data.context?.teacher;
  const credits = data.context?.credits;
  const teacherMode = data.persona === "Teacher guide";
  const canGenerate = teacherMode ? Boolean(credits?.remaining) : true;
  const suggestions = data.suggestions.length ? data.suggestions : [{ label: "Summarize my priorities", prompt: "Help me understand my current priorities." }, { label: "Plan my next step", prompt: "Help me plan the next useful step in my current workspace." }];
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState<Reply>();
  const [failure, setFailure] = useState<Failure>();
  const [conversationId, setConversationId] = useState<string>();
  const [conversationTitle, setConversationTitle] = useState<string>();
  const [lastPrompt, setLastPrompt] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const resultRef = useRef<HTMLDivElement>(null);

  function submit(request = prompt) {
    const next = request.trim();
    if (!next || pending) return;
    setFailure(undefined); setLastPrompt(next);
    startTransition(async () => {
      const form = new FormData(); form.set("prompt", next); form.set("location", "tara");
      if (conversationId) form.set("conversationId", conversationId);
      const response = await askTaraAction(form);
      if (response.result) {
        setReply(response.result as Reply); setConversationId(response.result.conversationId); setConversationTitle(conversationTitle ?? next.slice(0, 80)); setPrompt("");
        setTimeout(() => resultRef.current?.focus(), 0);
      } else setFailure({ message: response.error ?? "TARA is temporarily unavailable.", code: response.code, recoveryHref: response.recoveryHref });
    });
  }

  function newConversation() { setConversationId(undefined); setConversationTitle(undefined); setReply(undefined); setFailure(undefined); setPrompt(""); }

  return <main className="min-w-0 space-y-6 pb-10">
    <header className="border-b pb-6"><div className="flex flex-wrap items-start justify-between gap-5"><div><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-md bg-sky-700 text-white"><Sparkles className="h-5 w-5" /></span><div><p className="text-sm font-semibold text-sky-700">TARA</p><p className="text-xs text-muted-foreground">The intelligence inside TeachX</p></div></div><h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Your AI partner is here.</h1><p className="mt-2 max-w-2xl text-muted-foreground">Hello, {firstName(teacher?.name)}. Tell TARA what you need to understand, create, plan, or improve.</p></div>{teacherMode ? <div className="min-w-56 border-l-2 border-sky-600 bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">AI access</p><p className="mt-1 font-semibold">{data.context?.subscription?.name ?? "No active plan"}</p><p className="mt-2 text-2xl font-semibold">{credits?.remaining ?? 0}</p><p className="text-xs text-muted-foreground">real credits available</p>{!credits?.remaining ? <Link className="mt-3 inline-flex text-sm font-semibold text-sky-700" href="/teacher/business/subscription">Review subscription <ArrowRight className="ml-1 h-4 w-4" /></Link> : null}</div> : <div className="min-w-56 border-l-2 border-sky-600 bg-surface px-4 py-3"><p className="text-xs text-muted-foreground">Active context</p><p className="mt-1 font-semibold">{data.persona}</p><p className="mt-2 text-sm text-muted-foreground">Existing AI services and permissions apply.</p></div>}</div></header>

    <section aria-label="TARA roles" className="flex gap-2 overflow-x-auto pb-2">{contextRoles.map((item) => <div className="shrink-0 border bg-surface px-3 py-2" key={item.label}><p className="text-xs text-muted-foreground">{item.detail}</p><p className="text-sm font-medium">{item.label}</p></div>)}</section>

    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="min-w-0 space-y-4" aria-label="Conversation with TARA">
        <Card className="overflow-hidden border-sky-100 shadow-soft"><div className="flex flex-wrap items-center justify-between gap-3 border-b bg-surface px-4 py-3"><div className="flex items-center gap-2"><Bot className="h-5 w-5 text-sky-700" /><div><h2 className="font-semibold">{conversationTitle ?? "Conversation"}</h2><p className="text-xs text-muted-foreground">{conversationId ? "Continuing your private conversation" : "Start with a natural request"}</p></div></div>{conversationId ? <Button onClick={newConversation} type="button" variant="secondary"><X className="mr-2 h-4 w-4" />New conversation</Button> : null}</div>
          <div className="min-h-72 p-4 sm:p-6">
            {!reply && !pending && !failure ? <div><p className="font-medium">What would make today easier?</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{suggestions.map((item) => <button className="min-h-12 border px-4 py-3 text-left text-sm font-medium hover:border-sky-300 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-primary" key={item.label} onClick={() => setPrompt(item.prompt)} type="button">{item.label}<ArrowRight className="float-right h-4 w-4" /></button>)}</div></div> : null}
            {pending ? <div aria-live="polite" className="flex min-h-60 flex-col items-center justify-center text-center"><Loader2 className="h-7 w-7 animate-spin text-sky-700 motion-reduce:animate-none" /><p className="mt-4 font-medium">TARA is working with your authorized TeachX context.</p><p className="mt-1 text-sm text-muted-foreground">Your existing records and permissions remain in control.</p></div> : null}
            {failure && !pending ? <div role="alert" className="border-l-4 border-amber-500 bg-amber-50 p-4"><h3 className="font-semibold">TARA could not complete that request</h3><p className="mt-2 text-sm">{failure.message}</p><div className="mt-4 flex flex-wrap gap-2"><Button onClick={() => submit(lastPrompt)} type="button" variant="secondary"><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>{failure.recoveryHref ? <Link className="inline-flex min-h-10 items-center border px-3 text-sm font-medium" href={failure.recoveryHref}>Open recovery option</Link> : null}</div></div> : null}
            {reply && !pending ? <div className="space-y-5" ref={resultRef} tabIndex={-1}><div className="flex flex-wrap items-center gap-2"><Badge>TARA</Badge><span className="text-xs font-medium text-muted-foreground">{reply.role}</span></div><div><h2 className="text-xl font-semibold">{reply.structured.title}</h2><div className="mt-3"><StructuredText text={reply.text} /></div></div>{reply.structured.actions.length ? <div className="border-t pt-4"><p className="text-xs font-semibold uppercase text-muted-foreground">Continue in TeachX</p><div className="mt-3 flex flex-wrap gap-2">{reply.structured.actions.map((action) => <Link className="inline-flex min-h-11 items-center border bg-surface px-4 text-sm font-medium hover:border-sky-300 hover:bg-sky-50" href={action.href} key={action.href}>{action.label}<ArrowRight className="ml-2 h-4 w-4" /></Link>)}</div><p className="mt-3 text-xs text-muted-foreground"><ShieldCheck className="mr-1 inline h-3.5 w-3.5" />Actions open existing authorized workflows. TARA has not changed records automatically.</p></div> : null}</div> : null}
          </div>
          <div className="border-t bg-surface p-3 sm:p-4"><label className="sr-only" htmlFor="tara-prompt">Ask TARA</label><Textarea className="min-h-24 resize-y bg-background text-base" disabled={pending || !canGenerate} id="tara-prompt" maxLength={6000} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) { event.preventDefault(); submit(); } }} placeholder={canGenerate ? "Ask TARA to plan, create, explain, organize, or improve..." : "AI access is unavailable until your subscription or credits are active."} value={prompt} /><div className="mt-3 flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">TARA uses the current conversation and authorized workspace context.</p><Button disabled={pending || !prompt.trim() || !canGenerate} onClick={() => submit()} type="button"><Send className="mr-2 h-4 w-4" />Send</Button></div></div>
        </Card>

        <section><h2 className="text-lg font-semibold">Quick tasks</h2><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[
          ["Create a lesson", "/teacher/ai-studio/create/lesson-generator", GraduationCap], ["Create a worksheet", "/teacher/ai-studio/create/worksheet-generator", MessageSquareText], ["Prepare a quiz", "/teacher/ai-studio/create/quiz-generator", CheckCircle2],
          ["Plan my week", "/teacher/workspace/planner", CalendarDays], ["Improve my profile", "/teacher/business/profile", WalletCards], ["Find something to learn", "/teacher/life/learn-more", Sparkles]
        ].map(([label, href, Icon]) => { const I = Icon as typeof Sparkles; return <Link className="flex min-h-12 items-center gap-3 border bg-surface px-4 text-sm font-medium hover:border-sky-300" href={href as string} key={label as string}><I className="h-4 w-4 text-sky-700" />{label as string}</Link>; })}</div></section>
      </section>

      <aside className="space-y-5">
        <section><div className="flex items-center justify-between"><h2 className="font-semibold">Current context</h2><Clock3 className="h-4 w-4 text-muted-foreground" /></div><div className="mt-3 divide-y border bg-surface">{[
          ["Classes", data.context?.classrooms.length ?? 0], ["Upcoming items", data.context?.planner.length ?? 0], ["Recent resources", data.context?.resources.length ?? 0], ["Published learning", data.context?.learning.availableItems ?? 0]
        ].map(([label, value]) => <div className="flex min-h-11 items-center justify-between px-3 text-sm" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><p className="mt-2 text-xs text-muted-foreground">Only records authorized for your current teacher workspace are summarized.</p></section>

        <section><div className="flex items-center justify-between"><h2 className="font-semibold">Recent conversations</h2><History className="h-4 w-4 text-muted-foreground" /></div>{data.conversations.length ? <div className="mt-3 divide-y border bg-surface">{data.conversations.slice(0, 6).map((item) => <button className="block w-full px-3 py-3 text-left hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary" key={item.id} onClick={() => { setConversationId(item.id); setConversationTitle(item.title); setReply(undefined); setFailure(undefined); }} type="button"><span className="block truncate text-sm font-medium">{item.title}</span><span className="mt-1 block text-xs text-muted-foreground">{stamp(item.updatedAt)}</span></button>)}</div> : <div className="mt-3"><EmptyState icon={<History className="h-5 w-5" />} title="No conversations yet" description="Your TARA conversations will appear here." /></div>}</section>

        <section><Button className="w-full" onClick={() => setSettingsOpen((open) => !open)} type="button" variant="secondary"><Settings2 className="mr-2 h-4 w-4" />TARA preferences</Button>{settingsOpen ? <Settings data={data} /> : null}</section>
      </aside>
    </div>

    <section><h2 className="text-lg font-semibold">Connected TeachX workflows</h2><div className="mt-3 grid gap-3 md:grid-cols-3">{data.handoffs.map((item) => <Link className="border bg-surface p-4 hover:border-sky-300" href={item.href} key={item.title}><h3 className="font-medium">{item.title}</h3><p className="mt-2 text-sm text-muted-foreground">{item.detail}</p><span className="mt-3 inline-flex text-sm font-semibold text-sky-700">Open <ArrowRight className="ml-1 h-4 w-4" /></span></Link>)}</div></section>
  </main>;
}

function Settings({ data }: { data: Data }) {
  const setting = data.setting;
  return <form action={saveTaraSettingsAction} className="mt-3 space-y-3 border bg-surface p-4"><Preference label="Response style"><Select name="personality" defaultValue={setting?.personality ?? "calm"}><option value="calm">Calm and direct</option><option value="supportive">Supportive coach</option><option value="executive">Concise</option></Select></Preference><Preference label="Language"><Select name="language" defaultValue={setting?.language ?? "English"}><option>English</option><option>Hindi</option><option>Marathi</option><option>Tamil</option></Select></Preference><Preference label="Conversation continuity"><Select name="memory" defaultValue={setting?.memory ?? "metadata"}><option value="metadata">Current conversation</option><option value="minimal">Minimal</option><option value="off">Off</option></Select></Preference><input name="notifications" type="hidden" value={setting?.notifications ?? "priority"} /><Button className="w-full" type="submit">Save preferences</Button><p className="text-xs text-muted-foreground">TARA does not expose internal context or store a separate memory database.</p></form>;
}

function Preference({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-medium">{label}<span className="mt-1 block">{children}</span></label>; }
