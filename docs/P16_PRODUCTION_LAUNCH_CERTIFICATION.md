# TeachX P16 Production Launch Certification

This document separates application code readiness from production configuration readiness. Never paste secret values into this file, Git, support tickets, or screenshots.

## Certification states

- **CODE READY**: source validation, security policy audits, regression tests, browser checks, and the production build pass.
- **PRODUCTION CONFIG READY**: Railway, PostgreSQL, Redis, SMS, AI, payments, email, storage, monitoring, backups, and live evidence checks pass.
- **PRODUCTION READY**: both states above are true and the founder smoke test succeeds on the real HTTPS domain.

## P16 certification result

| Area | Status | Evidence |
| --- | --- | --- |
| Auth | PASS | Authentication and P15 signup/trial regression coverage passed. |
| Tenant security | PASS | Security regression suite and API policy audit passed. |
| AI and TARA | PASS | Teacher scope, entitlement, provider-failure, and malformed-request checks passed. |
| Teaching | PASS | Teacher OS integration and route verification passed. |
| Resources | PASS | Ownership, upload, download, and cross-module regression checks passed. |
| Planner | PASS | Ownership and Teacher OS integration regression checks passed. |
| Community | PASS | Privacy and cross-module regression checks passed. |
| Business | PASS | P8-P15 ownership, subscription, and commerce regression checks passed. |
| Subscription | PASS | Trial, Basic, Pro, expiry, cancellation, and entitlement regression checks passed. |
| Payment | PASS | Static audit and signed-webhook/idempotency regression checks passed. Live provider evidence remains blocked. |
| Support | PASS | Ownership, navigation, and Teacher OS regression checks passed. |
| Mobile | PASS | Chromium mobile accessibility, overflow, public, privacy, and protected-route checks passed. |
| Public website | PASS | Public pages, metadata routes, security headers, accessibility, and smoke checks passed. |
| Routes | PASS | 312 launch checks and the complete API route policy audit passed; invalid URLs return 404. |
| Build | PASS | Prisma generation/validation, TypeScript, lint with zero errors, and the production build passed. |
| Performance | PASS | Static performance audit passed; production load evidence remains blocked. |
| Security | PASS | Regression, route policy, dependency, webhook, and unauthenticated browser checks passed. |
| Railway configuration | BLOCKED | Production secrets, service endpoints, DNS, and evidence flags are not available in this workspace. |
| Production database migration | BLOCKED | `DATABASE_URL` is intentionally absent locally; run the controlled Railway migration sequence below. |
| Live provider verification | BLOCKED | Payment, SMS, AI, email, storage, Sentry, backup, and recovery checks require production credentials and endpoints. |

Local totals: 147 Node regression tests passed, 82 Playwright tests passed across desktop and mobile, 312 launch checks passed, 26 production-server smoke checks passed, and the P16 focused suite passed. ESLint reported zero errors and 118 pre-existing warnings, primarily in out-of-scope DirectorX and shared modules.

## Railway variables

### Application startup and URLs

- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL=https://<production-domain>`
- `NEXT_PUBLIC_APP_TITLE=TeachX Guru`
- `NEXT_PUBLIC_APP_DESCRIPTION=<approved public description>`
- `AUTH_URL=https://<production-domain>`
- `AUTH_SECRET=<long random secret>`
- `SETUP_SECRET=<separate random secret, at least 32 characters>`
- `REDIS_URL=<private production Redis URL>`
- `OPERATIONS_WRITE_FREEZE=false`

`AUTH_URL` and `NEXT_PUBLIC_APP_URL` must use the same canonical HTTPS host. Rotate `SETUP_SECRET` after first-run setup is complete.

### Database

- `DATABASE_URL=<Railway PostgreSQL URL>`
- `DATABASE_POOL_MAX=10`
- `DATABASE_POOL_TIMEOUT_SECONDS=10`
- `PERFORMANCE_DATABASE_TIMEOUT_MS=3000`

Add `connection_limit=10` and `pool_timeout=10` to `DATABASE_URL`, preserving any existing query parameters. Never run `prisma migrate dev`, `prisma db push`, a reset, or a seed against production.

### Teacher mobile authentication

- `SMS_PROVIDER=twilio`
- `SMS_LIVE=true`
- `TWILIO_ACCOUNT_SID=<secret>`
- `TWILIO_AUTH_TOKEN=<secret>`
- `TWILIO_MESSAGING_SERVICE_SID=<recommended>`
- `TWILIO_FROM_NUMBER=<use only when no Messaging Service is configured>`

Verify the production sender can deliver OTP messages to every launch country. PINs and OTP values must never be logged.

### TARA and AI

- `OPENAI_API_KEY=<secret>`
- `OPENAI_MODEL=<approved production model>`

Public teacher beta is not functionally ready without `OPENAI_API_KEY`. Confirm TARA, AI Studio, credit exhaustion, provider failure, and trial expiry on the production tenant before inviting teachers.

