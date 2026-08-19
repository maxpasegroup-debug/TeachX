const evidenceAgeDays = (value: string | undefined) => {
  if (!value) return null;
  const age = (Date.now() - new Date(value).getTime()) / 86_400_000;
  return Number.isFinite(age) && age >= 0 ? age : null;
};

export function getGlobalizationConfig() {
  const controls = {
    localeFormatting: process.env.GLOBALIZATION_LOCALE_READY === "true",
    rtlLayout: process.env.GLOBALIZATION_RTL_READY === "true",
    accessibility: process.env.GLOBALIZATION_WCAG_READY === "true"
  };
  const evidence = {
    localeAgeDays: evidenceAgeDays(process.env.GLOBALIZATION_LOCALE_TESTED_AT),
    rtlAgeDays: evidenceAgeDays(process.env.GLOBALIZATION_RTL_TESTED_AT),
    accessibilityAgeDays: evidenceAgeDays(process.env.GLOBALIZATION_ACCESSIBILITY_TESTED_AT)
  };
  const evidenceFresh = Object.values(evidence).every((age) => age !== null && age <= 30);
  return { controls, evidence, evidenceFresh, live: Object.values(controls).every(Boolean) && evidenceFresh };
}
