import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const root = process.cwd();

const requiredFiles = [
  "app/pricing/page.tsx",
  "app/trust/page.tsx",
  "app/status/page.tsx",
  "app/api/status/route.ts",
  "app/privacy/page.tsx",
  "app/terms/page.tsx",
  "app/security/page.tsx",
  "app/refund-policy/page.tsx",
  "app/cookies/page.tsx",
  "app/contact/page.tsx",
  "app/(app)/checkout/[orderId]/page.tsx",
  "app/(app)/teacher/support/page.tsx",
  "app/(app)/admin/launch/page.tsx",
  "app/api/launch/readiness/route.ts",
  "app/.well-known/security.txt/route.ts",
  "proxy.ts",
  "security/api-route-policy.json",
  "docs/PHASE_6_LAUNCH_RUNBOOK.md",
  "docs/PHASE_7_LAUNCH_REHEARSAL.md",
  "docs/PHASE_8_RELEASE_GATE.md",
  "docs/PHASE_9_POST_LAUNCH_RELIABILITY.md",
  "docs/PHASE_10_SECURITY_REMEDIATION.md",
  "docs/PHASE_11_AUTOMATED_CERTIFICATION.md",
  "docs/PHASE_12_PRODUCTION_OBSERVABILITY.md",
  "docs/PHASE_13_DATA_RESILIENCE.md",
  "docs/PHASE_14_GLOBAL_PAYMENTS.md",
  "docs/PHASE_15_TRANSACTIONAL_EMAIL.md",
  "docs/PHASE_16_PRIVATE_OBJECT_STORAGE.md",
  "docs/PHASE_17_LOW_CONNECTIVITY_RESILIENCE.md",
  "docs/PHASE_18_GLOBALIZATION_ACCESSIBILITY.md",
  "docs/PHASE_19_GLOBAL_SCALE_PERFORMANCE.md",
  "docs/PHASE_20_PRODUCTION_OPERATIONS.md",
  "docs/PHASE_21_GLOBAL_PRIVACY_GOVERNANCE.md",
  "CHANGELOG.md",
  "features/launch-intelligence/actions.ts",
  "services/launch-readiness-service.ts",
  "scripts/launch-smoke.mjs",
  "scripts/launch-gate.mjs",
  "scripts/launch-monitor.mjs",
  "scripts/security-audit.mjs",
  "tests/security/security-regression.test.mjs",
  "tests/e2e/launch.spec.ts",
  "tests/e2e/accessibility.spec.ts",
  "tests/e2e/privacy.spec.ts",
  "playwright.config.ts",
  "lighthouserc.json",
  ".github/workflows/quality.yml",
  "scripts/quality-gate.mjs",
  "scripts/observability-audit.mjs",
  "tests/observability/observability-regression.test.mjs",
  "scripts/recovery-audit.mjs",
  "scripts/recovery-verify.mjs",
  "tests/recovery/recovery-regression.test.mjs",
  "scripts/payment-audit.mjs",
  "scripts/payment-verify.mjs",
  "tests/payments/payment-regression.test.mjs",
  "scripts/email-audit.mjs",
  "scripts/email-verify.mjs",
  "tests/email/email-regression.test.mjs",
  "scripts/storage-audit.mjs",
  "scripts/storage-verify.mjs",
  "scripts/storage-cleanup.mjs",
  "tests/storage/storage-regression.test.mjs",
  "lib/storage/config.ts",
  "lib/storage/provider.ts",
  "scripts/resilience-audit.mjs",
  "scripts/resilience-verify.mjs",
  "tests/resilience/resilience-regression.test.mjs",
  "lib/resilience/config.ts",
  "scripts/globalization-audit.mjs",
  "scripts/globalization-verify.mjs",
  "tests/globalization/globalization-regression.test.mjs",
  "lib/globalization/config.ts",
  "lib/i18n/config.ts",
  "scripts/performance-audit.mjs",
  "scripts/performance-load.mjs",
  "scripts/performance-verify.mjs",
  "tests/performance/performance-regression.test.mjs",
  "lib/performance/config.ts",
  "lib/performance/timeout.ts",
  "prisma/migrations/20260819160000_add_scale_hot_path_indexes/migration.sql",
  "scripts/operations-audit.mjs",
  "scripts/operations-verify.mjs",
  "tests/operations/operations-regression.test.mjs",
  "lib/operations/config.ts",
  "services/operations-service.ts",
  "app/(app)/admin/incidents/page.tsx",
  "app/api/operations/readiness/route.ts",
  "prisma/migrations/20260819190000_add_production_operations/migration.sql",
  "scripts/privacy-audit.mjs",
  "scripts/privacy-verify.mjs",
  "tests/privacy/privacy-regression.test.mjs",
  "lib/privacy/config.ts",
  "services/privacy-service.ts",
  "components/privacy/privacy-choices.tsx",
  "app/(app)/privacy-center/page.tsx",
  "app/(app)/admin/privacy/page.tsx",
  "app/api/privacy/readiness/route.ts",
  "prisma/migrations/20260819210000_add_global_privacy_governance/migration.sql",
  "public/icons/icon-192.png",
  "public/icons/icon-512.png",
  "public/icons/icon-maskable-512.png",
  "lib/recovery/config.ts",
  "lib/recovery/backup-evidence.ts",
  "ops/backup/Dockerfile",
  "ops/backup/backup.sh",
  "ops/backup/restore-drill.sh",
  "instrumentation.ts",
  "instrumentation-client.ts",
  "sentry.server.config.ts",
  "sentry.edge.config.ts",
  "services/public-status-service.ts",
  "services/phone-auth-service.ts",
  "lib/auth/phone.ts",
  "lib/sms/provider.ts",
  "prisma/migrations/20260820150000_add_teacher_phone_auth/migration.sql",
  "release/manifest.json"
];

