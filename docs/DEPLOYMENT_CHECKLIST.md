# TeachX Guru Deployment Checklist

## Environment

- Set `DATABASE_URL` to the production PostgreSQL database.
- Set `AUTH_SECRET` to a long random production-only secret.
- Set `AUTH_URL` to `https://teachx.guru`.
- Set `NEXT_PUBLIC_APP_URL` to `https://teachx.guru`.
- Confirm optional provider placeholders are either configured or intentionally disabled.
- Keep demo credentials out of production.

## Railway

- Build command: `npm run build`
- Start command: `npm run start`
- Liveness endpoint: `/api/health`
- Readiness endpoint: `/api/ready`
- Version endpoint: `/api/version`

## Quality Gate

- `npx prisma generate`
- `npx prisma validate`
- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

## Public URL Checks

- Landing page loads over HTTPS.
- Login and signup flows render.
- Teacher and student redirects land in the correct workspace.
- `/offline` renders.
- `/robots.txt`, `/sitemap.xml`, and `/manifest.webmanifest` render.
- `/api/health`, `/api/ready`, and `/api/version` respond correctly.
- Lighthouse scores meet or exceed 95 for Performance, Accessibility, Best Practices, and SEO.

## Launch Controls

- Confirm AI provider enablement decision.
- Confirm marketplace premium purchases remain gated until payment providers are live.
- Confirm Razorpay, Stripe, payouts, realtime messaging, video, and push providers remain disabled until provider onboarding is complete.
- Confirm support, moderation, privacy, and incident ownership.
