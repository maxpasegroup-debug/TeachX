# TeachX Guru RC9 Deployment Checklist

## Pre-Deploy

- Confirm `DATABASE_URL` points to the production PostgreSQL database.
- Confirm `AUTH_SECRET` is a strong production-only secret.
- Confirm `AUTH_URL` uses the public HTTPS domain.
- Confirm `NEXT_PUBLIC_APP_URL` uses `https://teachx.guru`.
- Confirm optional launch values: `NEXT_PUBLIC_APP_TITLE`, `NEXT_PUBLIC_APP_DESCRIPTION`, `OPENAI_API_KEY`, `OPENAI_MODEL`.
- Keep live payment, payout, realtime, push, email, WhatsApp, and storage providers disabled unless their production onboarding is complete.
- Run `npm ci` or `npm install` in the deployment environment.
- Run `npx prisma generate`.
- Run `npx prisma validate`.
- Run migrations with `npx prisma migrate deploy` when migration files are the source of truth.
- Run `npx tsc --noEmit`.
- Run `npm run lint`.
- Run `npm run build`.

## Railway

- Build command: `npm run build`
- Start command: `npm run start`
- Liveness probe: `/api/health`
- Readiness probe: `/api/ready`
- Version probe: `/api/version`
- Confirm Railway exposes `RAILWAY_GIT_COMMIT_SHA` for `/api/version` commit visibility.

## Post-Deploy Smoke Test

- Open `/` and verify landing hero, trust bar, FAQ, final CTA, and footer.
- Open `/welcome` and verify Teacher and Student journey links.
- Open `/login`, `/signup/teacher`, `/signup/student`, `/forgot-password`, and `/reset-password`.
- Sign in as teacher and verify entry transition reaches the teacher workspace.
- Sign in as student and verify entry transition reaches the student workspace.
- Sign in as admin and verify protected admin access.
- Open `/marketplace` and `/resources`.
- Open `/offline` directly.
- Open a missing route and verify the branded 404 page.
- Verify `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/api/health`, `/api/ready`, and `/api/version`.

## Browser Certification

- Run Lighthouse against the deployed URL.
- Target Performance 95+.
- Target Accessibility 95+.
- Target Best Practices 95+.
- Target SEO 95+.
- Run keyboard-only navigation on desktop and mobile viewport sizes.
- Run responsive checks at 1440, 1280, 1024, 768, 430, and 390 pixel widths.
- Run PWA installability checks in Chrome.

## Launch Approval

- Replace demo users and demo passwords.
- Confirm sample testimonials remain labeled until real testimonials exist.
- Confirm preview metrics remain labeled until production metrics exist.
- Confirm Open Graph preview works on major social platforms.
- Confirm support contact ownership for `hello@teachx.guru`.
- Confirm rollback plan and database backup process.
