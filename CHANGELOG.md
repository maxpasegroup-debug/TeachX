# Changelog

## 1.0.0-rc.1 - Teacher mobile authentication

- Added verified international mobile-number signup for teachers with short-lived SMS OTP challenges.
- Added 6-digit PIN login, failed-attempt lockouts, SMS PIN recovery, audit records, and account-wide session invalidation.
- Made email optional for new teachers while retaining an unlinked staff and legacy password route.
- Added Twilio SMS configuration, launch checks, policy disclosures, migration coverage, and phone-auth regression tests.

## Phase 19 - Global scale and performance

- Added bounded latency, load, error-rate, request-timeout, database-timeout, and connection-pool budgets with fresh production evidence.
- Added a concurrent mixed-route percentile load harness, live database/index verifier, protected performance readiness endpoint, immutable static caching, and retry guidance for temporary dependency failures.
- Added seven indexes for notification, preference, audit, and content workflow hot paths and wired performance certification into the local and production release gates.

## Phase 18 - Globalization and accessibility

- Added validated launch locales, regional time zones, server-rendered language and RTL direction, shared international formatters, and secure authenticated preference persistence.
- Added keyboard skip navigation, visible focus, reduced-motion enforcement, high-contrast mode, RTL browser coverage, production readiness evidence, and release gates.
- Explicitly separated locale mechanics from human-reviewed interface translation so unsupported language claims cannot reach launch materials.

## Phase 17 - Low-connectivity resilience

- Added resumable, checksum-verified multipart uploads with durable part ledgers, pause/retry/reload recovery, provider abort cleanup, and live evidence gates.
- Added local teacher upload drafts, online/offline and update status, bounded public/static PWA caching, strict private-data cache exclusion, and complete PNG install icons.
- Added protected resilience readiness, production verification, audits, regression tests, Railway variables, and a real-device rural connectivity drill.

## Phase 16 - Private object storage

- Added direct private S3-compatible uploads with SHA-256 verification, per-user quota reservations, tenant validation, and durable lifecycle evidence.
- Added authorized short-lived downloads for owners, content managers, enrolled students, and marketplace entitlement holders.
- Added stale-object cleanup, protected readiness, live provider verification, release audits, regression tests, and Railway operations guidance.

## Phase 15 - Transactional email integrity

- Added verified-domain Resend delivery for account verification, welcome, password reset, payment, and refund messages.
- Added hashed one-time verification links and race-safe password resets that revoke existing sessions.
- Added privacy-minimized email and signed-webhook ledgers with idempotency and out-of-order event protection.
- Added user verification reminders, admin delivery readiness, production provider verification, and release gates.

## Phase 14 - Global payment integrity

- Added hosted Razorpay INR and Stripe international checkout with raw-body signed webhooks.
- Added immutable, deduplicated payment-event evidence and atomic entitlement fulfillment.
- Added full-refund submission, webhook-confirmed reversals, credit notes, and admin readiness controls.
- Added global currency pricing, production payment verification, regression tests, and release gates.

All notable TeachX launch changes are recorded here.

## 1.0.0-rc.1 - 2026-08-18

### Teacher experience

- Added a simplified teacher home with clear lesson, worksheet, quiz, class, download, and support actions.
- Added AI Studio presets, curriculum and language controls, iterative improvements, library saving, and practical export/share formats.
- Added a dedicated teacher support and launch-feedback flow.

### Commercial launch

- Added India and international teacher pricing, including Free, Rural Starter, Plus, Pro, and Institution plans.
- Added protected checkout review while keeping paid access disabled until verified provider payment is available.

### Trust and operations

- Added privacy, terms, refund, security, cookie, trust, contact, and security disclosure routes.
- Added stronger authentication validation, rate limiting, and browser security headers.
- Added Redis-backed distributed abuse protection, a locked one-time setup flow, private API fail-closed enforcement, and request-size limits.
- Upgraded the production framework dependencies and added dependency, API-policy, and security-regression release gates.
- Added desktop/mobile Playwright certification, WCAG A/AA scanning, Lighthouse budgets, and pull-request quality automation.
- Added privacy-filtered server, edge, browser, Prisma, and Redis observability with request correlation and structured Railway logs.
- Added three-layer database recovery with snapshots, PITR, private portable dumps, checksum validation, isolated restore drills, and fail-closed launch verification.
- Added admin launch readiness, health/readiness/version probes, repository verification, deployed smoke testing, and the final release gate.
- Added a sanitized public system-status page, component health API, automated production monitor, and incident-response standard.

### Release boundary

- Payment provider webhooks, refunds, tax invoicing, production credentials, production backups, and external monitoring must be verified in the deployment environment before paid public launch.
# Phase 20 - Production operations and incident command

- Added durable SEV1-SEV3 incidents with forward-only state transitions, append-only internal/public updates, commander assignment, drills, and audit evidence.
- Added an admin Incident Command workspace, public incident history, governed maintenance notices, emergency mutation freeze, on-call/SLO configuration, live verification, regression tests, and release gates.
# Phase 21 - Global privacy governance

- Added append-only consent evidence, Global Privacy Control handling, a signed-in Privacy Center, minimized portable account snapshots, and formal access/export/correction/deletion/restriction/objection workflows.
- Added administrator SLA and legal-hold controls, immutable request events, a reviewed retention register, privacy readiness/status integration, live verification, regression tests, migration, and release gates.
