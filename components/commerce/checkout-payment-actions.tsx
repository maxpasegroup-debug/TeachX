"use client";

import { useState } from "react";
import { CreditCard, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string };
  handler: () => void;
  modal: { ondismiss: () => void };
};

declare global {
  interface Window { Razorpay?: new (options: RazorpayOptions) => { open(): void } }
}

async function loadRazorpay() {
  if (window.Razorpay) return true;
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export function CheckoutPaymentActions({ orderId, enabled }: { orderId: string; enabled: boolean }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function start() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/payments/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
      const result = await response.json() as Record<string, unknown>;
      if (!response.ok) throw new Error("Checkout is unavailable.");
      if (result.provider === "stripe" && typeof result.redirectUrl === "string") {
        window.location.assign(result.redirectUrl);
        return;
      }
      if (result.provider === "razorpay" && await loadRazorpay() && window.Razorpay) {
        const checkout = new window.Razorpay({
          key: String(result.keyId),
          amount: Number(result.amount),
          currency: String(result.currency),
          name: String(result.name),
          description: String(result.description),
          order_id: String(result.providerOrderId),
          prefill: result.prefill as { name: string; email: string },
          handler: () => { setMessage("Payment received. Verifying securely..."); window.setTimeout(() => window.location.reload(), 1500); },
          modal: { ondismiss: () => setBusy(false) }
        });
        checkout.open();
        return;
      }
      throw new Error("Payment provider could not start.");
    } catch {
      setMessage("Checkout could not start. No payment was taken.");
      setBusy(false);
    }
  }

  return (
    <div className="mt-5">
      <Button className="w-full" disabled={!enabled || busy} onClick={start} type="button">
        {busy ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
        {busy ? "Opening secure checkout" : "Pay securely"}
      </Button>
      {message ? <p className="mt-3 text-sm text-muted-foreground" role="status">{message}</p> : null}
    </div>
  );
}
