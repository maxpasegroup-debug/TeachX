# TeachX Guru Shared Platform Architecture

## Platform Vision

TeachX Guru is the first product frontend on top of a shared education platform. Version 1.0 positions TeachX Guru as the professional AI workspace for teachers.

The platform keeps one shared backend for authentication, RBAC, Prisma models, APIs, marketplace, commerce, payments, AI, notifications, messaging, analytics, resources, scheduling, documents, support, and search.

Future student experiences should become a separate frontend, currently referred to as ClassTutor, while reusing the same shared backend and shared service layer.

## Ownership Model

Use these ownership labels when adding or reviewing frontend code:

- Shared Platform: reusable across TeachX Guru, future ClassTutor, admin operations, and any future frontend.
- Teacher Workspace: TeachX Guru teacher-only product surfaces.
- Future ClassTutor: retained student-facing frontend surfaces that should not be exposed by TeachX Guru public marketing.
- Platform Admin: internal operations and growth dashboards over the shared platform.

Avoid moving files unless a move clearly improves ownership without breaking imports or creating churn.

## Shared Modules

Shared UI:

- `components/ui/*`
- `components/layout/*`
- `components/brand/*`
- `features/auth/*`
- `features/workspace/*`
- `features/launch-intelligence/*`

Shared platform features:

- `features/commerce/*`
- `features/communication/*`
- `features/community/*`
- `features/learning-marketplace/*`
- `features/marketplace/*`
- `features/content/*`
- `features/settings/*`
- `features/setup/*`

Shared services:

- `services/ai-service.ts`
- `services/openai-service.ts`
- `services/commerce-service.ts`
- `services/marketplace-service.ts`
- `services/communication-service.ts`
- `services/community-service.ts`
- `services/notification-service.ts`
- `services/search-service.ts`
- `services/preference-service.ts`
- `services/workspace-service.ts`
- `services/teachx-operating-service.ts`
- `services/storage-service.ts`
- `services/upload-service.ts`
- `services/audit-service.ts`
- `services/automation-service.ts`

Shared route surfaces:

- `/login`
- `/forgot-password`
- `/reset-password`
- `/entry`
- `/profile`
- `/communication`
- `/marketplace`
- `/resources`
- `/offline`
- `/api/*`

## Teacher Modules

TeachX Guru owns the teacher-first frontend:

- `app/page.tsx`
- `app/teachers/page.tsx`
- `app/welcome/page.tsx`
- `app/signup/teacher/page.tsx`
- `app/(app)/teacher/*`
- `features/ai-studio/*`
- `features/teachx/*` when used for teacher operating dashboards and teacher activation

Teacher route classification:

- `/`
- `/teachers`
- `/welcome`
- `/signup/teacher`
- `/teacher`
- `/teacher/ai-studio`
- `/teacher/ai-studio/chat`
- `/teacher/ai-studio/history`
- `/teacher/ai-studio/bookmarks`
- `/teacher/ai-studio/prompts`
- `/teacher/ai-studio/create/[tool]`
- `/teacher/resources`
- `/teacher/marketplace`
- `/teacher/wallet`
- `/teacher/settings`

Teacher product language should emphasize:

- Professional workspace
- Teaching productivity
- AI creation
- Resource management
- Teaching business
- Professional teaching profile
- Marketplace presence
- Teacher community

## Future Student Modules

Student functionality remains intact for future ClassTutor. Do not delete or duplicate it.

Future ClassTutor route classification:

- `/students`
- `/signup/student`
- `/student`
- `/student/ask-ai`
- `/student/homework`
- `/student/practice`
- `/student/flashcards`
- `/student/revision`
- `/student/planner`
- `/student/progress`
- `/student/teachers`
- `/student/resources`
- `/student/purchases`
- `/student/bookmarks`
- `/student/downloads`
- `/student/settings`
- `/learning`
- `/learning/[classroomId]`

Future ClassTutor modules:

- `features/student-ai/*`
- `features/learning/*`
- `services/student-ai-learning-service.ts`
- `services/learning-service.ts`
- `services/student-note-service.ts`
- `services/progress-service.ts`
- `services/bookmark-service.ts`
- student branches inside shared profile, commerce, marketplace, and search services

These modules may keep student language internally because they are not exposed by the TeachX Guru public brand.

## Platform Admin Modules

Platform Admin views remain shared operations surfaces:

- `app/(app)/admin/*`
- `features/admin-growth/*`
- `services/admin-growth-service.ts`
- `features/reports/*`
- `services/operations-report-service.ts`

Admin views may show teachers, students, commerce, marketplace, AI usage, community, and support because they operate across the shared platform.

## Route Classification

Teacher routes:

- Public: `/`, `/teachers`, `/welcome`, `/signup/teacher`
- Protected: `/teacher/*`, `/profile`, `/communication`
- Public marketplace/resource discovery: `/marketplace`, `/resources`

Shared routes:

- Auth: `/login`, `/forgot-password`, `/reset-password`, `/entry`
- Platform: `/api/*`, `/offline`, `/setup`, `/guest-portal`
- Admin: `/admin/*`
- Shared public resource/profile routes: `/marketplace/*`, `/resources/*`

Future ClassTutor routes:

- Public: `/students`, `/signup/student`
- Protected: `/student/*`, `/learning/*`

Do not remove future ClassTutor routes until the separate frontend exists and routing strategy is finalized.

## Ownership Rules

1. Shared services must not depend on TeachX Guru-specific copy or presentation.
2. Teacher Workspace code may use TeachX Guru product language.
3. Future ClassTutor code may retain student learning language but should not be linked from TeachX Guru public navigation.
4. Platform Admin code can reference teachers and students because it manages the shared backend.
5. Do not duplicate backend services for a new frontend.
6. Do not change Prisma models to support frontend brand separation.
7. Prefer adding boundary comments or documentation before moving files.
8. Any future file move must preserve behavior, route protection, and import stability.

## Extension Guidelines

When adding a new module, classify it first:

- If it is reusable infrastructure, place it under shared components, shared features, or `services`.
- If it is teacher-only product UX, place it under `app/(app)/teacher` or a teacher-owned feature.
- If it is student-only product UX, keep it out of TeachX public navigation and classify it as Future ClassTutor.
- If it is operator-facing, place it under admin-growth or admin route surfaces.

Before changing public copy, confirm whether the surface belongs to TeachX Guru or future ClassTutor.

## Future Frontend Strategy

ClassTutor should be introduced as a separate frontend that reuses:

- Shared auth/session handling
- Shared RBAC
- Existing student APIs and services
- Shared commerce and subscription models
- Shared AI usage and conversation models
- Shared marketplace teacher discovery
- Shared resources and downloads
- Shared notifications and communication primitives

The first ClassTutor implementation should route to existing student services rather than duplicating data access. The TeachX Guru repository can continue to host both frontends during transition, but public navigation and SEO must keep brand boundaries clear.

## Current Stabilization Notes

Phase 12 avoids file moves and import churn. The current codebase is ready for multiple frontend boundaries through documentation, public route classification, and ownership comments in central boundary files.
