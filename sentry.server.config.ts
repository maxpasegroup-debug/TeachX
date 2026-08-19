import { PrismaInstrumentation } from "@prisma/instrumentation";
import * as Sentry from "@sentry/nextjs";

import { scrubTelemetryEvent, scrubTelemetrySpan } from "@/lib/observability/privacy";

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const tracesSampleRate = Number(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1");

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  release: process.env.SENTRY_RELEASE || process.env.RAILWAY_GIT_COMMIT_SHA,
  sendDefaultPii: false,
  enableLogs: false,
  tracesSampleRate: Number.isFinite(tracesSampleRate) ? Math.min(Math.max(tracesSampleRate, 0), 1) : 0.1,
  maxBreadcrumbs: 50,
  normalizeDepth: 3,
  integrations: [
    Sentry.prismaIntegration({ prismaInstrumentation: new PrismaInstrumentation() }),
    Sentry.redisIntegration({ cachePrefixes: ["teachx:rate-limit:"] })
  ],
  beforeSend: scrubTelemetryEvent,
  beforeSendSpan: scrubTelemetrySpan
});
