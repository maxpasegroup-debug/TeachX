# TeachX isolated QA environment

This environment is only for authenticated automated QA. Never point these commands at production or a database containing real users.

## Required isolated services

Provision both services outside the production environment:

1. An empty PostgreSQL 16 database named `teachx_qa` or `teachx_qa_<purpose>`, owned by a dedicated QA user.
2. A disposable Redis instance used only by QA authentication rate limiting.

The current machine has neither PostgreSQL nor Docker, so these services must be installed locally or provisioned as separate non-production services. The GitHub Actions QA job creates disposable PostgreSQL and Redis service containers automatically.

## Local configuration

Create `.env.qa.local` from `.env.qa.example` and replace every placeholder. The file is ignored by Git.

Required variables:

- `QA_DATABASE_URL`: dedicated QA PostgreSQL URL. Its database name must match the guarded naming convention.
- `QA_DATABASE_CONFIRM=TEACHX_QA_ONLY`
- `QA_DATABASE_INITIALIZE=true`: permits marking an empty database during first preparation only.
- `QA_ALLOW_DATABASE_WRITES=true`
- `QA_REDIS_URL`: dedicated QA Redis URL.
- `AUTH_SECRET`: QA-only value containing at least 32 characters.

Optional comparison variables:

- `PRODUCTION_DATABASE_URL`: when supplied, the guard rejects an identical host, port and database name.
- `PRODUCTION_REDIS_URL`: when supplied, the test runner rejects an identical Redis URL.

Do not copy production credentials into this file.

## Safety model

Before any schema or test write, the guard verifies:

- PostgreSQL protocol and a dedicated QA database name.
- Explicit confirmation and write acknowledgement.
- `NODE_ENV` is not `production`.
- QA and production database identities differ when the production comparison URL is supplied.
- The connected database name matches the URL.
- A PostgreSQL database comment equals `TEACHX_QA_ONLY`.
- A database without that marker is completely empty before initialization.

An unmarked non-empty database is always rejected.

## Prepare the database

```powershell
npm run qa:db:prepare
```

After the first successful preparation, set `QA_DATABASE_INITIALIZE=false`. Repeat runs continue to work because the database already carries the verified QA marker.

For a new QA database, preparation safely:

1. Verifies the empty database and writes the QA database comment.
2. Runs the complete checked-in migration chain with `prisma migrate deploy`.
3. Re-verifies the QA marker and resulting schema.

Preparation is repeatable. It never runs `db push`, `migrate resolve`, `migrate reset`, `--force-reset`, or `--accept-data-loss`.

Verify without changing schema:

```powershell
npm run qa:db:verify
```

## Run QA-001

After preparation:

```powershell
npm run test:qa
```

The runner re-verifies isolation, generates Prisma Client, builds the production application against the QA services, and runs the authenticated QA-001 Playwright suite on desktop and mobile. Test records use `qa001-` identifiers and are deleted after execution.
