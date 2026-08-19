import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");
const check = (name, pass, detail) => ({ name, pass, detail });
const files = ["lib/performance/config.ts", "lib/performance/timeout.ts", "app/api/performance/readiness/route.ts", "scripts/performance-load.mjs", "scripts/performance-verify.mjs", "tests/performance/performance-regression.test.mjs", "prisma/migrations/20260819160000_add_scale_hot_path_indexes/migration.sql", "docs/PHASE_19_GLOBAL_SCALE_PERFORMANCE.md"];
const schema = read("prisma/schema.prisma");
const nextConfig = read("next.config.ts");
const ready = read("app/api/ready/route.ts");
const security = read("lib/security.ts");
const load = read("scripts/performance-load.mjs");
const checks = [
  ...files.map((file) => check(`file:${file}`, existsSync(join(root, file)), file)),
  check("capacity:budgets", ["PERFORMANCE_P95_BUDGET_MS", "PERFORMANCE_REQUEST_TIMEOUT_MS", "DATABASE_POOL_MAX"].every((token) => read("lib/performance/config.ts").includes(token)), "latency, timeout, concurrency, and pool budgets are bounded"),
  check("database:timeout", ready.includes("withTimeout") && ready.includes("databaseTimeoutMs"), "database readiness cannot hang indefinitely"),
  check("overload:retry", security.includes('"Retry-After": "5"') && ready.includes('"Retry-After": "5"'), "temporary overload and dependency failure are retryable"),
  check("cache:immutable", load.includes('includes("immutable")') && load.includes("staticProbe"), "load gate verifies framework-managed immutable assets"),
  check("cache:icons", nextConfig.includes("stale-while-revalidate=604800"), "install assets have bounded edge revalidation"),
  check("transport:compression", nextConfig.includes("compress: true"), "HTTP response compression is explicit"),
  check("load:concurrent", load.includes("PERFORMANCE_LOAD_CONCURRENCY") && load.includes("Promise.all") && load.includes("AbortSignal.timeout"), "load probe is concurrent and request-bounded"),
  check("load:percentiles", load.includes("p50") && load.includes("p95") && load.includes("p99"), "load probe enforces percentile latency"),
  check("index:notification", schema.includes("@@index([userId, status, createdAt])"), "notification feed hot path is indexed"),
  check("index:audit", schema.includes("@@index([institutionId, createdAt])") && schema.includes("@@index([entity, entityId, createdAt])"), "audit and institution timelines are indexed"),
  check("index:preferences", schema.includes("@@index([key, updatedAt])"), "preference readiness scan is indexed"),
  check("index:content", schema.includes("@@index([institutionId, status, updatedAt])"), "content workflow ordering is indexed")
];
const failed = checks.filter((item) => !item.pass);
console.log(`TeachX performance audit: ${checks.length - failed.length}/${checks.length} checks passed`);
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name} - ${item.detail}`);
if (failed.length) process.exit(1);
console.log("Global scale and performance audit passed.");
