import { performance } from "node:perf_hooks";
import process from "node:process";

const fail = (message) => { console.error(`Performance load test failed: ${message}`); process.exit(1); };
const integer = (value, fallback, min, max) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
};
const baseValue = process.env.PERFORMANCE_BASE_URL || process.env.SMOKE_BASE_URL || "http://127.0.0.1:3102";
let base;
try { base = new URL(baseValue); } catch { fail("PERFORMANCE_BASE_URL is invalid."); }
if (process.env.PERFORMANCE_PRODUCTION === "1" && base.protocol !== "https:") fail("production load tests require HTTPS.");

const requests = integer(process.env.PERFORMANCE_LOAD_REQUESTS, 200, 20, 20_000);
const concurrency = Math.min(requests, integer(process.env.PERFORMANCE_LOAD_CONCURRENCY, 20, 1, 200));
const timeoutMs = integer(process.env.PERFORMANCE_REQUEST_TIMEOUT_MS, 15_000, 1_000, 60_000);
const p95BudgetMs = integer(process.env.PERFORMANCE_P95_BUDGET_MS, 1_500, 100, 10_000);
const maxErrorRate = integer(process.env.PERFORMANCE_MAX_ERROR_RATE_PERCENT, 1, 0, 20);
const paths = ["/api/health", "/", "/pricing", "/login", "/manifest.webmanifest"];

const [homeProbe, apiProbe, iconProbe] = await Promise.all([
  fetch(base, { signal: AbortSignal.timeout(timeoutMs) }),
  fetch(new URL("/api/health", base), { signal: AbortSignal.timeout(timeoutMs) }),
  fetch(new URL("/icons/icon-192.png", base), { signal: AbortSignal.timeout(timeoutMs) })
]);
const homeHtml = await homeProbe.text();
const staticPath = homeHtml.match(/(?:src|href)="([^" ]*\/_next\/static\/[^" ]+)"/)?.[1]?.replaceAll("&amp;", "&");
if (!staticPath) fail("a hashed framework asset could not be discovered.");
const staticProbe = await fetch(new URL(staticPath, base), { signal: AbortSignal.timeout(timeoutMs) });
if (!staticProbe.headers.get("cache-control")?.includes("immutable")) fail("hashed framework assets are not immutable.");
if (!apiProbe.headers.get("cache-control")?.includes("no-store")) fail("private/API cache policy is not no-store.");
if (!iconProbe.headers.get("cache-control")?.includes("stale-while-revalidate")) fail("install asset cache policy is incomplete.");
await Promise.all([apiProbe.arrayBuffer(), iconProbe.arrayBuffer(), staticProbe.arrayBuffer()]);

await Promise.all(paths.map(async (path) => {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) fail(`warm-up ${path} returned ${response.status}.`);
  await response.arrayBuffer();
}));

const durations = [];
const statusCounts = new Map();
let cursor = 0;
let failures = 0;
let bytes = 0;
const startedAt = performance.now();

async function worker() {
  while (true) {
    const index = cursor++;
    if (index >= requests) return;
    const path = paths[index % paths.length];
    const started = performance.now();
    try {
      const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(timeoutMs), headers: { "x-performance-probe": "phase-19" } });
      const body = await response.arrayBuffer();
      bytes += body.byteLength;
      statusCounts.set(response.status, (statusCounts.get(response.status) ?? 0) + 1);
      if (!response.ok) failures += 1;
    } catch {
      failures += 1;
      statusCounts.set(0, (statusCounts.get(0) ?? 0) + 1);
    } finally {
      durations.push(performance.now() - started);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));
durations.sort((a, b) => a - b);
const percentile = (value) => durations[Math.min(durations.length - 1, Math.max(0, Math.ceil(value * durations.length) - 1))];
const elapsedMs = performance.now() - startedAt;
const result = {
  target: base.origin,
  requests,
  concurrency,
  failures,
  errorRatePercent: Math.round((failures / requests) * 10_000) / 100,
  latencyMs: { p50: Math.round(percentile(0.5) * 10) / 10, p95: Math.round(percentile(0.95) * 10) / 10, p99: Math.round(percentile(0.99) * 10) / 10, max: Math.round(durations.at(-1) * 10) / 10 },
  throughputPerSecond: Math.round((requests / elapsedMs) * 100_000) / 100,
  responseMegabytes: Math.round((bytes / 1_048_576) * 100) / 100,
  cachePolicy: { api: "no-store", static: "immutable", icons: "stale-while-revalidate" },
  statusCounts: Object.fromEntries([...statusCounts.entries()].sort(([a], [b]) => a - b))
};
console.log(JSON.stringify(result, null, 2));
if (result.errorRatePercent > maxErrorRate) fail(`error rate ${result.errorRatePercent}% exceeds ${maxErrorRate}%.`);
if (result.latencyMs.p95 > p95BudgetMs) fail(`p95 ${result.latencyMs.p95}ms exceeds ${p95BudgetMs}ms.`);
console.log("TeachX performance load test passed.");