### Payments

- `PAYMENTS_LIVE=true`
- `RAZORPAY_KEY_ID=<live key>`
- `RAZORPAY_KEY_SECRET=<live secret>`
- `RAZORPAY_WEBHOOK_SECRET=<secret>`
- `STRIPE_SECRET_KEY=<live secret>`
- `STRIPE_WEBHOOK_SECRET=<secret>`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<live publishable key>`
- `PAYMENT_TAX_READY=true`
- `PAYMENT_REFUNDS_READY=true`
- `PAYMENT_RECONCILIATION_READY=true`
- `PAYMENT_MERCHANT_LEGAL_NAME=<legal entity>`
- `PAYMENT_MERCHANT_ADDRESS=<legal address>`
- `PAYMENT_MERCHANT_TAX_ID=<when applicable>`
- `PAYMENT_PRICES_INCLUDE_TAX=<true or false according to checkout policy>`
- `PAYMENT_WEBHOOK_TESTED_AT=<ISO timestamp from a real signed webhook test>`
- `PAYMENT_RECONCILED_AT=<ISO timestamp from completed reconciliation>`

Configure provider callbacks exactly:

- Stripe: `https://<production-domain>/api/payments/webhooks/stripe`
- Razorpay: `https://<production-domain>/api/payments/webhooks/razorpay`

The browser must never activate a paid plan. Verify successful, failed, cancelled, duplicate, invalid-signature, and refund events before enabling `PAYMENTS_LIVE`.

### Transactional email

- `EMAIL_PROVIDER=resend`
- `RESEND_API_KEY=<secret>`
- `RESEND_WEBHOOK_SECRET=<secret>`
- `EMAIL_FROM=TeachX Guru <notifications@<verified-domain>>`
- `EMAIL_REPLY_TO=<monitored support address>`
- `EMAIL_LIVE=true`
- `EMAIL_DOMAIN_VERIFIED=true`
- `EMAIL_DMARC_READY=true`
- `EMAIL_TRANSACTIONAL_READY=true`
- `EMAIL_WEBHOOK_TESTED_AT=<ISO timestamp>`
- `EMAIL_DELIVERY_TESTED_AT=<ISO timestamp>`

Resend callback: `https://<production-domain>/api/email/webhooks/resend`.

### Private object storage

- `STORAGE_PROVIDER=s3`
- `STORAGE_S3_ENDPOINT=<provider endpoint when required>`
- `STORAGE_S3_REGION=<region>`
- `STORAGE_S3_BUCKET=<private bucket>`
- `STORAGE_S3_ACCESS_KEY_ID=<secret>`
- `STORAGE_S3_SECRET_ACCESS_KEY=<secret>`
- `STORAGE_S3_PREFIX=teachx`
- `STORAGE_S3_FORCE_PATH_STYLE=<provider requirement>`
- `STORAGE_MAX_FILE_MB=100`
- `STORAGE_DEFAULT_QUOTA_MB=1024`
- `STORAGE_UPLOAD_TTL_SECONDS=600`
- `STORAGE_DOWNLOAD_TTL_SECONDS=300`
- `STORAGE_MULTIPART_THRESHOLD_MB=10`
- `STORAGE_MULTIPART_PART_MB=8`
- `STORAGE_RESUMABLE_TTL_HOURS=48`
- `STORAGE_PRIVATE_BUCKET_READY=true`
- `STORAGE_CORS_READY=true`
- `STORAGE_RETENTION_READY=true`
- `STORAGE_CLEANUP_READY=true`
- `STORAGE_UPLOAD_TESTED_AT=<ISO timestamp>`
- `STORAGE_DOWNLOAD_TESTED_AT=<ISO timestamp>`
- `STORAGE_CLEANUP_TESTED_AT=<ISO timestamp>`

The bucket must not permit anonymous listing or reads. Test signed upload, checksum, authorized download, unauthorized download, multipart resume, and cleanup.

### Monitoring and source maps

- `SENTRY_DSN=<server DSN>`
- `NEXT_PUBLIC_SENTRY_DSN=<browser DSN>`
- `SENTRY_ORG=<organization>`
- `SENTRY_PROJECT=<project>`
- `SENTRY_AUTH_TOKEN=<build-only secret>`
- `SENTRY_ENVIRONMENT=production`
- `NEXT_PUBLIC_SENTRY_ENVIRONMENT=production`
- `NEXT_PUBLIC_SENTRY_RELEASE=<Git commit SHA or release ID>`
- `SENTRY_TRACES_SAMPLE_RATE=0.1`
- `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.05`

Confirm server and browser test errors arrive with request IDs and without passwords, PINs, tokens, prompts, payment payloads, or teacher PII.

### Backup and recovery

