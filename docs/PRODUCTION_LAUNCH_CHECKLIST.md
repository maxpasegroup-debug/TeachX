# Production Launch Checklist

## Required

- `DATABASE_URL` points to the production PostgreSQL database.
- `AUTH_SECRET` is a long random secret and differs from local/demo values.
- `AUTH_URL` and `NEXT_PUBLIC_APP_URL` point to the public HTTPS domain.
- `npx prisma generate` passes.
- `npx prisma validate` passes.
- `npx tsc --noEmit` passes.
- `npm run lint` passes.
- `npm run build` passes.
- `/api/health` returns healthy.
- `/api/ready` returns ready.
- First admin setup is complete or production seed data is intentionally applied.

## Before Public Marketing

- Replace demo users and demo passwords.
- Configure support ownership and moderation process.
- Decide whether `OPENAI_API_KEY` is enabled at launch.
- Keep Razorpay, Stripe, payouts, video, realtime messaging, and push integrations disabled until provider onboarding is complete.
- Review robots and sitemap for public pages.
