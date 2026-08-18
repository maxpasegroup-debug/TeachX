# Phase 7 Launch Rehearsal

Status: external smoke-test and launch rehearsal pass

Phase 7 adds a repeatable way to test the deployed app before teachers are invited. Phase 6 verifies that the codebase contains the launch pieces; Phase 7 verifies that a running URL responds correctly.

## Run Local Gates

```bash
npm run launch:gate
```

## Run Deployment Smoke Test

Use the deployed HTTPS URL:

```bash
SMOKE_BASE_URL=https://teachx.guru npm run launch:smoke
```

For final production go/no-go, enforce readiness:

```bash
SMOKE_BASE_URL=https://teachx.guru SMOKE_STRICT_READY=1 npm run launch:smoke
```

On Windows PowerShell:

```powershell
$env:SMOKE_BASE_URL="https://teachx.guru"; $env:SMOKE_STRICT_READY="1"; npm run launch:smoke
```

The smoke test checks:

- public launch pages
- trust/legal pages
- `robots.txt`
- `sitemap.xml`
- `/.well-known/security.txt`
- `/api/health`
- `/api/version`
- `/api/ready`
- protected teacher/admin/API routes redirect or deny when logged out
- security headers on the root response

## Manual Rehearsal

Complete this after smoke test passes:

- Sign up as a teacher.
- Open Teacher Home and confirm Simple Mode is understandable.
- Generate one lesson, one worksheet, and one quiz.
- Save one AI output to a library.
- Export or copy an AI output.
- Open Pricing and create a paid checkout review order.
- Confirm paid access is not granted before payment verification.
- Submit teacher support feedback.
- Log in as admin and confirm `/admin/launch` and `/admin/support` show the signal.

## Launch Room Rhythm

During the first live cohort:

- Check `/admin/launch` every morning and evening.
- Triage `/admin/support` twice daily.
- Watch failed signups, urgent bugs, pending paid orders, and AI activation.
- Keep teachers on the Free or Rural Starter path until payment webhooks are fully verified.

## Go Decision

Go when:

- `launch:gate` passes locally.
- `launch:gate:production` passes against production.
- Manual teacher and admin rehearsal pass.
- Legal/trust pages are public.
- Support feedback reaches admins.

Pause launch when:

- `/api/ready` is failing.
- auth redirects are broken.
- protected pages are public.
- checkout grants paid access before verified payment.
- support feedback is not reaching `/admin/support`.
