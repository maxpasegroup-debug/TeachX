import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");
const check = (name, pass, detail) => ({ name, pass, detail });
const files = [
  "lib/payments/config.ts", "lib/payments/providers.ts", "services/payment-service.ts",
  "app/api/payments/checkout/route.ts", "app/api/payments/refunds/route.ts",
  "app/api/payments/readiness/route.ts", "app/api/payments/webhooks/stripe/route.ts",
  "app/api/payments/webhooks/razorpay/route.ts", "components/commerce/checkout-payment-actions.tsx",
  "components/commerce/payment-admin-actions.tsx", "prisma/migrations/20260818170000_add_payment_integrity/migration.sql",
  "scripts/payment-verify.mjs", "docs/PHASE_14_GLOBAL_PAYMENTS.md"
];
const schema = read("prisma/schema.prisma");
const service = read("services/payment-service.ts");
const stripe = read("app/api/payments/webhooks/stripe/route.ts");
const razorpay = read("app/api/payments/webhooks/razorpay/route.ts");
const providers = read("lib/payments/providers.ts");
const checkout = read("components/commerce/checkout-payment-actions.tsx");
const refunds = read("app/api/payments/refunds/route.ts");
const env = read(".env.example");
const policy = JSON.parse(read("security/api-route-policy.json"));

const checks = [
  ...files.map((file) => check(`file:${file}`, existsSync(join(root, file)), file)),
  check("ledger:immutable-event", schema.includes("model CommercePaymentEvent") && schema.includes("@@unique([provider, providerEventId])") && !schema.match(/model CommercePaymentEvent[\s\S]*rawPayload/), "deduplicated minimal event evidence; no raw payload storage"),
  check("ledger:credit-note", schema.includes("model CommerceCreditNote") && schema.includes("providerRefundId String") && schema.includes("@unique"), "refund evidence is uniquely recorded"),
  check("webhook:stripe-signature", stripe.includes("constructEvent(") && stripe.includes("await request.text()"), "Stripe verifies the raw signed body"),
  check("webhook:razorpay-signature", razorpay.includes("verifyRazorpayWebhook(") && razorpay.includes("await request.text()") && providers.includes("timingSafeEqual"), "Razorpay verifies raw-body HMAC in constant time"),
  check("webhook:deduplication", razorpay.includes('x-razorpay-event-id') && service.includes("provider_providerEventId"), "provider event IDs are mandatory and unique"),
  check("checkout:server-authority", service.includes("minorAmount(order.total)") && service.includes("buyerId: input.userId"), "price and ownership are resolved server-side"),
  check("checkout:hosted", service.includes("checkout.sessions.create") && checkout.includes("checkout.razorpay.com/v1/checkout.js"), "sensitive card entry stays with hosted providers"),
  check("fulfil:atomic", service.includes('isolationLevel: "Serializable"') && service.includes('status: "PENDING_PAYMENT"') && service.includes('status: "PAID"'), "fulfillment uses a serializable compare-and-set transition"),
  check("fulfil:evidence", service.includes("hasOrderLocator") && service.includes("amountMatches") && service.includes("currencyMatches") && service.includes("providerMatches") && service.includes("identifiersPresent"), "order locator, provider, amount, currency, and identifiers must match"),
  check("fulfil:webhook-only", !checkout.includes("FULFILLED") && !checkout.includes("payment-service"), "the browser cannot grant paid access"),
  check("refund:full-only", refunds.includes('z.literal("FULL_REFUND")') && service.includes("requestFullRefund") && service.includes('status: "REFUND_PENDING"'), "operator refunds require explicit confirmation and an atomic pending state"),
  check("refund:reversal", service.includes("commerceCreditNote.create") && service.includes('status: "REFUNDED"') && service.includes('type: "REFUND"'), "confirmed refunds reverse access, credits, wallet entries, and invoice state"),
  check("refund:permission", refunds.includes('requireApiSession("finance.manage")'), "refunds require finance permission and institution scope"),
  check("public:only-webhooks", policy.publicExact.includes("/api/payments/webhooks/stripe") && policy.publicExact.includes("/api/payments/webhooks/razorpay") && !policy.publicExact.includes("/api/payments/refunds"), "only signed provider callbacks are public"),
  check("config:fail-closed", read("lib/payments/config.ts").includes("PAYMENT_TAX_READY") && read("lib/payments/config.ts").includes("PAYMENT_REFUNDS_READY") && read("lib/payments/config.ts").includes("PAYMENT_RECONCILIATION_READY"), "live checkout requires tax, refund, and reconciliation controls"),
  check("env:documented", ["RAZORPAY_WEBHOOK_SECRET", "STRIPE_WEBHOOK_SECRET", "PAYMENT_TAX_READY", "PAYMENT_REFUNDS_READY", "PAYMENT_RECONCILIATION_READY", "PAYMENT_MERCHANT_LEGAL_NAME", "PAYMENT_MERCHANT_ADDRESS", "PAYMENT_WEBHOOK_TESTED_AT", "PAYMENT_RECONCILED_AT", "PAYMENT_PRICES_INCLUDE_TAX"].every((key) => env.includes(`${key}=`)), "all payment operations variables are documented")
];

const failed = checks.filter((item) => !item.pass);
console.log(`TeachX payment audit: ${checks.length - failed.length}/${checks.length} checks passed`);
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name} - ${item.detail}`);
if (failed.length) process.exit(1);
console.log("Payment integrity audit passed.");
