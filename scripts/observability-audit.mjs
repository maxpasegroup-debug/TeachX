import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");
const check = (name, pass, detail) => ({ name, pass, detail });

const requiredFiles = [
  "instrumentation.ts",
  "instrumentation-client.ts",
  "sentry.server.config.ts",
  "sentry.edge.config.ts",
  "lib/observability/privacy.ts",
  "lib/observability/logger.ts",
  "lib/observability/request-context.ts",
  "app/api/observability/readiness/route.ts"
];

const server = read("sentry.server.config.ts");
const edge = read("sentry.edge.config.ts");
const client = read("instrumentation-client.ts");
const privacy = read("lib/observability/privacy.ts");
const proxy = read("proxy.ts");
const errorBoundary = read("app/error.tsx");
const readiness = read("app/api/observability/readiness/route.ts");
const env = read(".env.example");

const checks = [
  ...requiredFiles.map((file) => check(`file:${file}`, existsSync(join(root, file)), file)),
  check("privacy:no-default-pii", [server, edge, client].every((source) => source.includes("sendDefaultPii: false")), "default personal-data collection disabled"),
  check("privacy:no-session-replay", ![server, edge, client].some((source) => /replayIntegration|replaysSessionSampleRate|replaysOnErrorSampleRate/.test(source)), "session replay is absent"),
  check("privacy:no-input-breadcrumbs", client.includes('breadcrumb.category === "ui.input"') && client.includes("return null"), "input breadcrumbs discarded"),
  check("privacy:request-data", privacy.includes("event.request.data = undefined") && privacy.includes("event.request.cookies = undefined"), "request bodies and cookies removed"),
  check("privacy:credentials", privacy.includes("authorization|cookie|credential|email|password|phone|secret|session|token"), "sensitive context keys redacted"),
  check("privacy:spans", [server, edge, client].every((source) => source.includes("beforeSendSpan: scrubTelemetrySpan")) && privacy.includes("db\\.statement") && privacy.includes("prompt|query"), "performance spans redact database, prompt, content, input, output, and query data"),
  check("correlation:downstream", proxy.includes('requestHeaders.set("x-request-id", requestId)') && proxy.includes("request: { headers: requestHeaders }"), "request ID reaches route handlers"),
  check("correlation:response", proxy.includes('response.headers.set("X-Request-Id", requestId)'), "request ID returned to clients"),
  check("capture:request-errors", read("instrumentation.ts").includes("Sentry.captureRequestError"), "Next.js request failures captured"),
  check("capture:react-boundary", errorBoundary.includes("Sentry.captureException(error)"), "React boundary failures captured"),
  check("capture:prisma", server.includes("Sentry.prismaIntegration") && server.includes("PrismaInstrumentation"), "Prisma tracing configured"),
  check("capture:redis", server.includes("Sentry.redisIntegration") && server.includes("teachx:rate-limit:"), "Redis tracing configured"),
  check("readiness:protected", readiness.includes('requireApiSession("settings.manage")'), "observability readiness is operator-only"),
  check("env:documented", ["SENTRY_DSN", "NEXT_PUBLIC_SENTRY_DSN", "SENTRY_ORG", "SENTRY_PROJECT", "SENTRY_AUTH_TOKEN"].every((key) => env.includes(`${key}=`)), "Railway observability variables documented")
];

const failed = checks.filter((item) => !item.pass);
console.log(`TeachX observability audit: ${checks.length - failed.length}/${checks.length} checks passed`);
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name} - ${item.detail}`);

if (failed.length) {
  console.error(`Observability audit failed with ${failed.length} issue(s).`);
  process.exit(1);
}

console.log("Observability audit passed.");
