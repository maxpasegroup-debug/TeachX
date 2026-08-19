"use client";

import { useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock3, Radio, Send, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Update = { id: string; status: string; internalNote: string; publicMessage: string | null; createdAt: string };
type Incident = { id: string; title: string; summary: string; severity: string; status: string; affectedComponents: string[]; publicVisible: boolean; isDrill: boolean; commanderId: string; startedAt: string; resolvedAt: string | null; updates: Update[] };
type Props = {
  data: {
    config: { live: boolean; emergencyWriteFreeze: boolean; controls: Record<string, boolean>; ownership: Record<string, boolean>; evidence: Record<string, number | null>; budgets: Record<string, number> };
    incidents: Incident[];
    control: { maintenanceEnabled: boolean; maintenanceMessage: string | null; maintenanceStartsAt: string | null; maintenanceEndsAt: string | null } | null;
    components: readonly string[];
  };
};

const nextStatus: Record<string, string[]> = { INVESTIGATING: ["IDENTIFIED", "MONITORING", "RESOLVED"], IDENTIFIED: ["MONITORING", "RESOLVED"], MONITORING: ["RESOLVED"], RESOLVED: [] };
const stamp = (value: string) => new Date(value).toLocaleString();

async function send(url: string, method: string, body: unknown) {
  const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Operation failed");
  return result;
}

export function IncidentCommandCenter({ data }: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedIncident, setSelectedIncident] = useState(data.incidents.find((incident) => incident.status !== "RESOLVED")?.id ?? "");
  const selected = data.incidents.find((incident) => incident.id === selectedIncident);

  const run = async (work: () => Promise<unknown>) => {
    setBusy(true); setMessage("");
    try { await work(); window.location.reload(); } catch (error) { setMessage(error instanceof Error ? error.message : "Operation failed"); setBusy(false); }
  };

  return (
    <main className="space-y-7 pb-12">
      <header className="border-b border-border pb-7">
        <div className="flex flex-wrap items-center gap-3"><Badge>Phase 20</Badge><span className="text-sm text-muted-foreground">Production operations</span></div>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-5">
          <div><h1 className="text-3xl font-semibold">Incident command</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Open, coordinate, communicate, and resolve production incidents from one governed record.</p></div>
          <div className={data.config.live ? "flex items-center gap-2 text-sm font-semibold text-emerald-700" : "flex items-center gap-2 text-sm font-semibold text-amber-700"}>{data.config.live ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}{data.config.live ? "Operations evidence current" : "Railway evidence required"}</div>
        </div>
      </header>

      {data.config.emergencyWriteFreeze ? <div className="border-y border-red-300 bg-red-50 px-4 py-4 text-sm font-semibold text-red-900">Emergency write freeze is active. Webhooks and health endpoints remain available.</div> : null}
      {message ? <div role="alert" className="border-y border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">{message}</div> : null}

      <section>
        <h2 className="text-lg font-semibold">Response readiness</h2>
        <div className="mt-4 grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 xl:grid-cols-4">
          {Object.entries({ ...data.config.controls, ...data.config.ownership }).map(([name, ready]) => <div className="bg-background p-4" key={name}><p className="text-sm font-medium capitalize">{name.replace(/([A-Z])/g, " $1")}</p><p className={ready ? "mt-2 text-sm text-emerald-700" : "mt-2 text-sm text-amber-700"}>{ready ? "Ready" : "Needs Railway configuration"}</p></div>)}
        </div>
      </section>

      <section className="grid gap-7 xl:grid-cols-2">
        <form className="space-y-4 border-t border-border pt-5" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); void run(() => send("/api/operations/incidents", "POST", { title: form.get("title"), summary: form.get("summary"), severity: form.get("severity"), commanderId: form.get("commanderId"), affectedComponents: form.getAll("components"), publicVisible: form.get("publicVisible") === "on", isDrill: form.get("isDrill") === "on", publicMessage: form.get("publicMessage") || undefined })); }}>
          <div><h2 className="text-lg font-semibold">Open an incident</h2><p className="mt-1 text-sm text-muted-foreground">Acknowledgement begins immediately when this record is created.</p></div>
          <div className="grid gap-3 sm:grid-cols-2"><Input name="title" required minLength={5} placeholder="Short incident title" /><Select name="severity" defaultValue="SEV2"><option value="SEV1">SEV1 · Major outage</option><option value="SEV2">SEV2 · Degraded service</option><option value="SEV3">SEV3 · Limited impact</option></Select></div>
          <Input name="commanderId" required placeholder="Incident commander name or ID" />
          <Textarea name="summary" required minLength={10} placeholder="Internal incident summary" />
          <Textarea name="publicMessage" required minLength={10} placeholder="Privacy-safe public update" />
          <fieldset><legend className="text-sm font-medium">Affected components</legend><div className="mt-2 grid grid-cols-2 gap-2">{data.components.map((component) => <label className="flex items-center gap-2 text-sm" key={component}><input type="checkbox" name="components" value={component} />{component}</label>)}</div></fieldset>
          <div className="flex flex-wrap gap-5"><label className="flex items-center gap-2 text-sm"><input defaultChecked type="checkbox" name="publicVisible" />Public incident</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isDrill" />This is a drill</label></div>
          <Button disabled={busy} type="submit"><Radio className="mr-2 h-4 w-4" />Open incident</Button>
        </form>

        <form className="space-y-4 border-t border-border pt-5" onSubmit={(event) => { event.preventDefault(); if (!selected) return; const form = new FormData(event.currentTarget); void run(() => send(`/api/operations/incidents/${selected.id}`, "PATCH", { status: form.get("status"), internalNote: form.get("internalNote"), publicMessage: form.get("publicMessage") })); }}>
          <div><h2 className="text-lg font-semibold">Publish an update</h2><p className="mt-1 text-sm text-muted-foreground">Incident states move forward only. Every change is append-only and audited.</p></div>
          <Select value={selectedIncident} onChange={(event) => setSelectedIncident(event.target.value)}><option value="">Select an active incident</option>{data.incidents.filter((incident) => incident.status !== "RESOLVED").map((incident) => <option key={incident.id} value={incident.id}>{incident.severity} · {incident.title}</option>)}</Select>
          {selected ? <><Select name="status" defaultValue={nextStatus[selected.status]?.[0]}>{nextStatus[selected.status]?.map((status) => <option key={status} value={status}>{status.toLowerCase()}</option>)}</Select><Textarea name="internalNote" required minLength={5} placeholder="Internal response note" /><Textarea name="publicMessage" required={selected.publicVisible} minLength={10} placeholder="Privacy-safe public update" /><Button disabled={busy || !nextStatus[selected.status]?.length} type="submit"><Send className="mr-2 h-4 w-4" />Publish update</Button></> : <p className="py-8 text-center text-sm text-muted-foreground">No active incident selected.</p>}
        </form>
      </section>

      <section className="border-t border-border pt-6">
        <h2 className="text-lg font-semibold">Maintenance notice</h2>
        <form className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); void run(() => send("/api/operations/maintenance", "PUT", { enabled: true, message: form.get("message"), startsAt: form.get("startsAt") ? new Date(String(form.get("startsAt"))).toISOString() : null, endsAt: form.get("endsAt") ? new Date(String(form.get("endsAt"))).toISOString() : null })); }}><Input name="message" defaultValue={data.control?.maintenanceMessage ?? ""} required placeholder="Public maintenance message" /><Input name="startsAt" type="datetime-local" /><Input name="endsAt" type="datetime-local" /><Button disabled={busy} type="submit"><Wrench className="mr-2 h-4 w-4" />Schedule</Button></form>
        {data.control?.maintenanceEnabled ? <Button className="mt-3" variant="secondary" disabled={busy} onClick={() => void run(() => send("/api/operations/maintenance", "PUT", { enabled: false }))}><CheckCircle2 className="mr-2 h-4 w-4" />End maintenance</Button> : null}
      </section>

      <section className="border-t border-border pt-6"><h2 className="text-lg font-semibold">Incident timeline</h2><div className="mt-4 divide-y divide-border border-y border-border">{data.incidents.length ? data.incidents.map((incident) => <article className="py-5" key={incident.id}><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><Badge>{incident.severity}</Badge><h3 className="font-semibold">{incident.title}</h3>{incident.isDrill ? <Badge>Drill</Badge> : null}</div><span className="text-sm font-medium capitalize">{incident.status.toLowerCase()}</span></div><p className="mt-2 text-sm text-muted-foreground">Commander {incident.commanderId} · {stamp(incident.startedAt)} · {incident.affectedComponents.join(", ")}</p><details className="mt-3"><summary className="cursor-pointer text-sm font-medium">{incident.updates.length} timeline update(s)</summary><ol className="mt-3 space-y-3">{incident.updates.map((update) => <li className="border-l-2 border-border pl-4 text-sm" key={update.id}><div className="flex items-center gap-2"><Clock3 className="h-4 w-4" /><strong>{update.status.toLowerCase()}</strong><span className="text-muted-foreground">{stamp(update.createdAt)}</span></div><p className="mt-1 text-muted-foreground">{update.internalNote}</p>{update.publicMessage ? <p className="mt-1"><Activity className="mr-1 inline h-4 w-4" />Public: {update.publicMessage}</p> : null}</li>)}</ol></details></article>) : <p className="py-8 text-center text-sm text-muted-foreground">No incidents recorded.</p>}</div></section>
    </main>
  );
}
