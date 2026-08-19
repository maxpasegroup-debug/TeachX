import process from "node:process";
import { Resend } from "resend";

const required = ["DATABASE_URL", "NEXT_PUBLIC_APP_URL", "EMAIL_PROVIDER", "RESEND_API_KEY", "RESEND_WEBHOOK_SECRET", "EMAIL_FROM", "EMAIL_REPLY_TO", "EMAIL_LIVE", "EMAIL_DOMAIN_VERIFIED", "EMAIL_DMARC_READY", "EMAIL_TRANSACTIONAL_READY", "EMAIL_WEBHOOK_TESTED_AT", "EMAIL_DELIVERY_TESTED_AT"];
const missing = required.filter((key) => !process.env[key]);
const fail = (message) => { console.error(`Email verification failed: ${message}`); process.exit(1); };
if (missing.length) fail(`missing ${missing.join(", ")}.`);
if (process.env.EMAIL_PROVIDER !== "resend" || !["EMAIL_LIVE", "EMAIL_DOMAIN_VERIFIED", "EMAIL_DMARC_READY", "EMAIL_TRANSACTIONAL_READY"].every((key) => process.env[key] === "true")) fail("live email controls are not approved.");
const ageDays = (value) => (Date.now() - new Date(value).getTime()) / 86_400_000;
if (!Number.isFinite(ageDays(process.env.EMAIL_WEBHOOK_TESTED_AT)) || ageDays(process.env.EMAIL_WEBHOOK_TESTED_AT) > 30) fail("webhook evidence is missing or older than 30 days.");
if (!Number.isFinite(ageDays(process.env.EMAIL_DELIVERY_TESTED_AT)) || ageDays(process.env.EMAIL_DELIVERY_TESTED_AT) > 30) fail("delivery evidence is missing or older than 30 days.");

try {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const domains = await resend.domains.list();
  if (domains.error) throw new Error(`domain verification returned ${domains.error.name}.`);
  const sender = process.env.EMAIL_FROM.match(/@([^>\s]+)/)?.[1]?.toLowerCase();
  const domainReady = domains.data?.data?.some((domain) => domain.name.toLowerCase() === sender && domain.status === "verified");
  if (!sender || !domainReady) throw new Error("the EMAIL_FROM domain is not verified by Resend.");

  const webhooks = await resend.webhooks.list();
  if (webhooks.error) throw new Error(`webhook verification returned ${webhooks.error.name}.`);
  const expectedEndpoint = new URL("/api/email/webhooks/resend", process.env.NEXT_PUBLIC_APP_URL).toString();
  const requiredEvents = ["email.sent", "email.delivered", "email.delivery_delayed", "email.bounced", "email.complained", "email.failed", "email.suppressed"];
  const webhookReady = webhooks.data?.data?.some((webhook) => webhook.endpoint === expectedEndpoint && webhook.status === "enabled" && requiredEvents.every((event) => webhook.events?.includes(event)));
  if (!webhookReady) throw new Error("the signed production webhook is absent, disabled, or missing required events.");

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const since = new Date(Date.now() - 30 * 86_400_000);
    const evidence = await prisma.transactionalEmail.groupBy({ by: ["kind"], where: { status: "DELIVERED", deliveredAt: { gte: since } }, _count: true });
    const kinds = new Set(evidence.map((item) => item.kind));
    const requiredKinds = ["EMAIL_VERIFICATION", "WELCOME", "PASSWORD_RESET", "PAYMENT_CONFIRMED", "REFUND_CONFIRMED"];
    const absent = requiredKinds.filter((kind) => !kinds.has(kind));
    if (absent.length) throw new Error(`delivered production evidence is missing for ${absent.join(", ")}.`);
  } finally {
    await prisma.$disconnect();
  }
  console.log("TeachX live email verification passed for domain, webhook, identity, and commerce delivery evidence.");
} catch (error) {
  fail(error instanceof Error ? error.message : "provider verification failed.");
}
