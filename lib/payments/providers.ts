import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import Stripe from "stripe";

let stripeClient: Stripe | undefined;

export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe is not configured.");
  stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripeClient;
}

export function verifyRazorpayWebhook(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(signature, "utf8");
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

async function razorpayRequest(path: string, init: RequestInit) {
  const key = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key || !secret) throw new Error("Razorpay is not configured.");
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
      "Content-Type": "application/json",
      ...init.headers
    },
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Razorpay request failed with HTTP ${response.status}.`);
  return response.json() as Promise<Record<string, unknown>>;
}

export function createRazorpayOrder(input: { amount: bigint; currency: string; orderId: string }) {
  return razorpayRequest("/orders", {
    method: "POST",
    body: JSON.stringify({
      amount: Number(input.amount),
      currency: input.currency,
      receipt: input.orderId.slice(0, 40),
      notes: { teachx_order_id: input.orderId }
    })
  });
}

export function createRazorpayRefund(paymentId: string, amount: bigint, orderId: string) {
  return razorpayRequest(`/payments/${encodeURIComponent(paymentId)}/refund`, {
    method: "POST",
    body: JSON.stringify({ amount: Number(amount), notes: { teachx_order_id: orderId } })
  });
}

