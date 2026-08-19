import { NextResponse } from "next/server";

import { verifyRazorpayWebhook } from "@/lib/payments/providers";
import { payloadHash, recordPaymentSignal } from "@/services/payment-service";

type Entity = Record<string, unknown>;

function entity(payload: Entity, name: string) {
  const wrapper = (payload.payload as Entity | undefined)?.[name] as Entity | undefined;
  return wrapper?.entity as Entity | undefined;
}

function text(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function amount(value: unknown) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? BigInt(value) : undefined;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyRazorpayWebhook(rawBody, request.headers.get("x-razorpay-signature"))) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }
  const eventId = request.headers.get("x-razorpay-event-id");
  if (!eventId) return NextResponse.json({ error: "Missing event identifier." }, { status: 400 });

  let payload: Entity;
  try {
    payload = JSON.parse(rawBody) as Entity;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const eventType = text(payload.event) || "unknown";
  const payment = entity(payload, "payment");
  const order = entity(payload, "order");
  const refund = entity(payload, "refund");
  const notes = (payment?.notes || order?.notes || refund?.notes) as Entity | undefined;
  const hash = payloadHash(rawBody);
  let signal: Parameters<typeof recordPaymentSignal>[0] | null = null;

  if (["payment.captured", "order.paid", "payment.failed"].includes(eventType)) {
    signal = {
      provider: "razorpay",
      providerEventId: eventId,
      type: eventType,
      kind: eventType === "payment.failed" ? "failed" : "paid",
      payloadHash: hash,
      orderId: text(notes?.teachx_order_id),
      providerOrderId: text(payment?.order_id) || text(order?.id),
      providerPaymentId: text(payment?.id),
      amountMinor: amount(payment?.amount) || amount(order?.amount_paid),
      currency: text(payment?.currency) || text(order?.currency)
    };
  } else if (["refund.processed", "refund.failed"].includes(eventType)) {
    signal = {
      provider: "razorpay",
      providerEventId: eventId,
      type: eventType,
      kind: eventType === "refund.processed" ? "refunded" : "failed",
      payloadHash: hash,
      providerPaymentId: text(refund?.payment_id),
      providerRefundId: text(refund?.id),
      amountMinor: amount(refund?.amount),
      currency: text(refund?.currency)
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

