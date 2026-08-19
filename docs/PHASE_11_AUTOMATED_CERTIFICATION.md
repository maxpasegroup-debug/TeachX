# Phase 11: Automated Launch Certification

Phase 11 turns launch quality from a manual promise into repeatable release evidence.

## Enforced coverage

- Playwright verifies public launch pages on desktop and mobile Chromium.
- Protected pages must redirect to login and protected APIs must return `401` without a session.
- Runtime checks verify security headers, request IDs, health availability, and oversized-body rejection.
- axe-core scans landing, pricing, trust, login, and teacher/student signup against WCAG A and AA rules.
- Lighthouse CI enforces minimum scores of 90 performance and 95 accessibility, best practices, and SEO.
- GitHub Actions runs static and browser quality jobs for pull requests and changes to `main`.
- Failure traces, screenshots, video, Playwright HTML, and Lighthouse reports are retained as CI artifacts.

## Commands

```powershell
npm run test:e2e
npm run test:a11y
npm run quality:lighthouse
npm run quality:gate
```

Run `npx playwright install chromium` once on a new development machine. CI installs its own isolated browser.

## Deployment certification

The local quality gate certifies the built release candidate. After Railway deployment, run the browser suite with `PLAYWRIGHT_BASE_URL` set to the HTTPS production origin and run the strict production launch gate with `SMOKE_BASE_URL` set to the same origin.
