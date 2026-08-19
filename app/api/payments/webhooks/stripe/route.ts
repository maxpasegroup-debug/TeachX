import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { stripe } from "@/lib/payments/providers";
import { payloadHash, recordPaymentSignal } from "@/services/payment-service";

function id(value: string | { id: string } | null) {
  return typeof value === "string" ? value : value?.id;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "Invalid signature." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const hash = payloadHash(rawBody);
  let signal: Parameters<typeof recordPaymentSignal>[0] | null = null;
  if (["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed"].includes(event.type)) {
    const session = event.data.object as Stripe.Checkout.Session;
    signal = {
      provider: "stripe",
      providerEventId: event.id,
      type: event.type,
      kind: event.type === "checkout.session.async_payment_failed" || session.payment_status !== "paid" ? "failed" : "paid",
      payloadHash: hash,
      orderId: session.metadata?.teachx_order_id || session.client_reference_id || undefined,
      providerOrderId: session.id,
      providerPaymentId: id(session.payment_intent),
      amountMinor: session.amount_total === null ? undefined : BigInt(session.amount_total),
      currency: session.currency || undefined
    };
  } else if (event.type === "refund.updated") {
    const refund = event.data.object as Stripe.Refund;
    signal = {
      provider: "stripe",
      providerEventId: event.id,
      type: event.type,
      kind: refund.status === "succeeded" ? "refunded" : refund.status === "failed" || refund.status === "canceled" ? "failed" : "ignored",
      payloadHash: hash,
      providerPaymentId: id(refund.payment_intent),
      providerRefundId: refund.id,
      amountMinor: BigInt(refund.amount),
      currency: refund.currency
    };
  }

  if (!signal) return NextResponse.json({ received: true, ignored: true });
  try {
    await recordPaymentSignal(signal);
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Event processing failed." }, { status: 500 });
  }
}

