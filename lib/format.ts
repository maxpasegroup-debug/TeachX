import { defaultLocale, defaultTimeZone, resolveLocale, resolveTimeZone } from "@/lib/i18n/config";

type FormatContext = { locale?: string | null; timeZone?: string | null };

export function formatDate(value?: Date | string | null, context: FormatContext = {}) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat(resolveLocale(context.locale ?? defaultLocale).code, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: resolveTimeZone(context.timeZone ?? defaultTimeZone)
  }).format(new Date(value));
}

export function formatDateTime(value: Date | string, context: FormatContext = {}) {
  return new Intl.DateTimeFormat(resolveLocale(context.locale ?? defaultLocale).code, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: resolveTimeZone(context.timeZone ?? defaultTimeZone)
  }).format(new Date(value));
}

export function formatNumber(value: number, context: FormatContext = {}) {
  return new Intl.NumberFormat(resolveLocale(context.locale ?? defaultLocale).code).format(value);
}

export function formatCurrency(value: number, currency: string, context: FormatContext = {}) {
  return new Intl.NumberFormat(resolveLocale(context.locale ?? defaultLocale).code, {
    style: "currency",
    currency: currency.toUpperCase(),
    currencyDisplay: "symbol"
  }).format(value);
}

export function sentenceCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}
