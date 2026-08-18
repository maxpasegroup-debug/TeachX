# TeachX

Commercial Release Candidate `1.0.0-rc.1` for TeachX.

TeachX is an AI powered education platform built around one promise: Learn, Teach, Earn. It is positioned as a premium teaching and learning companion, not an ERP, LMS, or school management system.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- NextAuth credential authentication
- Centralized OpenAI service

## Included Workspaces

- Teacher
- Student
- Platform Admin
- Future modules preserved behind the existing architecture

## Setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, and `NEXT_PUBLIC_APP_URL`.
3. Run `npm install`.
4. Run `npx prisma generate`.
5. Run `npx prisma migrate deploy` for production, or `npx prisma db push` for a clean prototype database.
6. Run `npm run build`.
7. Run `npm run launch:gate`.
8. Run `npm run start`.

For an empty database, open `/setup` to create the first institution and administrator.

Production probes:

- `/api/health`: lightweight liveness check.
- `/api/ready`: database and required environment readiness check.
- `/api/version`: release metadata for deployment verification.
- `/api/status`: sanitized public component health.

Launch operations:

- `/admin/launch`: authenticated launch readiness board.
- `/teacher/support`: teacher support and feedback entry point.
- `/api/launch/readiness`: protected readiness API for administrators.
- `npm run launch:verify`: local launch gate for required routes, headers, scripts, and documented environment variables.
- `npm run launch:smoke`: deployed URL smoke test. Set `SMOKE_BASE_URL=https://your-domain` before running. Use `SMOKE_STRICT_READY=1` for final production go/no-go.
- `npm run launch:gate`: complete local release gate: structure, database schema, types, lint, and production build.
- `npm run launch:gate:production`: complete gate plus strict smoke testing against the HTTPS `SMOKE_BASE_URL`.
- `npm run launch:monitor`: strict one-shot production monitor using `MONITOR_BASE_URL`.

## Demo Data

Run `npx prisma db seed` to load the demo institution.

Demo password: `Password123`

Common demo users:

- `admin@demo.edu`
- `director@demo.edu`
- `academic@demo.edu`
- `teacher@demo.edu`
- `student1@demo.edu`
- `parent@demo.edu`
- `accounts@demo.edu`
- `bde@demo.edu`
- `reception@demo.edu`
- `video@demo.edu`
- `partner@demo.edu`

## Documentation

See the `docs` directory for administrator, teacher, student, deployment, environment, launch runbook, Phase 8 release gate, and preserved future-module notes. Release changes are recorded in `CHANGELOG.md`.
