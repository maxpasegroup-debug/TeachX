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
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`: reserved for future live payments.
- `STRIPE_SECRET_KEY`: reserved for future live payments.
- `EMAIL_PROVIDER`, `WHATSAPP_PROVIDER`, `STORAGE_PROVIDER`: provider placeholders.

Production readiness checks:

- `/api/health` confirms the app process is reachable.
- `/api/ready` confirms database connectivity and required production variables.
- `/api/version` returns package version and deployment commit when the platform provides one.

No API keys should be committed to the repository.
