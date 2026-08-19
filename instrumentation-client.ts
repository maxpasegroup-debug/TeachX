import { scrubTelemetryEvent, scrubTelemetrySpan } from "@/lib/observability/privacy";

type SentryClient = typeof import("@sentry/nextjs");

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const tracesSampleRate = Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || "0.05");
let sentryClient: Promise<SentryClient> | undefined;

if (dsn) {
  sentryClient = import("@sentry/nextjs");
  void sentryClient.then((Sentry) => {
    Sentry.init({
      dsn,
      enabled: true,
      environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
      release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
      sendDefaultPii: false,
      tracesSampleRate: Number.isFinite(tracesSampleRate) ? Math.min(Math.max(tracesSampleRate, 0), 1) : 0.05,
      maxBreadcrumbs: 30,
      normalizeDepth: 3,
      beforeSend: scrubTelemetryEvent,
      beforeSendSpan: scrubTelemetrySpan,
      beforeBreadcrumb(breadcrumb) {
        if (breadcrumb.category === "ui.input") return null;
        return breadcrumb;
      }
    });
  });
}

export function onRouterTransitionStart(...args: Parameters<SentryClient["captureRouterTransitionStart"]>) {
  void sentryClient?.then((Sentry) => Sentry.captureRouterTransitionStart(...args));
}
