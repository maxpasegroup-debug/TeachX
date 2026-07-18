# TeachX Guru RC9 Known Limitations

## Measurement

- Lighthouse numeric scores were not captured locally because Lighthouse tooling is not installed in the workspace.
- Final Core Web Vitals need to be measured against the deployed Railway URL.
- Real-device PWA install behavior needs browser/device QA.

## Assets

- The hero teacher and student PNG assets are high quality but large. Convert approved final artwork to WebP/AVIF for v1.1.
- Social sharing metadata currently points to the SVG app icon. A dedicated 1200x630 launch image should be added before broad public campaigns.
- Manifest currently uses an SVG icon. Add generated PNG icon sizes for stricter PWA/device compatibility.

## Public Content

- Testimonials are sample testimonials and are clearly labeled.
- Preview metrics are qualitative launch signals, not production usage statistics.
- Social links are placeholders.

## Tooling

- The project still uses `next lint`. Next.js has deprecated this path, so v1.1 should move linting to the ESLint CLI.
- CI is not documented as enforcing Lighthouse, axe, dependency audit, or browser smoke checks yet.

## Integrations

- Payment providers, live payouts, realtime messaging, push notifications, email provider wiring, WhatsApp provider wiring, and storage providers remain architecture-ready placeholders unless separately configured.
- Offline support is an app-shell fallback, not offline-first dashboard data.
