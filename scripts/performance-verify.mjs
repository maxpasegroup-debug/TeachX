import { spawnSync } from "node:child_process";
import process from "node:process";
import { PrismaClient } from "@prisma/client";

const required = ["DATABASE_URL", "SMOKE_BASE_URL", "PERFORMANCE_CAPACITY_READY", "PERFORMANCE_DATABASE_POOL_READY", "PERFORMANCE_LOAD_TEST_READY", "PERFORMANCE_LOAD_TESTED_AT", "PERFORMANCE_DATABASE_TESTED_AT", "PERFORMANCE_CACHE_TESTED_AT", "DATABASE_POOL_MAX", "DATABASE_POOL_TIMEOUT_SECONDS", "PERFORMANCE_DATABASE_TIMEOUT_MS", "PERFORMANCE_REQUEST_TIMEOUT_MS", "PERFORMANCE_P95_BUDGET_MS", "PERFORMANCE_MAX_ERROR_RATE_PERCENT", "PERFORMANCE_LOAD_CONCURRENCY", "PERFORMANCE_LOAD_REQUESTS"];
const missing = required.filter((key) => !process.env[key]);
const fail = (message) => { console.error(`Performance verification failed: ${message}`); process.exit(1); };
if (missing.length) fail(`missing ${missing.join(", ")}.`);
if (!["PERFORMANCE_CAPACITY_READY", "PERFORMANCE_DATABASE_POOL_READY", "PERFORMANCE_LOAD_TEST_READY"].every((key) => process.env[key] === "true")) fail("capacity, database-pool, and load-test controls are not approved.");
const databaseUrl = new URL(process.env.DATABASE_URL);
if (databaseUrl.searchParams.get("connection_limit") !== process.env.DATABASE_POOL_MAX || databaseUrl.searchParams.get("pool_timeout") !== process.env.DATABASE_POOL_TIMEOUT_SECONDS) fail("DATABASE_URL connection_limit and pool_timeout must match the declared pool budgets.");
const ageDays = (value) => (Date.now() - new Date(value).getTime()) / 86_400_000;
for (const key of ["PERFORMANCE_LOAD_TESTED_AT", "PERFORMANCE_DATABASE_TESTED_AT", "PERFORMANCE_CACHE_TESTED_AT"]) if (!Number.isFinite(ageDays(process.env[key])) || ageDays(process.env[key]) < 0 || ageDays(process.env[key]) > 30) fail(`${key} evidence is invalid or older than 30 days.`);
let base;
try { base = new URL(process.env.SMOKE_BASE_URL); } catch { fail("SMOKE_BASE_URL is invalid."); }
if (base.protocol !== "https:") fail("production performance verification requires HTTPS.");

const load = spawnSync(process.execPath, ["scripts/performance-load.mjs"], { cwd: process.cwd(), env: { ...process.env, PERFORMANCE_BASE_URL: base.origin, PERFORMANCE_PRODUCTION: "1" }, stdio: "inherit" });
if (load.error || load.status !== 0) fail(`live load test failed${load.error ? `: ${load.error.message}` : "."}`);

const prisma = new PrismaClient();
try {
  const started = performance.now();
  await Promise.race([prisma.$queryRaw`SELECT 1`, new Promise((_, reject) => setTimeout(() => reject(new Error("database timeout")), Number(process.env.PERFORMANCE_DATABASE_TIMEOUT_MS)))]);
  const latency = performance.now() - started;
  if (latency > Number(process.env.PERFORMANCE_DATABASE_TIMEOUT_MS)) fail("database readiness exceeded its budget.");
  const rows = await prisma.$queryRaw`SELECT indexname FROM pg_indexes WHERE schemaname = 'public'`;
  const names = new Set(rows.map((row) => row.indexname));
  for (const name of ["Notification_userId_status_createdAt_idx", "UserPreference_key_updatedAt_idx", "AuditLog_institutionId_createdAt_idx", "ContentItem_institutionId_status_updatedAt_idx"]) if (!names.has(name)) fail(`database index ${name} is missing.`);
} finally {
  await prisma.$disconnect();
}
console.log("TeachX live performance verification passed for latency, error rate, database response, and hot-path indexes.");
