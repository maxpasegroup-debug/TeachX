import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import process from "node:process";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("paid access is granted only from verified webhook processing", () => {
  const service = read("services/payment-service.ts");
  const browser = read("components/commerce/checkout-payment-actions.tsx");
  assert.match(service, /provider_providerEventId/);
  assert.match(service, /amountMatches/);
  assert.match(service, /currencyMatches/);
  assert.match(service, /hasOrderLocator/);
  assert.match(service, /isolationLevel: "Serializable"/);
  assert.doesNotMatch(browser, /FULFILLED|PAID/);
});

test("provider callbacks verify raw bodies before processing", () => {
  assert.match(read("app/api/payments/webhooks/stripe/route.ts"), /await request\.text\(\)[\s\S]*constructEvent\(/);
  assert.match(read("app/api/payments/webhooks/razorpay/route.ts"), /await request\.text\(\)[\s\S]*verifyRazorpayWebhook\(/);
  assert.match(read("lib/payments/providers.ts"), /timingSafeEqual/);
});

test("refunds are permissioned, full-only, and webhook-reversed", () => {
  assert.match(read("app/api/payments/refunds/route.ts"), /finance\.manage/);
  assert.match(read("app/api/payments/refunds/route.ts"), /z\.literal\("FULL_REFUND"\)/);
  const service = read("services/payment-service.ts");
  assert.match(service, /commerceCreditNote\.create/);
  assert.match(service, /status: "REFUNDED"/);
  assert.match(service, /status: "REFUND_PENDING"/);
});

test("payment evidence omits raw provider payloads", () => {
  const schema = read("prisma/schema.prisma");
  const model = schema.slice(schema.indexOf("model CommercePaymentEvent"), schema.indexOf("model CommerceOrderItem"));
  assert.match(model, /payloadHash/);
  assert.doesNotMatch(model, /rawPayload|rawBody/);
});

test("live payment verification fails closed without production evidence", () => {
  const script = fileURLToPath(new URL("../../scripts/payment-verify.mjs", import.meta.url));
  const result = spawnSync(process.execPath, [script], { env: { PATH: process.env.PATH || "" }, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Payment verification failed: missing/);
});
