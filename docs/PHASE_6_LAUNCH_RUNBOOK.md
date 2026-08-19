# Phase 6 Launch Runbook

Status: final operational launch pass

This runbook is the practical checklist for launching TeachX Guru to real teachers. It assumes Phases 1-5 are complete: simple teacher dashboard, AI workflow polish, pricing/checkout readiness, trust/legal pages, and launch support operations.

## Pre-Launch Gate

Run the complete local release gate before every production deployment:

```bash
npm run launch:gate
```

After deployment, run `npm run launch:gate:production` with `SMOKE_BASE_URL` set to the real HTTPS URL. The complete Phase 8 procedure is in `docs/PHASE_8_RELEASE_GATE.md`.

## Required Environment

Production must set:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL`
- `REDIS_URL`
- `SETUP_SECRET` (at least 32 random characters; rotate it after initial setup)
- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`
- Recovery variables listed in `docs/PHASE_13_DATA_RESILIENCE.md`
- `NEXT_PUBLIC_APP_URL`

Recommended before public marketing:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `PAYMENTS_LIVE` (set to `true` only after provider, webhook, refund, and entitlement verification)
- `EMAIL_PROVIDER`
- `WHATSAPP_PROVIDER`
- `STORAGE_PROVIDER`

## Deployment Verification

After deployment, verify:

- `/api/health` returns `ok: true`.
- `/api/ready` returns `status: ready`.
- `/api/version` shows the expected package version and commit.
- `/pricing`, `/trust`, `/privacy`, `/terms`, `/security`, `/refund-policy`, `/cookies`, and `/contact` are publicly reachable.
- A teacher can open `/teacher`, create AI content, save output, and submit support feedback.
- An admin can open `/admin/launch` and `/admin/support`.

## Launch Day Operations

Monitor these every few hours during the first launch week:

- `/admin/launch` readiness score and attention checks.
- `/admin/support` feedback, bugs, and urgent support tickets.
- Pending payment orders from `/admin/orders`.
- Teacher onboarding completion and AI activation.
- OpenAI key availability and credit usage.

## Incident Response

If something breaks:

- Disable public marketing traffic first.
- Check `/api/health`, `/api/ready`, and deployment logs.
- Review `/admin/support` for fresh bug reports.
- Keep paid access conservative: pending payment orders must not grant paid subscriptions until payment verification is active.
- Publish a short support update if teacher-facing flows are affected.

## Go/No-Go Standard

Go when:

- `launch:gate` passes before deployment and `launch:gate:production` passes after deployment.
- Production env is complete.
- Admin can access launch/support boards.
- Teacher signup, login, AI creation, export, save, pricing, checkout review, support, and trust pages are verified.

No-go when:

- `/api/ready` fails.
- Auth or teacher dashboard routing fails.
- Paid plans activate without verified payment.
- Support feedback cannot be captured.
- Legal/trust pages are unreachable.
