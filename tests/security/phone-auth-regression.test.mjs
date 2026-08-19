import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("teacher phone auth schema protects credentials and OTP lifecycle", () => {
  const schema = read("prisma/schema.prisma");
  assert.match(schema, /phoneE164\s+String\?\s+@unique/);
  assert.match(schema, /pinHash\s+String\?/);
  assert.match(schema, /authSessionVersion\s+Int\s+@default\(0\)/);
  assert.match(schema, /model PhoneOtpChallenge/);
  assert.match(schema, /verificationTokenHash\s+String\?\s+@unique/);
  assert.match(schema, /expiresAt\s+DateTime/);
  assert.match(schema, /consumedAt\s+DateTime\?/);
});

test("OTP implementation is short-lived, hashed, single-use, and attempt-limited", () => {
  const service = read("services/phone-auth-service.ts");
  assert.match(service, /5 \* 60 \* 1000/);
  assert.match(service, /OTP_MAX_ATTEMPTS = 5/);
  assert.match(service, /phoneAuthDigest/);
  assert.match(service, /consumedAt: null/);
  assert.match(service, /secureDigestMatch/);
  assert.doesNotMatch(service, /data:\s*\{[^}]*code\s*[,}]/s);
});

test("teacher PIN provider enforces verified teacher accounts and lockouts", () => {
  const auth = read("auth.ts");
  assert.match(auth, /id: "teacher-pin"/);
  assert.match(auth, /user\.phoneVerifiedAt/);
  assert.match(auth, /user\.userType !== "teacher"/);
  assert.match(auth, /nextAttempts >= 5/);
  assert.match(auth, /15 \* 60 \* 1000/);
  assert.match(auth, /bcrypt\.compare\(parsed\.data\.pin, user\.pinHash\)/);
});

test("legacy teacher signup cannot bypass mobile verification", () => {
  const actions = read("features/auth/actions.ts");
  assert.match(actions, /Teacher accounts must be created with mobile verification/);
  assert.match(actions, /purpose: "TEACHER_SIGNUP"/);
  assert.match(actions, /phoneVerifiedAt: new Date\(\)/);
  assert.match(actions, /category: "POLICY_ACKNOWLEDGEMENT"/);
});

test("PIN resets revoke current account session versions", () => {
  const actions = read("features/auth/actions.ts");
  const proxy = read("proxy.ts");
  assert.match(actions, /authSessionVersion: \{ increment: 1 \}/);
  assert.match(proxy, /account\.authSessionVersion === token\.authSessionVersion/);
});

test("production SMS authentication fails closed and requires Twilio", () => {
  const provider = read("lib/sms/provider.ts");
  const env = read("lib/env.ts");
  assert.match(provider, /provider !== "twilio" \|\| process\.env\.SMS_LIVE !== "true"/);
  assert.match(env, /"SMS_PROVIDER", "SMS_LIVE", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"/);
  assert.match(env, /TWILIO_MESSAGING_SERVICE_SID_OR_FROM_NUMBER/);
});
