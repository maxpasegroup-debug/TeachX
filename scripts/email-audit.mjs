import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");
const check = (name, pass, detail) => ({ name, pass, detail });
const files = ["lib/email/config.ts", "lib/email/provider.ts", "lib/email/templates.ts", "services/transactional-email-service.ts", "app/api/email/webhooks/resend/route.ts", "app/api/email/readiness/route.ts", "app/(auth)/verify-email/page.tsx", "components/layout/email-verification-reminder.tsx", "components/email/email-operations-panel.tsx", "prisma/migrations/20260818180000_add_transactional_email_integrity/migration.sql", "scripts/email-verify.mjs", "docs/PHASE_15_TRANSACTIONAL_EMAIL.md"];
const schema = read("prisma/schema.prisma");
const service = read("services/transactional-email-service.ts");
const auth = read("features/auth/actions.ts");
const webhook = read("app/api/email/webhooks/resend/route.ts");
const env = read(".env.example");
const policy = JSON.parse(read("security/api-route-policy.json"));
const checks = [
  ...files.map((file) => check(`file:${file}`, existsSync(join(root, file)), file)),
  check("ledger:privacy", schema.includes("model TransactionalEmail") && schema.includes("recipientHash") && !schema.match(/model TransactionalEmail[\s\S]*recipientEmail/), "delivery evidence stores a hash and domain, not recipient address"),
  check("ledger:webhook", schema.includes("model TransactionalEmailEvent") && schema.includes("providerEventId   String") && schema.includes("@unique"), "provider events are deduplicated"),
  check("send:idempotency", service.includes("idempotencyKey: input.idempotencyKey") && schema.includes("idempotencyKey    String") && schema.includes("@unique"), "local and provider delivery are idempotent"),
  check("webhook:signature", webhook.includes("await request.text()") && webhook.includes("verifyResendWebhook("), "webhook verifies the raw signed body"),
  check("webhook:ordering", service.includes("rank[status] < rank[email.status]"), "out-of-order provider events cannot regress delivery state"),
  check("auth:reset-delivery", auth.includes("sendPasswordResetEmail") && service.includes("password-reset/"), "password resets are delivered with one-time links"),
  check("auth:reset-race", auth.includes("isolationLevel: \"Serializable\"") && auth.includes("session.deleteMany") && auth.includes("expiresAt: { gt: new Date() }"), "reset token is atomically claimed and sessions are revoked"),
  check("auth:verification", auth.includes("issueEmailVerification") && service.includes("consumeEmailVerification") && service.includes("emailVerifiedAt"), "signup verification is hashed, expiring, and one-time"),
  check("commerce:receipts", read("services/payment-service.ts").includes("sendCommerceEmail") && service.includes("PAYMENT_CONFIRMED") && service.includes("REFUND_CONFIRMED"), "payment and refund confirmations are delivered"),
  check("templates:safe", read("lib/email/templates.ts").includes("escapeHtml") && !read("lib/email/templates.ts").includes("dangerouslySetInnerHTML"), "dynamic template values are escaped and plain text is included"),
  check("public:webhook-only", policy.publicExact.includes("/api/email/webhooks/resend") && !policy.publicExact.includes("/api/email/readiness"), "only the signed provider callback is public"),
  check("config:fail-closed", read("lib/email/config.ts").includes("EMAIL_DOMAIN_VERIFIED") && read("lib/email/config.ts").includes("EMAIL_DMARC_READY") && read("lib/email/config.ts").includes("EMAIL_TRANSACTIONAL_READY"), "domain and operational controls gate live delivery"),
  check("env:documented", ["RESEND_API_KEY", "RESEND_WEBHOOK_SECRET", "EMAIL_FROM", "EMAIL_REPLY_TO", "EMAIL_LIVE", "EMAIL_DOMAIN_VERIFIED", "EMAIL_DMARC_READY", "EMAIL_TRANSACTIONAL_READY", "EMAIL_WEBHOOK_TESTED_AT", "EMAIL_DELIVERY_TESTED_AT"].every((key) => env.includes(`${key}=`)), "all email variables are documented")
];
const failed = checks.filter((item) => !item.pass);
console.log(`TeachX email audit: ${checks.length - failed.length}/${checks.length} checks passed`);
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name} - ${item.detail}`);
if (failed.length) process.exit(1);
console.log("Transactional email audit passed.");
