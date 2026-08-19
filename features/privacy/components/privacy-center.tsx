"use client";

import { useState } from "react";
import { Download, FileCheck2, Send, ShieldCheck, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type RequestItem = { id: string; type: string; status: string; details: string | null; dueAt: string; createdAt: string; events: { id: string; status: string; note: string; createdAt: string }[] };
type Consent = { id: string; category: string; granted: boolean; policyVersion: string; createdAt: string };
type Props = { data: { config: { policyVersion: string; requestSlaDays: number }; consents: Consent[]; requests: RequestItem[] } };
const terminal = ["FULFILLED", "REJECTED", "CANCELLED"];

async function send(body: unknown) {
  const response = await fetch("/api/privacy/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Request could not be submitted");
}

export function PrivacyCenter({ data }: Props) {
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  const run = async (work: () => Promise<unknown>) => { setBusy(true); setError(""); setMessage(""); try { await work(); setMessage("Privacy request recorded."); window.location.reload(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Request failed"); setBusy(false); } };
  return <main className="space-y-8 pb-12">
    <header className="border-b border-border pb-7"><div className="flex items-center gap-3"><Badge>Privacy Center</Badge><span className="text-sm text-muted-foreground">Policy {data.config.policyVersion}</span></div><h1 className="mt-5 text-3xl font-semibold">Your data, with real controls</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Download a safe account snapshot, make a formal privacy request, and follow its progress. Requests are normally completed within {data.config.requestSlaDays} days.</p></header>
    {error ? <p className="border-y border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">{error}</p> : null}{message ? <p className="border-y border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">{message}</p> : null}
    <section className="grid gap-6 lg:grid-cols-2"><div className="border-t border-border pt-5"><FileCheck2 className="h-6 w-6 text-primary" /><h2 className="mt-3 text-lg font-semibold">Portable account snapshot</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">JSON containing your account, preferences, consent history, request history, created-content index, and order index. Passwords, sessions, tokens, and provider payloads are excluded.</p><a className="mt-4 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground" href="/api/privacy/export"><Download className="mr-2 h-4 w-4" />Download snapshot</a></div>
    <form className="space-y-3 border-t border-border pt-5" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); void run(() => send({ type: form.get("type"), details: form.get("details") || undefined })); }}><ShieldCheck className="h-6 w-6 text-primary" /><h2 className="text-lg font-semibold">Submit a rights request</h2><Select name="type" defaultValue="ACCESS"><option value="ACCESS">Access my data</option><option value="EXPORT">Complete data export</option><option value="CORRECTION">Correct my data</option><option value="DELETION">Delete my account data</option><option value="RESTRICTION">Restrict processing</option><option value="OBJECTION">Object to processing</option></Select><Textarea name="details" maxLength={2000} placeholder="Explain the scope or correction needed. Do not include passwords or identity documents here." /><Button disabled={busy} type="submit"><Send className="mr-2 h-4 w-4" />Submit request</Button></form></section>
    <section className="border-t border-border pt-6"><h2 className="text-lg font-semibold">Latest recorded choices</h2><div className="mt-4 grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-4">{data.consents.length ? data.consents.map((consent) => <div className="bg-background p-4" key={consent.id}><p className="text-sm font-medium capitalize">{consent.category.toLowerCase().replaceAll("_", " ")}</p><p className={consent.granted ? "mt-2 text-sm text-emerald-700" : "mt-2 text-sm text-muted-foreground"}>{consent.granted ? "Allowed" : "Not allowed"}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(consent.createdAt).toLocaleDateString()}</p></div>) : <p className="col-span-full bg-background p-5 text-sm text-muted-foreground">No signed-in privacy choices recorded yet. Cookie choices made before sign-in remain linked to the anonymous browser subject.</p>}</div></section>
    <section className="border-t border-border pt-6"><h2 className="text-lg font-semibold">Request history</h2><div className="mt-4 divide-y divide-border border-y border-border">{data.requests.length ? data.requests.map((request) => <article className="py-5" key={request.id}><div className="flex flex-wrap items-center justify-between gap-3"><div><strong className="capitalize">{request.type.toLowerCase()} request</strong><p className="mt-1 text-xs text-muted-foreground">Submitted {new Date(request.createdAt).toLocaleString()} · due {new Date(request.dueAt).toLocaleDateString()}</p></div><Badge>{request.status.toLowerCase().replaceAll("_", " ")}</Badge></div>{request.events[0] ? <p className="mt-3 text-sm text-muted-foreground">Latest: {request.events[0].note}</p> : null}{!terminal.includes(request.status) ? <Button className="mt-3" disabled={busy} variant="secondary" onClick={() => void run(async () => { const response = await fetch(`/api/privacy/requests?id=${request.id}`, { method: "DELETE" }); if (!response.ok) throw new Error((await response.json()).error); })}><X className="mr-2 h-4 w-4" />Cancel request</Button> : null}</article>) : <p className="py-7 text-sm text-muted-foreground">No privacy requests yet.</p>}</div></section>
  </main>;
}
