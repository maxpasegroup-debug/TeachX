import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("performance budgets are bounded against unsafe configuration", () => {
  const config = read("lib/performance/config.ts");
  assert.match(config, /integer\(process\.env\.PERFORMANCE_LOAD_CONCURRENCY, 20, 1, 200\)/);
  assert.match(config, /integer\(process\.env\.PERFORMANCE_LOAD_REQUESTS, 200, 20, 20_000\)/);
  assert.match(config, /integer\(process\.env\.DATABASE_POOL_MAX, 10, 2, 100\)/);
});

test("database readiness uses a finite timeout and retry advice", () => {
  const ready = read("app/api/ready/route.ts");
  assert.match(ready, /withTimeout/);
  assert.match(ready, /Retry-After/);
});

test("load probe measures concurrent percentile latency and failures", () => {
  const load = read("scripts/performance-load.mjs");
  for (const token of ["Promise.all", "AbortSignal.timeout", "p95", "errorRatePercent", "statusCounts"]) assert.match(load, new RegExp(token.replace(".", "\\.")));
});

test("static and private cache policies remain separated", () => {
  const config = read("next.config.ts");
  assert.match(config, /source: "\/api\/:path\*"[\s\S]*no-store/);
  const load = read("scripts/performance-load.mjs");
  assert.match(load, /staticProbe[\s\S]*immutable/);
  assert.match(load, /apiProbe[\s\S]*no-store/);
});

test("scale migration covers critical timeline and preference indexes", () => {
  const migration = read("prisma/migrations/20260819160000_add_scale_hot_path_indexes/migration.sql");
  for (const table of ["Notification", "UserPreference", "AuditLog", "ContentItem"]) assert.match(migration, new RegExp(`ON "${table}"`));
});
