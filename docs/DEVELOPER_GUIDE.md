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
## Architecture Guardrails

- Keep route files thin: validate request/session context, call a service or server action, and return the result.
- Reuse `components/ui` primitives for standard controls and loading, empty, and error states.
- Do not add a service, hook, DTO, or type when an equivalent owner already exists; extend the existing owner instead.
- Prefer feature-local components for single-workspace composition and shared components only for behavior used by multiple features.
- Do not move files merely to satisfy a folder pattern. Move code only when ownership is demonstrably wrong and imports remain acyclic.
- Preserve public URLs, API payloads, RBAC checks, database schema, and server-action semantics during refactors.