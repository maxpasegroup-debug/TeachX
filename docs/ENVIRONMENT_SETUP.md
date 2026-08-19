# Environment Setup

Required variables:

- `DATABASE_URL`: PostgreSQL connection string.
- `AUTH_SECRET`: long random secret for sessions.
- `AUTH_URL`: deployed application URL.
- `NEXT_PUBLIC_APP_URL`: public canonical application URL used by metadata, sitemap, and robots.

Optional variables:

- `NEXT_PUBLIC_APP_TITLE`: browser/application fallback title.
- `NEXT_PUBLIC_APP_DESCRIPTION`: metadata fallback description.
- `OPENAI_API_KEY`: enables live AI calls.
- `OPENAI_MODEL`: defaults to `gpt-4.1-mini`.
- Razorpay and Stripe keys plus webhook secrets enable the verified Phase 14 payment flows.
- `EMAIL_PROVIDER=resend`, Resend credentials, sender addresses, and email readiness controls enable Phase 15 transactional delivery.
- `WHATSAPP_PROVIDER` remains optional. Global launch requires the `STORAGE_*` S3-compatible private object storage variables and control attestations documented in `.env.example`.
- Run `npm run storage:cleanup` from a Railway cron service at least hourly. Run `npm run storage:verify` after an authenticated production upload and download, and refresh the three `STORAGE_*_TESTED_AT` values after every drill.
- Configure Phase 17 multipart and resilience variables, run the real-device/interruption drill in `docs/PHASE_17_LOW_CONNECTIVITY_RESILIENCE.md`, then run `npm run resilience:verify` with `SMOKE_BASE_URL` set to the HTTPS deployment.
- Set the Phase 18 default locale and time zone, complete the keyboard, RTL, zoom, contrast, and reduced-motion drill in `docs/PHASE_18_GLOBALIZATION_ACCESSIBILITY.md`, then run `npm run globalization:verify`. The three globalization evidence timestamps expire after 30 days.
- Configure Phase 19 latency, load, and Prisma pool budgets. Add matching `connection_limit` and `pool_timeout` parameters to `DATABASE_URL`, apply the scale-index migration, complete the deployed load drill, and run `npm run performance:verify`.
- Configure Phase 20 primary and secondary on-call ownership, alert destination, incident channel, SLO budgets, and evidence timestamps. Complete the incident/status/rollback drill in `docs/PHASE_20_PRODUCTION_OPERATIONS.md`, then run `npm run operations:verify`.
- Keep `OPERATIONS_WRITE_FREEZE=false`. During a confirmed incident, incident command may set it to `true` and redeploy to reject user mutations with `503` while health, authentication, payment webhooks, and email webhooks continue.

## Teacher SMS Authentication

- Set `SMS_PROVIDER=twilio` and `SMS_LIVE=true` in production.
- Set `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`.
- Prefer `TWILIO_MESSAGING_SERVICE_SID` for global sender selection. Otherwise set `TWILIO_FROM_NUMBER` to an SMS-capable E.164 sender.
- Register required sender identities and message templates in each launch country. India traffic requires an approved domestic sender and template configuration with the SMS provider.
- Keep `REDIS_URL` configured. Production OTP and login actions fail closed when distributed rate limiting is unavailable.
- Development defaults to the console SMS provider and displays the one-time code only outside production.
- Configure Phase 21 privacy ownership, rights SLA, retention/vendor/transfer controls, and evidence timestamps. Apply the privacy migration, complete the rights and cookie drill in `docs/PHASE_21_GLOBAL_PRIVACY_GOVERNANCE.md`, and run `npm run privacy:verify`.

Production readiness checks:

- `/api/health` confirms the app process is reachable.
- `/api/ready` confirms database connectivity and required production variables.
- `/api/version` returns package version and deployment commit when the platform provides one.

No API keys should be committed to the repository.
