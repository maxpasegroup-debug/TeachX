# TeachX P17 Master End-to-End QA Report

Date: 2026-08-22  
Scope: TeachX teacher product, public experience, canonical APIs/actions, security boundaries, responsive behavior, and launch gates. LearnX and DirectorX were not modified.

## 1. Overall status

**MASTER QA STATUS: ORANGE**

The audited code is stable enough to deploy to a production-configured staging environment. No known RED code defect remains. It is **not yet safe to invite real teachers today** because production configuration and live provider evidence are absent, and a standalone teacher still cannot create a real class/student roster from the teacher UI.

- Code/build status: PASS
- Public and anonymous security status: PASS
- Static authorization and tenant regression status: PASS
- Local desktop/mobile browser status: PASS
- Production configuration status: BLOCKED
- Full authenticated real-provider journey status: BLOCKED
- Current controlled-beta recommendation: **NO**

## 2. Audit coverage

| Inventory | Measured result |
|---|---:|
| Product capabilities audited | 74 |
| Named end-to-end journeys audited | 12 |
| Page routes inventoried | 162 |
| API routes audited by policy gate | 127 |
| API policy checks | 276/276 PASS |
| Server-action files inventoried | 51 |
| Services inventoried | 126 |
| Prisma models inventoried | 180 |
| TSX components inventoried | 379 |
| Teacher-facing button references inspected | 108 |
| Teacher-facing forms inspected | 82 |
| Teacher-facing links inspected | 252 |
| Exported teacher server actions inspected | 67 |

The product map was traced as UI -> form/link -> route or server action -> service -> Prisma model -> resulting UI state. The audit found one orphan exported teacher action (`deleteCommunityNotificationAction`) and one unused planner export boundary; neither is a launch blocker because no production UI depends on them.

## 3. Automated results

| Gate | Result |
|---|---|
| `npx prisma generate` | PASS |
| `npx prisma validate` | PASS |
| `npx tsc --noEmit` | PASS |
| `npm run lint` | PASS: 0 errors, 118 existing warnings |
| `npm run build` | PASS: 242 routes/pages generated |
| All Node regression tests | PASS: 158/158 |
| P17 focused regressions | PASS: 11/11 |
| Playwright desktop/mobile | PASS: 94/94 |
| P17 viewport checks | PASS: 360, 390, 414, 768, 1280 px |
| Launch verification | PASS: 312/312 |
| Launch smoke | PASS: 26/26 |
| Local release gate | PASS |
| Production dependency audit | PASS: 0 vulnerabilities |
| Production strict release gate | BLOCKED: Railway/provider evidence unavailable |

The 118 lint warnings predate P17 and include files under DirectorX and LearnX that this phase expressly could not change. There are no lint errors.

## 4. Desktop test result

**PASS for public and anonymous authorization flows.** Public pages, pricing, signup, login, trust, not-found handling, security headers, protected redirects, privacy UI, and accessibility checks pass in Chromium. Authenticated data workflows require a real database and provider-backed test accounts and are therefore not represented as browser PASS.

## 5. Mobile test result

**PASS for tested surfaces.** The 360, 390, 414, and 768 px checks found no horizontal overflow on the public, signup, login, pricing, trust, and protected-route journeys. The PWA first-install reload defect discovered by this audit was fixed and the full suite subsequently passed 94/94.

## 6. Security and tenant-isolation result

**PASS at code and regression level; live two-tenant attack simulation remains configuration-blocked.**

P17 hardened:

- Active teacher-role verification before canonical AI execution.
- Explicit institution scope for teacher workspace data, AI conversations, notifications, downloads, and purchases.
- Institution scope for owned and broadcast notification reads/mutations.
- Institution scope for AI conversation search.
- Course/subject ownership validation and safe URL handling on teacher resources.
- Canonical server-side marketplace price, currency, license, and listing validation.
- Public profile photos restricted to active, explicitly listed professional profiles.
- Malformed and unsupported preference writes rejected at the API boundary.
- Public teacher favorites and bookings reject nonexistent profiles, self-booking, and invalid dates.

Unauthorized APIs continue to fail closed, and no frontend-only authorization was accepted as evidence.

## 7. AI and TARA result

**PASS at architecture/regression level; live provider execution BLOCKED.** TARA and AI Studio share the canonical AI service, subscription entitlement, credit balance, tenant context, and safe error mapping. A teacher cannot select another AI scope to bypass credit enforcement. Provider/internal failures are no longer surfaced as raw teacher-facing messages.

Live OpenAI generation, timeout, malformed-provider response, credit exhaustion, and provider recovery must be rerun after Railway AI configuration.

## 8. Subscription and payment result

**PASS at policy/regression level; live money movement BLOCKED.** Paid access remains webhook-authoritative. Browser actions cannot activate premium access. Signature validation, idempotency, failure, cancellation, and refund rules pass regression checks. The legacy learning-resource purchase flow now ignores hidden client amounts and resolves canonical active-listing price and currency on the server.

