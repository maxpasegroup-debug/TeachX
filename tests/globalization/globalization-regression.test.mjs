import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("supported locale catalog is bounded and includes RTL", () => {
  const config = read("lib/i18n/config.ts");
  assert.equal((config.match(/code: "/g) ?? []).length, 8);
  assert.match(config, /code: "ar-SA"[\s\S]*direction: "rtl"/);
});

test("untrusted locale and time-zone values are resolved through allowlists", () => {
  const config = read("lib/i18n/config.ts");
  assert.match(config, /supportedLocales\.find/);
  assert.match(config, /supportedTimeZones\.includes/);
  assert.doesNotMatch(config, /document\.cookie/);
});

test("root document receives locale, direction, and accessibility state", () => {
  const layout = read("app/layout.tsx");
  for (const token of ["lang={locale.code}", "dir={locale.direction}", "data-motion", "data-contrast", "skip-link"]) assert.match(layout, new RegExp(token.replace(/[{}]/g, "\\$&")));
});

test("formatters avoid fixed Indian or US locale assumptions", () => {
  const format = read("lib/format.ts");
  assert.match(format, /resolveLocale/);
  assert.match(format, /resolveTimeZone/);
  assert.doesNotMatch(format, /Intl\.(DateTimeFormat|NumberFormat)\("en-/);
});

test("teacher preferences persist locale accessibility choices securely", () => {
  const action = read("features/platform-integration/actions.ts");
  for (const token of ["httpOnly:true", "sameSite:\"lax\"", "secure:process.env.NODE_ENV", "reducedMotion", "highContrast"]) assert.match(action, new RegExp(token.replace(/[.]/g, "\\.")));
});