- `BACKUP_PROVIDER=railway-volume+pitr+s3`
- `BACKUP_S3_ENDPOINT=<private backup endpoint>`
- `BACKUP_S3_REGION=<region>`
- `BACKUP_S3_BUCKET=<private backup bucket>`
- `BACKUP_S3_ACCESS_KEY_ID=<secret>`
- `BACKUP_S3_SECRET_ACCESS_KEY=<secret>`
- `BACKUP_S3_PREFIX=teachx-production`
- `BACKUP_PITR_ENABLED=true`
- `BACKUP_VOLUME_SCHEDULE=daily+weekly+monthly`
- `BACKUP_RPO_HOURS=24`
- `BACKUP_RTO_MINUTES=120`
- `BACKUP_RETENTION_DAYS=30`
- `BACKUP_DRILL_MAX_AGE_DAYS=90`
- `BACKUP_MEDIA_VERSIONING_ENABLED=true`
- `BACKUP_MEDIA_RETENTION_DAYS=30`

Production readiness requires recent backup and isolated restore-drill evidence, not configuration alone.

### Launch evidence and operations

Copy the remaining defaults from `.env.example`, then replace readiness flags only after evidence exists:

- Resilience: `RESILIENCE_REAL_DEVICE_READY`, `RESILIENCE_OFFLINE_DRAFT_READY`, `RESILIENCE_RESUMABLE_UPLOAD_READY`, and the three `RESILIENCE_*_TESTED_AT` timestamps.
- Globalization: `NEXT_PUBLIC_DEFAULT_LOCALE`, `NEXT_PUBLIC_DEFAULT_TIME_ZONE`, `GLOBALIZATION_LOCALE_READY`, `GLOBALIZATION_RTL_READY`, `GLOBALIZATION_WCAG_READY`, and the three `GLOBALIZATION_*_TESTED_AT` timestamps.
- Performance: request, p95, error-rate, concurrency and pool budgets; `PERFORMANCE_CAPACITY_READY`, `PERFORMANCE_DATABASE_POOL_READY`, `PERFORMANCE_LOAD_TEST_READY`; and the three performance evidence timestamps.
- Operations: availability and acknowledgement targets, primary/secondary on-call, incident channel, alert destination, four readiness flags, drill ID, and five operations evidence timestamps.
- Privacy: `PRIVACY_CONTACT_EMAIL`, SLA/evidence age, four privacy readiness flags, and four review/drill timestamps.

Do not set a `*_READY` variable to `true` until the corresponding live check has passed.

## Database deployment

Run against the Railway production database from one controlled release job:

```bash
npx prisma migrate status
npx prisma migrate deploy
npx prisma migrate status
```

Take or confirm a recoverable backup before migration. There are no P15/P16 schema changes, but every existing migration must be recorded as applied.

## Exact deployment sequence

1. Create Railway PostgreSQL and Redis services and a private S3-compatible storage bucket.
2. Configure the variables above without exposing their values.
3. Confirm the canonical HTTPS domain, DNS, TLS, `AUTH_URL`, and `NEXT_PUBLIC_APP_URL`.
4. Confirm backup/PITR and take a pre-deploy backup.
5. Run `npx prisma migrate status`, `npx prisma migrate deploy`, then status again.
6. Build with `npm ci` and `npm run build`.
7. Start with `npm run start` using Railway's assigned `PORT`.
8. Confirm `/api/health`, `/api/ready`, `/api/status`, and `/api/version`.
9. Configure and test Stripe, Razorpay, and Resend signed webhooks.
10. Run `SMOKE_BASE_URL=https://<production-domain> npm run launch:gate:production`.
11. Complete the founder smoke tests below with a new teacher and a separate second tenant.
12. Invite the five-teacher beta only after every launch blocker is cleared.

## Founder production smoke tests

1. Open Home, Pricing, Privacy, Terms, Trust, and teacher Signup while logged out.
2. Register a unique mobile number, verify one personal workspace and one seven-day trial are created, and confirm a duplicate attempt is rejected.
3. Open all four pillars and TARA on a small phone and desktop.
4. Generate one AI item, save it as a resource, attach it to teaching, and schedule it in Planner.
5. Create and complete a task; open its notification deep link.
6. Create a community discussion and verify another tenant cannot read private content or messages.
7. Complete the professional profile and verify private business, wallet, order, and subscription records cannot be accessed by a second tenant.
8. Exhaust or temporarily set a zero AI allowance and confirm TARA and AI Studio both block generation with the same explanation.
9. Cancel one checkout and fail one provider test payment; confirm neither activates Pro.
10. Complete one signed provider test payment; confirm exactly one subscription activates and duplicate webhooks do not duplicate access.
11. Submit support, test failure/retry, update settings, log out, and confirm protected pages redirect to login.
12. Confirm Sentry, email evidence, storage evidence, payment reconciliation, and backup monitoring are receiving production signals.

## External blockers

Until Railway and provider values are supplied and all live verification scripts pass, the correct certification is **CODE READY / PRODUCTION CONFIG BLOCKED**. This is an environment state, not a reason to bypass a gate.