const requiredEnv = [
  "DATABASE_URL", "AUTH_SECRET", "AUTH_URL", "REDIS_URL", "SETUP_SECRET", "SENTRY_DSN", "NEXT_PUBLIC_SENTRY_DSN", "NEXT_PUBLIC_APP_URL",
  "SMS_PROVIDER", "SMS_LIVE", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN",
  "BACKUP_PROVIDER", "BACKUP_S3_ENDPOINT", "BACKUP_S3_REGION", "BACKUP_S3_BUCKET", "BACKUP_S3_ACCESS_KEY_ID", "BACKUP_S3_SECRET_ACCESS_KEY",
  "BACKUP_S3_PREFIX", "BACKUP_PITR_ENABLED", "BACKUP_VOLUME_SCHEDULE", "BACKUP_RPO_HOURS", "BACKUP_RTO_MINUTES", "BACKUP_RETENTION_DAYS",
  "BACKUP_DRILL_MAX_AGE_DAYS", "BACKUP_MEDIA_VERSIONING_ENABLED", "BACKUP_MEDIA_RETENTION_DAYS",
  "RAZORPAY_WEBHOOK_SECRET", "STRIPE_WEBHOOK_SECRET", "PAYMENT_TAX_READY", "PAYMENT_REFUNDS_READY",
  "PAYMENT_RECONCILIATION_READY", "PAYMENT_MERCHANT_LEGAL_NAME", "PAYMENT_MERCHANT_ADDRESS",
  "PAYMENT_WEBHOOK_TESTED_AT", "PAYMENT_RECONCILED_AT", "PAYMENT_PRICES_INCLUDE_TAX",
  "EMAIL_PROVIDER", "RESEND_API_KEY", "RESEND_WEBHOOK_SECRET", "EMAIL_FROM", "EMAIL_REPLY_TO", "EMAIL_LIVE",
  "EMAIL_DOMAIN_VERIFIED", "EMAIL_DMARC_READY", "EMAIL_TRANSACTIONAL_READY", "EMAIL_WEBHOOK_TESTED_AT", "EMAIL_DELIVERY_TESTED_AT"
  , "STORAGE_PROVIDER", "STORAGE_S3_ENDPOINT", "STORAGE_S3_REGION", "STORAGE_S3_BUCKET", "STORAGE_S3_ACCESS_KEY_ID", "STORAGE_S3_SECRET_ACCESS_KEY",
  "STORAGE_S3_PREFIX", "STORAGE_MAX_FILE_MB", "STORAGE_DEFAULT_QUOTA_MB", "STORAGE_UPLOAD_TTL_SECONDS", "STORAGE_DOWNLOAD_TTL_SECONDS",
  "STORAGE_PRIVATE_BUCKET_READY", "STORAGE_CORS_READY", "STORAGE_RETENTION_READY", "STORAGE_CLEANUP_READY", "STORAGE_UPLOAD_TESTED_AT", "STORAGE_DOWNLOAD_TESTED_AT", "STORAGE_CLEANUP_TESTED_AT"
  , "STORAGE_MULTIPART_THRESHOLD_MB", "STORAGE_MULTIPART_PART_MB", "STORAGE_RESUMABLE_TTL_HOURS",
  "RESILIENCE_REAL_DEVICE_READY", "RESILIENCE_OFFLINE_DRAFT_READY", "RESILIENCE_RESUMABLE_UPLOAD_READY", "RESILIENCE_LOW_BANDWIDTH_TESTED_AT", "RESILIENCE_PWA_INSTALL_TESTED_AT", "RESILIENCE_RESUMABLE_UPLOAD_TESTED_AT"
  , "NEXT_PUBLIC_DEFAULT_LOCALE", "NEXT_PUBLIC_DEFAULT_TIME_ZONE", "GLOBALIZATION_LOCALE_READY", "GLOBALIZATION_RTL_READY", "GLOBALIZATION_WCAG_READY", "GLOBALIZATION_LOCALE_TESTED_AT", "GLOBALIZATION_RTL_TESTED_AT", "GLOBALIZATION_ACCESSIBILITY_TESTED_AT"
  , "DATABASE_POOL_MAX", "DATABASE_POOL_TIMEOUT_SECONDS", "PERFORMANCE_DATABASE_TIMEOUT_MS", "PERFORMANCE_REQUEST_TIMEOUT_MS", "PERFORMANCE_P95_BUDGET_MS", "PERFORMANCE_MAX_ERROR_RATE_PERCENT", "PERFORMANCE_LOAD_CONCURRENCY", "PERFORMANCE_LOAD_REQUESTS", "PERFORMANCE_CAPACITY_READY", "PERFORMANCE_DATABASE_POOL_READY", "PERFORMANCE_LOAD_TEST_READY", "PERFORMANCE_LOAD_TESTED_AT", "PERFORMANCE_DATABASE_TESTED_AT", "PERFORMANCE_CACHE_TESTED_AT"
  , "OPERATIONS_AVAILABILITY_TARGET", "OPERATIONS_P95_TARGET_MS", "OPERATIONS_SEV1_ACK_MINUTES", "OPERATIONS_SEV2_ACK_MINUTES", "OPERATIONS_EVIDENCE_MAX_AGE_DAYS", "OPERATIONS_PRIMARY_ONCALL", "OPERATIONS_SECONDARY_ONCALL", "OPERATIONS_INCIDENT_CHANNEL", "OPERATIONS_ALERT_DESTINATION", "OPERATIONS_ONCALL_READY", "OPERATIONS_ALERT_ROUTING_READY", "OPERATIONS_ROLLBACK_READY", "OPERATIONS_STATUS_PAGE_READY", "OPERATIONS_ALERT_TESTED_AT", "OPERATIONS_ROLLBACK_TESTED_AT", "OPERATIONS_INCIDENT_DRILL_TESTED_AT", "OPERATIONS_INCIDENT_DRILL_ID", "OPERATIONS_STATUS_TESTED_AT", "OPERATIONS_WRITE_FREEZE"
  , "PRIVACY_REQUEST_SLA_DAYS", "PRIVACY_EVIDENCE_MAX_AGE_DAYS", "PRIVACY_CONTACT_EMAIL", "PRIVACY_PROGRAM_READY", "PRIVACY_RETENTION_READY", "PRIVACY_VENDOR_REGISTER_READY", "PRIVACY_TRANSFER_REVIEW_READY", "PRIVACY_RIGHTS_DRILL_TESTED_AT", "PRIVACY_RETENTION_REVIEWED_AT", "PRIVACY_VENDOR_REVIEWED_AT", "PRIVACY_COOKIE_REVIEWED_AT"
];
const recommendedEnv = ["OPENAI_API_KEY", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "STRIPE_SECRET_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "PAYMENTS_LIVE", "SENTRY_ORG", "SENTRY_PROJECT", "SENTRY_AUTH_TOKEN"];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function check(name, pass, detail) {
  return { name, pass, detail };
}

