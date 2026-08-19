import process from "node:process";
import Stripe from "stripe";

const required = [
  "DATABASE_URL", "PAYMENTS_LIVE", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET",
  "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "PAYMENT_TAX_READY",
  "PAYMENT_REFUNDS_READY", "PAYMENT_RECONCILIATION_READY", "PAYMENT_MERCHANT_LEGAL_NAME",
  "PAYMENT_MERCHANT_ADDRESS", "PAYMENT_WEBHOOK_TESTED_AT", "PAYMENT_RECONCILED_AT",
  "PAYMENT_PRICES_INCLUDE_TAX"
];
const missing = required.filter((key) => !process.env[key]);
const fail = (message) => { console.error(`Payment verification failed: ${message}`); process.exit(1); };
if (missing.length) fail(`missing ${missing.join(", ")}.`);
if (!["PAYMENTS_LIVE", "PAYMENT_TAX_READY", "PAYMENT_REFUNDS_READY", "PAYMENT_RECONCILIATION_READY", "PAYMENT_PRICES_INCLUDE_TAX"].every((key) => process.env[key] === "true")) fail("live payment controls are not approved.");
if (!process.env.STRIPE_SECRET_KEY.startsWith("sk_live_") || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith("pk_live_") || !process.env.RAZORPAY_KEY_ID.startsWith("rzp_live_")) fail("provider credentials are not live-mode credentials.");

const ageDays = (value) => (Date.now() - new Date(value).getTime()) / 86_400_000;
if (!Number.isFinite(ageDays(process.env.PAYMENT_WEBHOOK_TESTED_AT)) || ageDays(process.env.PAYMENT_WEBHOOK_TESTED_AT) > 30) fail("webhook test evidence is missing or older than 30 days.");
if (!Number.isFinite(ageDays(process.env.PAYMENT_RECONCILED_AT)) || ageDays(process.env.PAYMENT_RECONCILED_AT) > 7) fail("reconciliation evidence is missing or older than 7 days.");

try {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  await stripe.accounts.retrieve();
  const authorization = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders?count=1", { headers: { Authorization: `Basic ${authorization}` } });
  if (!response.ok) throw new Error(`Razorpay credential check returned ${response.status}.`);

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const since = new Date(Date.now() - 30 * 86_400_000);
    const evidence = await prisma.commercePaymentEvent.groupBy({ by: ["provider"], where: { status: "PROCESSED", receivedAt: { gte: since } }, _count: true });
    const providers = new Set(evidence.map((item) => item.provider));
    if (!providers.has("stripe") || !providers.has("razorpay")) throw new Error("a processed live event from each provider is required within 30 days.");
  } finally {
    await prisma.$disconnect();
  }
  console.log("TeachX live payment verification passed for Stripe, Razorpay, webhooks, and reconciliation evidence.");
} catch (error) {
  fail(error instanceof Error ? error.message : "provider verification failed.");
}
