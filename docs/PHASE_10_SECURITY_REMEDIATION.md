# Phase 10: Security Remediation

Phase 10 establishes the security baseline required before global production traffic is enabled.

## Production controls

- Next.js, Auth.js, Prisma, and PostCSS are pinned to audited compatible versions.
- Private API routes are denied at the request boundary when no valid session exists.
- Public API routes are maintained in `security/api-route-policy.json` and audited on every release.
- API requests declaring a body larger than 1 MB are rejected before route execution.
- Authentication, setup, AI, communication, and launch-intelligence abuse controls use Redis-backed counters.
- Production fails closed when Redis protection is unavailable.
- The setup wizard requires `SETUP_SECRET` and takes a database advisory lock to prevent concurrent first-admin creation.
- Rate-limit identifiers are SHA-256 hashed before storage.
- Production CSP excludes `unsafe-eval`.

## Railway requirements

Set `REDIS_URL` and a randomly generated `SETUP_SECRET` of at least 32 characters in addition to the existing required variables. Complete first-run setup once, then rotate `SETUP_SECRET` so the original value is no longer usable.

## Release commands

```powershell
npm run security:audit
npm run security:routes
npm run security:test
npm run launch:gate
```

The launch gate must be green before deployment. After deployment, run the strict production gate with `SMOKE_BASE_URL` set to the HTTPS production origin.