const packageJson = JSON.parse(read("package.json"));
const releaseManifest = JSON.parse(read("release/manifest.json"));
const routePermissions = read("lib/constants/route-permissions.ts");
const navigation = read("lib/constants/navigation.ts");
const nextConfig = read("next.config.ts");
const envExample = read(".env.example");

const checks = [
  ...requiredFiles.map((file) => check(`file:${file}`, existsSync(join(root, file)), file)),
  check("script:build", Boolean(packageJson.scripts?.build), "package.json has build script"),
  check("script:lint", Boolean(packageJson.scripts?.lint), "package.json has lint script"),
  check("script:typecheck", Boolean(packageJson.scripts?.typecheck), "package.json has typecheck script"),
  check("script:launch:verify", packageJson.scripts?.["launch:verify"] === "node scripts/launch-verify.mjs", "package.json exposes launch verifier"),
  check("script:launch:smoke", packageJson.scripts?.["launch:smoke"] === "node scripts/launch-smoke.mjs", "package.json exposes deployment smoke test"),
  check("script:launch:gate", packageJson.scripts?.["launch:gate"] === "node scripts/launch-gate.mjs", "package.json exposes the complete local release gate"),
  check("script:launch:gate:production", packageJson.scripts?.["launch:gate:production"] === "node scripts/launch-gate.mjs --production", "package.json exposes the strict production release gate"),
  check("script:launch:monitor", packageJson.scripts?.["launch:monitor"] === "node scripts/launch-monitor.mjs", "package.json exposes the post-launch monitor"),
  check("script:security:audit", Boolean(packageJson.scripts?.["security:audit"]), "package.json exposes dependency security audit"),
  check("script:security:routes", Boolean(packageJson.scripts?.["security:routes"]), "package.json exposes API policy audit"),
  check("script:security:test", Boolean(packageJson.scripts?.["security:test"]), "package.json exposes security regression tests"),
  check("script:auth:test", Boolean(packageJson.scripts?.["auth:test"]), "package.json exposes phone authentication regression tests"),
  check("script:observability:audit", Boolean(packageJson.scripts?.["observability:audit"]), "package.json exposes observability policy audit"),
  check("script:observability:test", Boolean(packageJson.scripts?.["observability:test"]), "package.json exposes observability regression tests"),
  check("script:recovery:audit", Boolean(packageJson.scripts?.["recovery:audit"]), "package.json exposes recovery policy audit"),
  check("script:recovery:test", Boolean(packageJson.scripts?.["recovery:test"]), "package.json exposes recovery regression tests"),
  check("script:recovery:verify", Boolean(packageJson.scripts?.["recovery:verify"]), "package.json exposes live recovery verification"),
  check("script:payments:audit", Boolean(packageJson.scripts?.["payments:audit"]), "package.json exposes payment integrity audit"),
  check("script:payments:test", Boolean(packageJson.scripts?.["payments:test"]), "package.json exposes payment regression tests"),
  check("script:payments:verify", Boolean(packageJson.scripts?.["payments:verify"]), "package.json exposes live payment verification"),
  check("script:email:audit", Boolean(packageJson.scripts?.["email:audit"]), "package.json exposes transactional email audit"),
  check("script:email:test", Boolean(packageJson.scripts?.["email:test"]), "package.json exposes transactional email regression tests"),
  check("script:email:verify", Boolean(packageJson.scripts?.["email:verify"]), "package.json exposes live email verification"),
  check("script:storage:audit", Boolean(packageJson.scripts?.["storage:audit"]), "package.json exposes private storage audit"),
  check("script:storage:test", Boolean(packageJson.scripts?.["storage:test"]), "package.json exposes storage regression tests"),
  check("script:storage:verify", Boolean(packageJson.scripts?.["storage:verify"]), "package.json exposes live storage verification"),
  check("script:storage:cleanup", Boolean(packageJson.scripts?.["storage:cleanup"]), "package.json exposes storage cleanup"),
  check("script:resilience:audit", Boolean(packageJson.scripts?.["resilience:audit"]), "package.json exposes low-connectivity audit"),
  check("script:resilience:test", Boolean(packageJson.scripts?.["resilience:test"]), "package.json exposes resilience regression tests"),
  check("script:resilience:verify", Boolean(packageJson.scripts?.["resilience:verify"]), "package.json exposes live resilience verification"),
  check("script:globalization:audit", Boolean(packageJson.scripts?.["globalization:audit"]), "package.json exposes globalization audit"),
  check("script:globalization:test", Boolean(packageJson.scripts?.["globalization:test"]), "package.json exposes globalization regression tests"),
  check("script:globalization:verify", Boolean(packageJson.scripts?.["globalization:verify"]), "package.json exposes live globalization verification"),
  check("script:performance:audit", Boolean(packageJson.scripts?.["performance:audit"]), "package.json exposes performance policy audit"),
  check("script:performance:test", Boolean(packageJson.scripts?.["performance:test"]), "package.json exposes performance regression tests"),
  check("script:performance:load", Boolean(packageJson.scripts?.["performance:load"]), "package.json exposes concurrent load certification"),
  check("script:performance:verify", Boolean(packageJson.scripts?.["performance:verify"]), "package.json exposes live performance verification"),
  check("script:operations:audit", Boolean(packageJson.scripts?.["operations:audit"]), "package.json exposes production operations audit"),
  check("script:operations:test", Boolean(packageJson.scripts?.["operations:test"]), "package.json exposes production operations tests"),
  check("script:operations:verify", Boolean(packageJson.scripts?.["operations:verify"]), "package.json exposes live production operations verification"),
  check("script:privacy:audit", Boolean(packageJson.scripts?.["privacy:audit"]), "package.json exposes global privacy audit"),
  check("script:privacy:test", Boolean(packageJson.scripts?.["privacy:test"]), "package.json exposes privacy regression tests"),
  check("script:privacy:verify", Boolean(packageJson.scripts?.["privacy:verify"]), "package.json exposes live privacy verification"),
  check("script:test:browser", Boolean(packageJson.scripts?.["test:browser"]), "package.json exposes desktop and mobile browser certification"),
  check("script:quality:lighthouse", Boolean(packageJson.scripts?.["quality:lighthouse"]), "package.json exposes Lighthouse budgets"),
  check("script:quality:gate", packageJson.scripts?.["quality:gate"] === "node scripts/quality-gate.mjs", "package.json exposes the complete automated quality gate"),
  check("release:version", releaseManifest.version === packageJson.version, "release manifest matches package version"),
  check("release:gates", ["launch:verify", "security:audit", "security:routes", "security:test", "observability:audit", "observability:test", "recovery:audit", "recovery:test", "recovery:verify", "payments:audit", "payments:test", "payments:verify", "email:audit", "email:test", "email:verify", "storage:audit", "storage:test", "storage:verify", "resilience:audit", "resilience:test", "resilience:verify", "globalization:audit", "globalization:test", "globalization:verify", "performance:audit", "performance:test", "performance:verify", "operations:audit", "operations:test", "operations:verify", "privacy:audit", "privacy:test", "privacy:verify", "test:browser", "quality:lighthouse", "quality:gate", "build", "strict-production-smoke", "manual-teacher-rehearsal", "manual-admin-rehearsal"].every((gate) => releaseManifest.requiredGates?.includes(gate)), "release manifest records automated and manual gates"),
  check("public:trust", routePermissions.includes('"/trust"'), "trust route is public"),
  check("public:status", routePermissions.includes('"/status"'), "status route is public"),
  check("public:verify-email", routePermissions.includes('"/verify-email"'), "email verification route is public"),
  check("public:service-worker", routePermissions.includes('"/sw.js"'), "service worker is public and cannot redirect to login"),
  check("public:policies", ["/privacy", "/terms", "/security", "/cookies", "/refund-policy", "/contact"].every((route) => routePermissions.includes(`"${route}"`)), "policy routes are public"),
  check("nav:teacher-help", navigation.includes('href: "/teacher/support"'), "teacher support is in navigation"),
  check("nav:admin-launch", navigation.includes('href: "/admin/launch"'), "admin launch board is in navigation"),
  check("nav:incident-command", navigation.includes('href: "/admin/incidents"'), "incident command is in admin navigation"),
  check("nav:privacy-center", navigation.includes('href: "/privacy-center"') && navigation.includes('href: "/admin/privacy"'), "user and administrator privacy centers are in navigation"),
  check("headers:csp", nextConfig.includes("Content-Security-Policy"), "CSP header configured"),
  check("headers:hsts", nextConfig.includes("Strict-Transport-Security"), "HSTS header configured"),
  ...requiredEnv.map((key) => check(`env-required:${key}`, envExample.includes(`${key}=`), `${key} is documented`)),
  ...recommendedEnv.map((key) => check(`env-recommended:${key}`, envExample.includes(`${key}=`), `${key} is documented`))
];

const failed = checks.filter((item) => !item.pass);
const passed = checks.length - failed.length;

console.log(`TeachX launch verification: ${passed}/${checks.length} checks passed`);

for (const item of checks) {
  console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name} - ${item.detail}`);
}

if (failed.length) {
  console.error(`Launch verification failed with ${failed.length} issue(s).`);
  process.exit(1);
}

console.log("Launch verification passed.");
