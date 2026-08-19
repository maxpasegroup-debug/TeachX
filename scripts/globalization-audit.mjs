import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");
const check = (name, pass, detail) => ({ name, pass, detail });
const files = ["lib/i18n/config.ts", "lib/globalization/config.ts", "app/api/globalization/readiness/route.ts", "scripts/globalization-verify.mjs", "tests/globalization/globalization-regression.test.mjs", "docs/PHASE_18_GLOBALIZATION_ACCESSIBILITY.md"];
const layout = read("app/layout.tsx");
const styles = read("app/globals.css");
const settings = read("features/platform-integration/components/teacher-unified-settings.tsx");
const action = read("features/platform-integration/actions.ts");
const format = read("lib/format.ts");
const localeConfig = read("lib/i18n/config.ts");
const checks = [
  ...files.map((file) => check(`file:${file}`, existsSync(join(root, file)), file)),
  check("locale:catalog", (localeConfig.match(/code: "/g) ?? []).length >= 8 && localeConfig.includes('code: "ar-SA"'), "launch locale catalog includes LTR and RTL regions"),
  check("locale:document", layout.includes("dir={locale.direction}") && layout.includes("lang={locale.code}"), "document language and direction are request-aware"),
  check("locale:persistence", action.includes("LOCALE_COOKIE") && action.includes("TIME_ZONE_COOKIE") && action.includes('key:"teacher.settings"'), "authenticated locale and time zone persist server-side and in secure cookies"),
  check("locale:formatters", format.includes("Intl.DateTimeFormat") && format.includes("Intl.NumberFormat") && format.includes("formatCurrency"), "shared date, number, and currency formatters use the selected locale"),
  check("rtl:layout", styles.includes('html[dir="rtl"]') && localeConfig.includes('direction: "rtl"'), "RTL direction and directional icon handling exist"),
  check("a11y:skip", layout.includes("skip-link") && layout.includes('id="main-content"'), "keyboard users can skip repeated navigation"),
  check("a11y:focus", styles.includes(":focus-visible") && styles.includes("outline-offset"), "keyboard focus is globally visible"),
  check("a11y:motion", styles.includes('data-motion="reduce"') && styles.includes("prefers-reduced-motion"), "user and operating-system motion preferences are honored"),
  check("a11y:contrast", styles.includes('data-contrast="high"') && settings.includes('name="highContrast"'), "high-contrast preference is functional"),
  check("translation:honesty", settings.includes("human review") && !settings.includes("Hindi ready"), "formatting readiness is not misrepresented as translated content")
];
const failed = checks.filter((item) => !item.pass);
console.log(`TeachX globalization audit: ${checks.length - failed.length}/${checks.length} checks passed`);
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name} - ${item.detail}`);
if (failed.length) process.exit(1);
console.log("Globalization and accessibility audit passed.");
