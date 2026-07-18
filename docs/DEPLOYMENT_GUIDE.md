# Deployment Guide

## Requirements

- Node.js 20+
- PostgreSQL 15+
- npm

## Steps

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, and `NEXT_PUBLIC_APP_URL`.
3. Optional: set `OPENAI_API_KEY`, `OPENAI_MODEL`, payment placeholders, communication provider placeholders, and storage provider placeholders.
4. Run `npm install`.
5. Run `npx prisma generate`.
6. Run `npx prisma migrate deploy` when migrations are available, or `npx prisma db push` for prototype environments.
7. Run `npm run build`.
8. Start with `npm run start`.

## Railway

- Build command: `npm run build`
- Start command: `npm run start`
- Liveness probe: `/api/health`
- Readiness probe: `/api/ready`
- Release verification: `/api/version`

Use `npx prisma migrate deploy` when migration files are present. For a fresh preview database without migrations, `npx prisma db push` may be used intentionally.

## First Run

Open `/setup` on an empty database. The wizard creates the first institution, academic year, branch, course, fee head, and administrator.

## Demo Data

Run `npx prisma db seed` to load the demo institution and showcase data.
