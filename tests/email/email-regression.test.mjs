import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import process from "node:process";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("email webhook verifies the unmodified body and deduplicates events", () => {
  assert.match(read("app/api/email/webhooks/resend/route.ts"), /await request\.text\(\)[\s\S]*verifyResendWebhook\(/);
  const service = read("services/transactional-email-service.ts");
  assert.match(service, /providerEventId/);
  assert.match(service, /rank\[status\] < rank\[email\.status\]/);
});

test("transactional sends are provider and database idempotent", () => {
  const service = read("services/transactional-email-service.ts");
  assert.match(service, /findUnique\(\{ where: \{ idempotencyKey/);
  assert.match(service, /\{ idempotencyKey: input\.idempotencyKey \}/);
});

test("password reset claims once and revokes active sessions", () => {
  const auth = read("features/auth/actions.ts");
  assert.match(auth, /expiresAt: \{ gt: new Date\(\) \}/);
  assert.match(auth, /isolationLevel: "Serializable"/);
  assert.match(auth, /session\.deleteMany/);
  assert.match(auth, /confirmPassword/);
});

test("email evidence does not duplicate the recipient address", () => {
  const schema = read("prisma/schema.prisma");
  const model = schema.slice(schema.indexOf("model TransactionalEmail"));
  assert.match(model, /recipientHash/);
  assert.doesNotMatch(model, /recipientEmail|rawPayload|rawBody/);
});

test("live email verification fails closed without provider evidence", () => {
  const script = fileURLToPath(new URL("../../scripts/email-verify.mjs", import.meta.url));
  const result = spawnSync(process.execPath, [script], { env: { PATH: process.env.PATH || "" }, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Email verification failed: missing/);
});
