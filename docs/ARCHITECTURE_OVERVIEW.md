# TeachX Architecture Overview

TeachX is a production SaaS application built with Next.js App Router, React, TypeScript, Tailwind CSS, PostgreSQL, Prisma, NextAuth, and the OpenAI SDK.

## Core Boundaries

- `app/`: App Router pages, layouts, route handlers, metadata, PWA routes, and API endpoints.
- `features/`: workspace-specific UI and server actions.
- `services/`: reusable business services for AI, commerce, marketplace, content, communication, admin growth, and operations.
- `lib/`: shared infrastructure such as Prisma, RBAC, route permissions, API auth, security helpers, formatting, and runtime environment checks.
- `components/`: shared layout and UI primitives.
- `prisma/`: schema and seed data.
- `docs/`: launch, deployment, and role guides.

## Access Model

Authentication is handled by NextAuth credentials with JWT sessions. Middleware protects application routes through route permission mapping and role permissions. API routes use `requireApiSession` for session and permission checks. Server actions perform their own role and ownership validation.

## Data Model

The platform uses one PostgreSQL database through Prisma. Existing models cover users, profiles, RBAC, learning, content, AI usage, commerce, marketplace, communication, notifications, audit logs, settings, support, feature flags, and platform metrics.

## Production Operations

Railway should use `/api/health` for liveness and `/api/ready` for readiness. The app exposes `/api/version` for release verification. PWA assets, robots, sitemap, Open Graph, Twitter metadata, and an offline shell are included.