No live payment should be enabled until provider webhooks, tax, reconciliation, cancellation, duplicate-event, and refund evidence pass in production.

## 9. Feature completeness matrix

| Feature group | Expected behavior | Actual behavior | Status |
|---|---|---|---|
| Public website and CTA | Visitor understands product and reaches canonical signup | Routes and CTA verified at five widths | PASS |
| Teacher signup | Verified teacher, tenant, profile, trial, usable workspace | Transaction now also creates a personal teaching library course/subject | PASS |
| Login/PIN/OTP | Secure mobile authentication and recovery | Code/regressions pass; live Twilio blocked | INCOMPLETE |
| Four Pillars | All canonical destinations remain reachable | Route and navigation regressions pass | PASS |
| TARA/AI Chat | Tenant-aware, entitled, contextual generation | Canonical authorization fixed; live provider blocked | INCOMPLETE |
| AI generators/history/saved AI | Persist and retrieve owned work | Service/action path verified; live provider blocked | INCOMPLETE |
| Lessons | Create, save, retrieve, schedule | Personal library enables persistence | PASS |
| Classes and students | Standalone teacher creates class and roster | Teacher UI can read institution classes but cannot create a real standalone class/roster | MISSING |
| Assignments/attendance/review | Operate from an owned class | Existing institution-class paths exist; new standalone teacher is blocked by missing class creation | INCOMPLETE |
| Resources | Draft, edit, publish, search, download, reuse | Tenant inputs hardened; download now delivers or honestly disables | PASS |
| Planner/calendar/tasks | Date-scoped owned planning workflow | Canonical planner tests pass | PASS |
| Notifications | Scoped feed, state, and deep links | Tenant boundaries corrected | PASS |
| Search | Authorized cross-module results | AI conversation tenant filter corrected | PASS |
| Community | Scoped discussions, groups, network, messages | Static/regression authorization passes; live two-user flow blocked | INCOMPLETE |
| Professional profile | Draft, preview, activate, public image | Authenticated draft preview and authorized public photo route added | PASS |
| 1:1 teaching | Profile, availability, pricing, booking | Input and ownership paths hardened; live two-user flow blocked | INCOMPLETE |
| Publishing/marketplace | Canonical listing, purchase, delivery | Price tampering and false-download defects fixed | PASS |
| Orders/earnings/wallet | Verified ledger-based financial state | No fake data; live payment blocked | INCOMPLETE |
| Payouts | Real payout lifecycle | No provider-backed teacher payout system; UI is honest | POST-LAUNCH |
| Happy Notes | TeachX submission boundary | Boundary exists; external platform execution not included | PASS |
| Learn More | Honest real/empty/premium content states | No fabricated catalog | PASS |
| Enjoy More | Honest Coming Soon destination | No fake offers, prices, partners, or bookings | PASS |
| Help/support/settings | Owned persistence and recoverable states | Services/actions and regression boundaries pass | PASS |
| Upload/storage | Private, authorized, deliverable objects | Code passes; live S3 evidence blocked | INCOMPLETE |
| Subscription/trial | Authoritative lifecycle and entitlements | Regression passes; live checkout/webhook blocked | INCOMPLETE |
| PWA/offline | No unexpected interruption; explicit updates | Unsolicited first-install reload fixed | PASS |

## 10. Bugs found and fixed

P17 found and fixed 15 launch-relevant defects:

1. Canonical AI did not independently prove an active teacher role.
2. AI Studio could expose internal/provider error text.
3. Teacher workspace queries lacked consistently explicit teacher and tenant checks.
4. Notification owned reads and state mutations were not uniformly institution-scoped.
5. Teacher resource writes accepted unverified subject relations and unsafe URLs.
6. Universal search AI conversation results lacked an explicit institution filter.
7. Preferences API accepted malformed or unsupported state too loosely.
8. Draft professional-profile preview could lead to a public 404.
9. Private uploaded profile photos broke on logged-out public profiles.
10. A new personal teacher had no course/subject context for saving AI lessons/resources.
11. Legacy resource purchase trusted a client-supplied fixed amount and could duplicate pending orders.
12. A visible resource share placeholder had no behavior.
13. Resource download recorded analytics without delivering a file.
14. Marketplace favorite/booking actions accepted invalid target/date/self-request states.
15. First service-worker installation could reload and abort the teacher's active page.

## 11. Remaining bugs and incomplete functionality

### RED items

None known in the audited code.

### ORANGE items

1. **Standalone class/roster creation is missing from the teacher experience.** This prevents the complete new-teacher Class -> Students -> Assignment -> Attendance journey. P17 did not invent this major feature because the phase expressly prohibits new product development.
2. **Authenticated production journeys are not yet proven against real providers.** Signup OTP, TARA, uploads, payment/webhooks, transactional email, and full two-tenant attack simulation require Railway configuration.

### YELLOW items

