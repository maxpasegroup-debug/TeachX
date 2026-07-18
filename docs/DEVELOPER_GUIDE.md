# Developer Guide

## Local Workflow

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `DATABASE_URL`, `AUTH_SECRET`, and `AUTH_URL`.
4. Run `npx prisma generate`.
5. Run `npm run dev`.

## Quality Gate

Before merging or deploying, run:

```bash
npx prisma generate
npx prisma validate
npx tsc --noEmit
npm run lint
npm run build
```

## Coding Rules

- Reuse existing services before creating new modules.
- Keep business logic in `services/` or server actions.
- Use `requireApiSession` for API protection.
- Use Prisma relation filters for ownership checks.
- Validate mutating API payloads with Zod.
- Avoid logging secrets, prompts, passwords, tokens, or payment data.
