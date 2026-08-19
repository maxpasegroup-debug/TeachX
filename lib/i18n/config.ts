export const LOCALE_COOKIE = "teachx_locale";
export const TIME_ZONE_COOKIE = "teachx_time_zone";
export const MOTION_COOKIE = "teachx_motion";
export const CONTRAST_COOKIE = "teachx_contrast";

export const supportedLocales = [
  { code: "en-IN", label: "English (India)", language: "en", direction: "ltr" },
  { code: "en-US", label: "English (United States)", language: "en", direction: "ltr" },
  { code: "hi-IN", label: "Hindi (India)", language: "hi", direction: "ltr" },
  { code: "ta-IN", label: "Tamil (India)", language: "ta", direction: "ltr" },
  { code: "bn-IN", label: "Bengali (India)", language: "bn", direction: "ltr" },
  { code: "ar-SA", label: "Arabic (Saudi Arabia)", language: "ar", direction: "rtl" },
  { code: "es-ES", label: "Spanish (Spain)", language: "es", direction: "ltr" },
  { code: "fr-FR", label: "French (France)", language: "fr", direction: "ltr" }
] as const;

export const supportedTimeZones = [
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Riyadh",
  "Asia/Singapore",
  "Europe/London",
  "Europe/Paris",
  "Africa/Johannesburg",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Australia/Sydney",
  "UTC"
] as const;

export type SupportedLocale = (typeof supportedLocales)[number]["code"];
export type SupportedTimeZone = (typeof supportedTimeZones)[number];

const requestedDefaultLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE as SupportedLocale | undefined;
const requestedDefaultTimeZone = process.env.NEXT_PUBLIC_DEFAULT_TIME_ZONE as SupportedTimeZone | undefined;
export const defaultLocale: SupportedLocale = supportedLocales.some((item) => item.code === requestedDefaultLocale) ? requestedDefaultLocale! : "en-IN";
export const defaultTimeZone: SupportedTimeZone = supportedTimeZones.includes(requestedDefaultTimeZone as SupportedTimeZone) ? requestedDefaultTimeZone! : "Asia/Kolkata";

export function resolveLocale(value?: string | null) {
  return supportedLocales.find((locale) => locale.code === value)
    ?? supportedLocales.find((locale) => locale.code === defaultLocale)
    ?? supportedLocales[0];
}

export function resolveTimeZone(value?: string | null): SupportedTimeZone {
  return supportedTimeZones.includes(value as SupportedTimeZone) ? value as SupportedTimeZone : defaultTimeZone;
}

export function localeFromLegacyLanguage(value?: string | null): SupportedLocale {
  const map: Record<string, SupportedLocale> = {
    English: "en-IN",
    Hindi: "hi-IN",
    Tamil: "ta-IN",
    Bengali: "bn-IN"
  };
  return map[value ?? ""] ?? resolveLocale(value).code;
}
