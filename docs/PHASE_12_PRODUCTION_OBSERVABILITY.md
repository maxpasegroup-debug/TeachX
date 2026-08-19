# Phase 12: Production Observability

Phase 12 connects runtime failures and performance to privacy-safe operational evidence.

## Railway variables

Required for runtime capture:

- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_ENVIRONMENT=production`
- `NEXT_PUBLIC_SENTRY_ENVIRONMENT=production`
- `SENTRY_TRACES_SAMPLE_RATE=0.1`
- `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.05`

Required during the Railway build for readable stack traces:

- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_AUTH_TOKEN`

Railway's `RAILWAY_GIT_COMMIT_SHA` is used as the server release identifier. `NEXT_PUBLIC_SENTRY_RELEASE` may be set to the same commit when a browser release identifier is required.

## Privacy boundary

- Default PII collection is disabled.
- Session replay is not installed or enabled.
- UI input breadcrumbs are discarded.
- Cookies, request bodies, query strings, user identity, authorization headers, credentials, emails, passwords, phone values, secrets, sessions, and tokens are removed or redacted before transmission.
- Structured logs contain bounded operational context only. Do not add AI prompts, communication bodies, form payloads, uploaded content, names, emails, or phone numbers to log context.

## Coverage

- Next.js request failures and React error boundaries
- Node and edge runtime exceptions
- Browser navigation performance
- Prisma query spans
- Redis rate-limit spans
- Critical AI failures with feature, scope, and request ID only
- Database readiness failures in structured Railway logs

Every proxied request receives an `X-Request-Id`. A valid incoming request ID is propagated to the route handler and returned in the response so support, Railway, and Sentry evidence can be correlated.

## Alerts

Create these Sentry alerts before public traffic:

1. New unresolved error: notify the launch channel immediately.
2. Error count: at least 10 events in five minutes for the same issue is `SEV-2`.
3. Authentication, authorization, entitlement, or data-isolation error: any confirmed event is `SEV-1`.
4. API p95 duration above 2 seconds for ten minutes is `SEV-2`.
5. AI request failure rate above 5% for ten minutes is `SEV-2`.
6. Regression introduced by the current release: assign to the release owner immediately.

Keep the Phase 9 external availability monitor. Sentry detects application behavior; the external monitor detects a platform that cannot report its own failure.

## Verification

```powershell
npm run observability:audit
npm run observability:test
npm run quality:gate
```

After deployment, sign in as an administrator and open `/api/observability/readiness`. It must report server capture, browser capture, and source maps as `true`. Confirm one controlled test event in the Sentry project before enabling global traffic, then remove the test issue.
