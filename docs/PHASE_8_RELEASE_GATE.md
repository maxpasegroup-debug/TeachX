# Phase 8 Release Gate

Status: final release-control package

Phase 8 turns the launch work into one repeatable decision. It does not claim that an undeployed environment is production-ready; it proves the repository locally and then requires strict checks against the real HTTPS deployment.

## One-Command Local Gate

Run before deployment:

```bash
npm run launch:gate
```

This runs launch structure verification, Prisma validation, TypeScript, lint, and a production build. Any failure stops the gate immediately.

## One-Command Production Gate

Deploy the exact commit, then run against its public HTTPS URL.

macOS/Linux:

```bash
SMOKE_BASE_URL=https://teachx.guru npm run launch:gate:production
```

Windows PowerShell:

```powershell
$env:SMOKE_BASE_URL="https://teachx.guru"; npm run launch:gate:production
```

Production mode refuses a missing, invalid, or non-HTTPS URL and forces strict `/api/ready` verification.

## Release Evidence

Record these together for every deployment:

- package version and commit from `/api/version`
- local gate result
- strict production gate result
- database backup identifier and restore owner
- teacher rehearsal owner and result
- admin rehearsal owner and result
- final go/no-go owner and timestamp

The machine-readable release contract is in `release/manifest.json`. Version drift between that file and `package.json` fails `launch:verify`.

## Final Manual Sign-Off

After the automated production gate passes:

- Create a new teacher account using the public signup flow.
- Generate, save, export, and reopen one teaching resource.
- Verify Simple Mode and Teacher Help on a mobile-width screen.
- Submit a support request and confirm it appears for an admin.
- Review pricing and checkout; verify no paid entitlement is granted without confirmed payment.
- Confirm an admin can open launch readiness, support, orders, and system health.
- Verify privacy, terms, refund, security, cookies, trust, and contact pages from the public footer.

## Go/No-Go Rule

Go only when both automated gates pass, the manual sign-off passes, the database backup is restorable, production secrets are present, and an incident owner is available.

Stay no-go when any rollback trigger in `release/manifest.json` is active. Payment webhooks, refunds, and tax invoices must be verified before paid plans are publicly enabled.

## Rollback Procedure

1. Stop new marketing traffic and paid-plan promotion.
2. Preserve logs, failing request IDs, support reports, deployment commit, and database state.
3. Roll application code back to the last production commit that passed the production gate.
4. Do not reverse a database migration until its compatibility and data-loss impact are understood. Prefer deploying compatible application code forward.
5. Re-run `/api/health`, `/api/ready`, authentication, teacher creation, and protected-route checks.
6. Run `launch:gate:production` against the restored deployment before reopening traffic.
7. Document impact, resolution, owner, and follow-up work in the release record.

## First 72 Hours

Check launch readiness, support, auth failures, AI failures, pending orders, and readiness probes at least morning and evening. Urgent security, data-access, payment-entitlement, or widespread teacher-workflow issues trigger an immediate pause and rollback assessment.

