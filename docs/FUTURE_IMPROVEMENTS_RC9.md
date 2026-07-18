# TeachX Guru Future Improvements After Launch

## Version 1.1 Recommendations

- Add a dedicated 1200x630 Open Graph image for TeachX Guru.
- Convert launch hero imagery to WebP/AVIF and keep PNG fallbacks only if needed.
- Add 192x192, 512x512, and apple-touch PNG icons generated from the final brand mark.
- Replace `next lint` with the ESLint CLI and wire it into CI.
- Add Lighthouse CI against the deployed Railway preview and production URLs.
- Add axe accessibility checks for landing, auth, journey, and entry routes.
- Add Playwright smoke tests for public routes and role-based entry paths.
- Add bundle analysis as a release check.
- Add dependency/security scanning to CI.
- Add production support workflow documentation once `hello@teachx.guru` ownership is finalized.

## Growth Readiness

- Replace sample testimonials with verified customer stories.
- Replace preview metrics with real production analytics once usage data is available.
- Add campaign-specific landing metadata only after launch messaging is finalized.
- Add real social links once brand accounts are active.

## Platform Hardening

- Add image compression checks for new public assets.
- Add route-level monitoring for landing, auth, entry, dashboard, marketplace, resources, and admin.
- Add alerting on `/api/ready` failures.
- Add admin audit review procedures for production operations.
- Add privacy review for public student/profile discoverability before expanding social/community features.
