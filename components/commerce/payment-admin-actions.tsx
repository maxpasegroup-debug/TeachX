"use client";

import { useEffect, useState } from "react";
import { RefreshCw, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type Readiness = {
  ok: boolean;
  providers: { stripe: boolean; razorpay: boolean };
  controls: { tax: boolean; refunds: boolean; reconciliation: boolean };
  evidence: { failedEvents24h: number; processedEvents24h: number; pendingOrders: number };
};

export function PaymentReadinessPanel() {
  const [data, setData] = useState<Readiness | null>(null);
  const [error, setError] = useState("");

  async function refresh() {
    setError("");
    const response = await fetch("/api/payments/readiness", { cache: "no-store" });
    if (!response.ok) return setError("Payment readiness is unavailable.");
    setData(await response.json() as Readiness);
  }

  useEffect(() => { void refresh(); }, []);

  return (
    <div className="border-t border-border pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">Live payment readiness</p>
          <p className="text-sm text-muted-foreground" role="status">
            {error || (data ? `${data.ok ? "Ready" : "Attention required"} - ${data.evidence.failedEvents24h} failed and ${data.evidence.processedEvents24h} processed events in 24 hours` : "Checking...")}
          </p>
        </div>
        <Button className="h-10 px-3" onClick={() => void refresh()} type="button" variant="secondary" title="Refresh payment readiness">
          <RefreshCw className="h-4 w-4" /><span className="sr-only">Refresh payment readiness</span>
        </Button>
      </div>
      {data ? <p className="mt-3 text-sm text-muted-foreground">Stripe {data.providers.stripe ? "ready" : "not ready"}; Razorpay {data.providers.razorpay ? "ready" : "not ready"}; {data.evidence.pendingOrders} pending paid orders.</p> : null}
    </div>
  );
}

export function FullRefundButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function refund() {
    if (!window.confirm("Submit a full refund? Access and credited benefits will be reversed after provider confirmation.")) return;
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/payments/refunds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, confirmation: "FULL_REFUND" })
    });
    setBusy(false);
    if (!response.ok) return setMessage("Refund could not be submitted.");
    setMessage("Refund submitted. Waiting for provider confirmation.");
    router.refresh();
  }

  return (
    <div>
      <Button className="h-9 px-3 text-sm" disabled={busy} onClick={() => void refund()} type="button" variant="secondary">
        <RotateCcw className="mr-2 h-4 w-4" />{busy ? "Submitting" : "Full refund"}
      </Button>
      {message ? <p className="mt-2 text-xs text-muted-foreground" role="status">{message}</p> : null}
    </div>
  );
}
