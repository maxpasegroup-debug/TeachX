# LearnX Guru L13 — Unified Experience Brief

## Objective
Finalize the existing LearnX student product as one connected operating system. Integrate completed L01–L12 modules; do not redesign, alter authentication, change TeachX business logic, or introduce a new business domain.

## Visual direction
Preserve the existing LearnX visual language: calm indigo/cyan learning surfaces, rounded cards, soft borders, restrained gradients, and the shared type scale. This is an integration pass, not a new theme. Reuse current UI primitives and responsive breakpoints.

## Required information architecture
- Student shell navigation exposes every completed destination once: Home, AI, Journey, Courses, Practice, Assignments, Analytics, Gamification, Marketplace, Community, Files, Profile, Settings.
- `/student/search`: student-scoped global search across courses, lessons/content, AI chats, notes, flashcards, practice questions/tests, community, marketplace, and downloads. Results must be authorized, linked to real destinations, categorized, searchable, filterable, and have loading/no-result/error recovery states.
- `/student/notifications`: one student inbox aggregating existing `Notification` records and institution announcements with category/status filters, read/archive actions, deep links, and meaningful empty state.
- `/student/timeline`: chronological aggregation of course progress, AI learning, practice, assignments, achievements, purchases, and community activity using actual stored records only.
- `/student/files`: unified read/search/filter hub for downloads, uploaded assignment attachments, notes, bookmarks, certificates/achievements, purchased resources, AI-generated/saved files, and study materials. Never expose files the student cannot access.
- `/student/profile`: one read-only summary plus links to existing editable academic identity, goals, preferences, connections, and settings. Include journey/practice/achievement/marketplace/community/institution/parent connection summaries.
- `/student/settings`: consolidate existing foundation settings and platform preferences into Account, Appearance, Language, Notifications, Privacy, Security, Accessibility, Downloads, AI, and Learning sections. Persist through existing profile/preference models. Do not duplicate auth or imply unsupported credential changes.

## Unified dashboard
Treat the existing dirty L02 dashboard files as prior user work. Preserve their intent, correct encoding and dead links, and intentionally complete them as the unified dashboard:
- next best action, journey/goal progress, practice/analytics, AI continuation, calendar/assignments, achievements, marketplace/community, notification preview;
- all widgets deep-link to real routes;
- use actual service data and intelligent empty states;
- dashboard widget preferences remain editable.

## Integration rules
- Prefer a single student platform aggregation service and a compact set of student-platform components/actions.
- Reuse existing phase services and Prisma models; do not add duplicate schema models.
- All queries must be student-scoped and institution-scoped where applicable.
- Avoid N+1 queries and unbounded results.
- Notification state mutations must verify ownership or institution broadcast visibility.
- Search must not expose admin/teacher records or links.
- Timeline must label source and date and support source/date filtering.
- Navigation must contain no dead route or duplicate destination.
- Redirect aliases are acceptable for backward compatibility.
- Add loading/error states for new major routes; use existing root student error boundary where appropriate.
- Offline messaging must honestly explain loss of connection and provide retry/recovery rather than pretend offline mutation support.

## Scope
Allowed: student routes, student features/services/actions, student navigation entries, and narrowly scoped shared command-bar behavior needed to make student search useful.
Forbidden: TeachX feature logic, shared authentication, new commerce/community/assessment domains, broad UI redesign, temporary mock/demo data, placeholder screens.

## Validation
Run Prisma validation/generation if schema client use changes, `npx tsc --noEmit`, `npm run lint`, and `npm run build`. Audit all student navigation hrefs against the route tree and remove mojibake/placeholder copy in the touched LearnX surface.