1. Lint reports 118 non-blocking warnings across the wider monorepo; several are in explicitly excluded LearnX/DirectorX areas.
2. `deleteCommunityNotificationAction` is exported but has no reachable UI.
3. Planner export contains a prepared PDF/image boundary with no active UI caller.
4. Public/global and institution-private marketplace surfaces overlap and should be consolidated after beta, without deleting either until references are mapped.
5. Real-device keyboard, PWA install, interrupted multipart upload, and low-bandwidth behavior require physical-device evidence.

### GREEN items

- Build, schema, TypeScript, lint error count, route policy, dependency security, browser suite, launch verification, and local release gate pass.
- No known cross-tenant fallback using `institutionId: undefined` remains in the corrected teacher paths.
- Public pages and protected redirects work at all required widths.
- AI credit and subscription enforcement remain canonical.
- No fake Learn More catalog, Enjoy More inventory, payout, earnings, or marketplace success was introduced.

## 12. Missing functionality

- Teacher-owned standalone class creation and student-roster management.
- Provider-backed teacher payout execution.
- Real catalogs/integrations for currently honest empty or Coming Soon learning/opportunity areas.

These are product gaps, not hidden failures. They must not be represented as available in beta scripts.

## 13. Post-launch backlog

- Design and implement standalone class/roster creation through the existing Course/Batch/Classroom models and authorization services.
- Add teacher payout provider integration only after legal, tax, KYC, and settlement rules are approved.
- Remove or connect orphan actions and planner export boundaries.
- Consolidate overlapping marketplace presentation layers around the canonical listing/order/entitlement system.
- Burn down lint warnings without touching unrelated products in a launch hotfix.
- Add authenticated browser fixtures for two teachers in separate tenants, a student buyer, and a platform operator.

## 14. Exact production blockers

The authoritative variable inventory remains in `docs/P16_PRODUCTION_LAUNCH_CERTIFICATION.md` and `.env.example`. At minimum Railway must have:

- Core/database: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `REDIS_URL`, `SETUP_SECRET`.
- SMS: `SMS_PROVIDER=twilio`, `SMS_LIVE=true`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_MESSAGING_SERVICE_SID` or `TWILIO_FROM_NUMBER`.
- AI: `OPENAI_API_KEY` and the approved configured model variables.
- Payments: provider keys, webhook secrets, `PAYMENTS_LIVE`, merchant/tax/refund/reconciliation settings, and fresh tested-at evidence.
- Email: `EMAIL_PROVIDER`, provider API/webhook secrets, `EMAIL_FROM`, `EMAIL_REPLY_TO`, live/domain/DMARC/readiness settings.
- Storage: `STORAGE_PROVIDER=s3`, endpoint, region, bucket, access keys, limits, CORS/retention/cleanup settings, and fresh upload/download/cleanup evidence.
- Monitoring: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, release/build credentials where source-map upload is enabled.
- Recovery/operations/privacy/performance: all required variables documented in `.env.example`, with fresh production drill timestamps.

Database release command:

```bash
npx prisma migrate deploy
```

Never use `prisma migrate dev`, `prisma db push`, reset, or seed against production.

## 15. Founder manual test plan

Use separate, disposable production-beta accounts and real provider sandbox/live-test modes:

1. Register Teacher A by mobile OTP; verify one account, one workspace, one seven-day trial, and no placeholder email display.
2. Register Teacher B in a separate institution; attempt Teacher A's lesson, resource, task, conversation, notification, order, wallet, subscription, support, and private profile IDs from Teacher B.
3. As Teacher A, open Home -> all Four Pillars -> TARA; verify real credits and no raw provider errors.
4. Generate a lesson and worksheet, save both, search them, edit the resource, schedule the lesson, and return through a reminder.
5. Upload an image/PDF, confirm private access fails for Teacher B, publish an eligible item, purchase as a permitted buyer, and download the actual file.
6. Build and preview a professional profile, activate it, and verify its photo while logged out.
7. Submit a 1:1 booking from another account; reject self-booking and invalid dates.
8. Exercise trial, Basic, Pro, failed/cancelled payment, verified webhook activation, duplicate webhook, cancellation, expiry, and AI entitlement changes.
9. Submit and reply to support; change notification/privacy/AI/language settings; log out and verify session invalidation.
10. Repeat core flows at 360/390/414 px on physical Android and iOS devices, including keyboard-open forms, PWA install/update, offline draft, and interrupted upload resume.
11. Explicitly confirm the current class-creation limitation with beta participants; do not promise standalone class/roster setup until implemented.
12. Run `npm run launch:gate:production` against the HTTPS Railway origin and require every live evidence gate to pass.

## 16. Final recommendation

**Can a real teacher safely be invited to use TeachX for controlled beta testing? NO, not today.**

The code has no known RED launch defect and the local evidence is strong. The answer remains NO until Railway/provider configuration is complete, the strict production gate passes, two-tenant authenticated attack tests pass against the deployed database, and the beta scope either includes standalone class/roster creation or explicitly excludes that currently incomplete journey.

After those conditions are met, the recommendation can move to **YELLOW: controlled beta with five teachers**, monitored closely, with payments initially restricted to verified provider test/live controls and no promise of teacher payouts.
