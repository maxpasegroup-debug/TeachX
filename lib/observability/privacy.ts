type TelemetryEvent = {
  breadcrumbs?: Array<{ data?: Record<string, unknown>; message?: string }>;
  exception?: { values?: Array<{ value?: string }> };
  extra?: Record<string, unknown>;
  request?: { cookies?: unknown; data?: unknown; headers?: Record<string, string>; query_string?: unknown };
  user?: unknown;
};
type TelemetrySpan = { data?: Record<string, unknown>; description?: string; op?: string };

const sensitiveKey = /authorization|cookie|credential|email|password|phone|secret|session|token/i;
const sensitiveSpanKey = /body|content|credential|db\.statement|db\.query|email|input|output|password|phone|prompt|query|secret|session|token/i;
const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const bearerPattern = /\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi;
const urlCredentialPattern = /:\/\/[^\s:/]+:[^\s@/]+@/g;
const urlQueryPattern = /(https?:\/\/[^\s?#]+|\/[A-Za-z0-9_./-]+)\?[^\s]*/g;

export function sanitizeText(value: string) {
  return value
    .replace(emailPattern, "[redacted-email]")
    .replace(bearerPattern, "Bearer [redacted]")
    .replace(urlCredentialPattern, "://[redacted]@")
    .replace(urlQueryPattern, "$1?[redacted]")
    .slice(0, 500);
}

function sanitizeSpanContext(value: unknown, depth = 0): unknown {
  if (!value || typeof value !== "object" || depth > 3) return sanitizeContext(value, depth);
  if (Array.isArray(value)) return value.slice(0, 25).map((item) => sanitizeSpanContext(item, depth + 1));
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .slice(0, 50)
      .map(([key, item]) => [key, sensitiveSpanKey.test(key) ? "[redacted]" : sanitizeSpanContext(item, depth + 1)])
  );
}

export function sanitizeContext(value: unknown, depth = 0): unknown {
  if (depth > 3) return "[truncated]";
  if (typeof value === "string") return sanitizeText(value);
  if (typeof value === "number" || typeof value === "boolean" || value == null) return value;
  if (Array.isArray(value)) return value.slice(0, 25).map((item) => sanitizeContext(item, depth + 1));
  if (value instanceof Error) return { name: value.name, message: sanitizeText(value.message) };
  if (typeof value !== "object") return String(value).slice(0, 100);

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .slice(0, 50)
      .map(([key, item]) => [key, sensitiveKey.test(key) ? "[redacted]" : sanitizeContext(item, depth + 1)])
  );
}

export function scrubTelemetryEvent<T extends TelemetryEvent>(event: T): T {
  event.user = undefined;
  event.extra = sanitizeContext(event.extra) as Record<string, unknown>;

  if (event.request) {
    event.request.cookies = undefined;
    event.request.data = undefined;
    event.request.query_string = undefined;
    event.request.headers = Object.fromEntries(
      Object.entries(event.request.headers ?? {}).filter(([key]) => !sensitiveKey.test(key))
    );
  }

  for (const value of event.exception?.values ?? []) {
    if (value.value) value.value = sanitizeText(value.value);
  }

  for (const breadcrumb of event.breadcrumbs ?? []) {
    if (breadcrumb.message) breadcrumb.message = sanitizeText(breadcrumb.message);
    breadcrumb.data = sanitizeContext(breadcrumb.data) as Record<string, unknown>;
  }

  return event;
}

export function scrubTelemetrySpan<T extends TelemetrySpan>(span: T): T {
  span.data = sanitizeSpanContext(span.data) as Record<string, unknown>;
  if (span.description) span.description = span.op?.startsWith("db") ? "database operation" : sanitizeText(span.description);
  return span;
}
