import "server-only";

import * as Sentry from "@sentry/nextjs";

import { sanitizeContext, sanitizeText } from "@/lib/observability/privacy";

type LogLevel = "debug" | "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

function release() {
  return process.env.SENTRY_RELEASE || process.env.RAILWAY_GIT_COMMIT_SHA || process.env.npm_package_version || "unknown";
}

export function logEvent(level: LogLevel, event: string, context: LogContext = {}) {
  const record = {
    timestamp: new Date().toISOString(),
    level,
    event: sanitizeText(event),
    service: "teachx",
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
    release: release(),
    context: sanitizeContext(context)
  };

  const output = JSON.stringify(record);
  if (level === "error") console.error(output);
  else if (level === "warn") console.warn(output);
  else if (level === "debug") console.debug(output);
  else console.info(output);
}

export function captureOperationalError(error: unknown, event: string, context: LogContext = {}) {
  const safeContext = sanitizeContext(context) as Record<string, unknown>;
  logEvent("error", event, { ...safeContext, error });

  Sentry.withScope((scope) => {
    scope.setTag("teachx.event", sanitizeText(event));
    if (typeof safeContext.requestId === "string") scope.setTag("request_id", safeContext.requestId);
    scope.setContext("teachx", safeContext);
    Sentry.captureException(error);
  });
}
