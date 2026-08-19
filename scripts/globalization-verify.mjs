import process from "node:process";

const required = ["SMOKE_BASE_URL", "GLOBALIZATION_LOCALE_READY", "GLOBALIZATION_RTL_READY", "GLOBALIZATION_WCAG_READY", "GLOBALIZATION_LOCALE_TESTED_AT", "GLOBALIZATION_RTL_TESTED_AT", "GLOBALIZATION_ACCESSIBILITY_TESTED_AT"];
const missing = required.filter((key) => !process.env[key]);
const fail = (message) => { console.error(`Globalization verification failed: ${message}`); process.exit(1); };
if (missing.length) fail(`missing ${missing.join(", ")}.`);
if (!["GLOBALIZATION_LOCALE_READY", "GLOBALIZATION_RTL_READY", "GLOBALIZATION_WCAG_READY"].every((key) => process.env[key] === "true")) fail("locale, RTL, and accessibility controls are not approved.");
const ageDays = (value) => (Date.now() - new Date(value).getTime()) / 86_400_000;
for (const key of ["GLOBALIZATION_LOCALE_TESTED_AT", "GLOBALIZATION_RTL_TESTED_AT", "GLOBALIZATION_ACCESSIBILITY_TESTED_AT"]) if (!Number.isFinite(ageDays(process.env[key])) || ageDays(process.env[key]) < 0 || ageDays(process.env[key]) > 30) fail(`${key} evidence is invalid or older than 30 days.`);
let base;
try { base = new URL(process.env.SMOKE_BASE_URL); } catch { fail("SMOKE_BASE_URL is invalid."); }
if (base.protocol !== "https:") fail("production globalization verification requires HTTPS.");

async function documentFor(cookie) {
  const response = await fetch(base, { headers: { cookie }, redirect: "manual" });
  if (!response.ok) fail(`localized document returned ${response.status}.`);
  return response.text();
}
const english = await documentFor("teachx_locale=en-IN; teachx_time_zone=Asia%2FKolkata");
if (!/<html[^>]+lang="en-IN"[^>]+dir="ltr"|<html[^>]+dir="ltr"[^>]+lang="en-IN"/.test(english)) fail("deployed English document is missing en-IN/LTR metadata.");
const arabic = await documentFor("teachx_locale=ar-SA; teachx_time_zone=Asia%2FRiyadh; teachx_motion=reduce; teachx_contrast=high");
if (!/<html[^>]+lang="ar-SA"[^>]+dir="rtl"|<html[^>]+dir="rtl"[^>]+lang="ar-SA"/.test(arabic)) fail("deployed Arabic document is missing ar-SA/RTL metadata.");
if (!arabic.includes('data-motion="reduce"') || !arabic.includes('data-contrast="high"') || !arabic.includes("skip-link")) fail("deployed accessibility preferences or skip navigation are missing.");
console.log("TeachX live globalization verification passed for locale rendering, RTL direction, reduced motion, high contrast, and keyboard skip navigation.");
