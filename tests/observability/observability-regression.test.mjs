import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("all Sentry runtimes disable default PII", () => {
  for (const file of ["sentry.server.config.ts", "sentry.edge.config.ts", "instrumentation-client.ts"]) {
    assert.match(read(file), /sendDefaultPii: false/);
    assert.doesNotMatch(read(file), /replayIntegration|replaysSessionSampleRate|replaysOnErrorSampleRate/);
  }
});

test("telemetry scrubber removes request data and sensitive identity", () => {
  const source = read("lib/observability/privacy.ts");
  assert.match(source, /event\.user = undefined/);
  assert.match(source, /event\.request\.cookies = undefined/);
  assert.match(source, /event\.request\.data = undefined/);
  assert.match(source, /authorization\|cookie\|credential\|email\|password\|phone\|secret\|session\|token/);
  assert.match(source, /body\|content\|credential\|db\\\.statement/);
  assert.match(source, /span\.op\?\.startsWith\("db"\) \? "database operation"/);
});

test("request IDs are propagated in both directions", () => {
  const source = read("proxy.ts");
  assert.match(source, /requestHeaders\.set\("x-request-id", requestId\)/);
  assert.match(source, /response\.headers\.set\("X-Request-Id", requestId\)/);
});

test("request, React, database and Redis failures are instrumented", () => {
  assert.match(read("instrumentation.ts"), /Sentry\.captureRequestError/);
  assert.match(read("app/error.tsx"), /Sentry\.captureException\(error\)/);
  assert.match(read("sentry.server.config.ts"), /Sentry\.prismaIntegration/);
  assert.match(read("sentry.server.config.ts"), /Sentry\.redisIntegration/);
});
