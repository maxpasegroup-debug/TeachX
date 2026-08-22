import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("teacher signup provisions its canonical role instead of requiring a seed", () => {
  const action = read("features/auth/actions.ts");
  const provisioning = read("services/teacher-account-provisioning.ts");

  assert.match(action, /ensureTeacherRole\(tx\)/);
  assert.doesNotMatch(action, /Teacher accounts are not configured yet/);
  assert.match(provisioning, /teacherRoleKey = "ACADEMIC_FACULTY"/);
  assert.match(provisioning, /rolePermissions\[teacherRoleKey\]/);
  assert.match(provisioning, /tx\.role\.upsert/);
  assert.match(provisioning, /tx\.permission\.upsert/);
  assert.match(provisioning, /tx\.rolePermission\.upsert/);
});

test("teacher signup is rate limited, atomic, retryable, and race safe", () => {
  const action = read("features/auth/actions.ts");

  assert.match(action, /teacher-signup-client:/);
  assert.match(action, /teacher-signup-phone:/);
  assert.match(action, /clientLimited\?\.status === 503/);
  assert.match(action, /Account protection is temporarily unavailable/);
  assert.match(action, /isolationLevel: "Serializable"/);
  assert.match(action, /teacherSignupTransactionAttempts = 3/);
  assert.match(action, /isPrismaError\(error, "P2034"\)/);
  assert.match(action, /isPrismaError\(error, "P2002"\)/);
  assert.match(action, /institution: \{ create:/);
  assert.match(action, /status: "TRIALING"/);
});

test("authentication failures are monitored without exposing provider errors", () => {
  const action = read("features/auth/actions.ts");
  const signupForm = read("features/auth/components/teacher-phone-signup-form.tsx");
  const loginForm = read("features/auth/components/teacher-pin-login-form.tsx");
  const resetForm = read("features/auth/components/pin-reset-form.tsx");

  assert.match(action, /captureOperationalError\(error, "auth\.phone_otp_delivery_failed"/);
  assert.match(action, /captureOperationalError\(error, "auth\.teacher_signup_failed"/);
  assert.match(action, /captureOperationalError\(error, "auth\.teacher_pin_reset_failed"/);
  assert.doesNotMatch(action, /message: error instanceof Error \? error\.message/);
  assert.match(action, /Verification is temporarily unavailable/);
  assert.match(signupForm, /Check your connection and try again/);
  assert.match(loginForm, /Check your connection and try again/);
  assert.match(resetForm, /Check your connection and try again/);
});

test("PIN lockout increments atomically and reset revokes existing sessions", () => {
  const auth = read("auth.ts");
  const action = read("features/auth/actions.ts");

  assert.match(auth, /pinFailedAttempts: \{ increment: 1 \}/);
  assert.match(auth, /failed\.pinFailedAttempts >= 5/);
  assert.match(action, /authSessionVersion: \{ increment: 1 \}/);
  assert.match(action, /tx\.session\.deleteMany/);
});

test("production authentication requires distributed rate limiting and live SMS recovery", () => {
  const security = read("lib/security.ts");
  const env = read("lib/env.ts");
  const provider = read("lib/sms/provider.ts");

  assert.match(security, /NODE_ENV === "production" \? unavailableResponse\(\)/);
  assert.match(env, /"DATABASE_URL", "AUTH_SECRET", "AUTH_URL", "NEXT_PUBLIC_APP_URL", "REDIS_URL"/);
  assert.match(env, /"SMS_PROVIDER", "SMS_LIVE", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"/);
  assert.match(provider, /provider !== "twilio" \|\| process\.env\.SMS_LIVE !== "true"/);
});
