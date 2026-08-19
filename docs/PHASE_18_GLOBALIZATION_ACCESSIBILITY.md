# Phase 18: Globalization and Accessibility

## Launch outcome

TeachX now has one validated locale contract across public and authenticated pages. A teacher's formatting locale, time zone, motion preference, and contrast preference persist in the database and secure cookies. The root document renders the correct BCP 47 language tag and text direction before hydration, including Arabic RTL.

## Supported launch locales

- `en-IN` English (India)
- `en-US` English (United States)
- `hi-IN` Hindi (India)
- `ta-IN` Tamil (India)
- `bn-IN` Bengali (India)
- `ar-SA` Arabic (Saudi Arabia), RTL
- `es-ES` Spanish (Spain)
- `fr-FR` French (France)

These are certified formatting and layout locales. They are not a claim that every product sentence has been translated. Product translations must use a versioned message catalog, professional or community human review, terminology review by teachers, and visual QA before a locale is advertised as translated. Unreviewed machine translation is not a launch language.

## Accessibility contract

- A keyboard-visible skip link bypasses repeated navigation.
- Global `:focus-visible` treatment does not rely on color alone.
- User-selected reduced motion and the operating system `prefers-reduced-motion` setting disable non-essential animation.
- High contrast raises foreground, border, and focus contrast without hiding information.
- Locale, time zone, direction, motion, and contrast are server-rendered to avoid a hydration flash.
- Locale and time-zone values are allowlisted; client input cannot inject arbitrary document attributes or formatter options.
- Existing automated axe coverage remains part of `test:browser`; Phase 18 adds RTL and preference checks.

## Railway variables

Set these after the production drill:

- `NEXT_PUBLIC_DEFAULT_LOCALE=en-IN`
- `NEXT_PUBLIC_DEFAULT_TIME_ZONE=Asia/Kolkata`
- `GLOBALIZATION_LOCALE_READY=true`
- `GLOBALIZATION_RTL_READY=true`
- `GLOBALIZATION_WCAG_READY=true`
- `GLOBALIZATION_LOCALE_TESTED_AT=<ISO-8601 UTC>`
- `GLOBALIZATION_RTL_TESTED_AT=<ISO-8601 UTC>`
- `GLOBALIZATION_ACCESSIBILITY_TESTED_AT=<ISO-8601 UTC>`

Evidence expires after 30 days.

## Production drill

1. Deploy over HTTPS and sign in as a teacher.
2. Save `en-IN` with `Asia/Kolkata`; verify dates, subscription dates, direction, reload persistence, and a second device session.
3. Repeat with `en-US` and a US time zone; verify number/date ordering and no Indian-only labels in shared formatters.
4. Select `ar-SA` with `Asia/Riyadh`; verify `html[lang="ar-SA"][dir="rtl"]`, navigation order, forms, menus, uploads, tables, dialogs, and directional icons on mobile and desktop.
5. Navigate the public pages and teacher critical path using keyboard only. Confirm the skip link, visible focus, logical tab order, labels, status announcements, and no keyboard traps.
6. Enable reduced motion and high contrast independently and together; reload and verify that each preference is applied before content paints.
7. Run axe at WCAG 2.1 A/AA on the public suite and the authenticated teacher critical path at desktop and mobile widths.
8. Test 200% and 400% browser zoom without content overlap or loss of controls.
9. Set the three current evidence timestamps and run `SMOKE_BASE_URL=https://your-domain npm run globalization:verify`.
10. Run `npm run launch:gate:production`.

The live verifier requests the production site with both English LTR and Arabic RTL cookies. It fails if language, direction, reduced motion, high contrast, or skip navigation is not present in the server response.

## Translation rollout after launch

1. Extract user-facing messages into namespaced catalogs.
2. Freeze education, billing, privacy, and safety terminology per locale.
3. Translate and review one complete teacher critical path at a time.
4. Add pseudo-localization for expansion and truncation testing.
5. Publish a locale only after native-teacher review, support coverage, policy translation, and screenshot QA.
