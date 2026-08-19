"use client";

import { useEffect, useState } from "react";
import { MailCheck, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Readiness = { ok: boolean; provider?: string; controls: { configured: boolean; domainVerified: boolean; dmarcReady: boolean; transactionalReady: boolean }; evidence: { accepted: number; delivered: number; delayed: number; failed: number } };

export function EmailOperationsPanel() {
  const [data, setData] = useState<Readiness | null>(null);
  const [error, setError] = useState("");
  async function refresh() {
    setError("");
    const response = await fetch("/api/email/readiness", { cache: "no-store" });
    if (!response.ok) return setError("Email readiness is unavailable.");
    setData(await response.json() as Readiness);
  }
  useEffect(() => { void refresh(); }, []);
  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3"><MailCheck className="mt-1 h-5 w-5 text-emerald-700" /><div><h2 className="text-xl font-semibold">Transactional Email</h2><p className="mt-1 text-sm text-muted-foreground" role="status">{error || (data ? `${data.ok ? "Ready" : "Attention required"} - ${data.provider || "provider missing"}` : "Checking delivery controls...")}</p></div></div>
        <Button className="h-10 px-3" onClick={() => void refresh()} title="Refresh email readiness" type="button" variant="secondary"><RefreshCw className="h-4 w-4" /><span className="sr-only">Refresh email readiness</span></Button>
      </div>
      {data ? <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4"><p><b>{data.evidence.delivered}</b><span className="block text-muted-foreground">Delivered 24h</span></p><p><b>{data.evidence.accepted}</b><span className="block text-muted-foreground">Accepted 24h</span></p><p><b>{data.evidence.delayed}</b><span className="block text-muted-foreground">Delayed 24h</span></p><p><b>{data.evidence.failed}</b><span className="block text-muted-foreground">Failed 24h</span></p></div> : null}
    </Card>
  );
}
