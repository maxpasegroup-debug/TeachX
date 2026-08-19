import { readFileSync } from "node:fs";
import process from "node:process";

const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const rawBaseUrl = process.env.MONITOR_BASE_URL || process.env.SMOKE_BASE_URL;
const timeoutMs = Number(process.env.MONITOR_TIMEOUT_MS || 10000);
const maxLatencyMs = Number(process.env.MONITOR_MAX_LATENCY_MS || process.env.OPERATIONS_P95_TARGET_MS || 1500);
const expectedVersion = process.env.MONITOR_EXPECTED_VERSION || packageJson.version;
const attempts = Math.max(1, Math.min(10, Number(process.env.MONITOR_ATTEMPTS || 3)));

if (!rawBaseUrl) {
  console.error("TeachX monitor requires MONITOR_BASE_URL=https://your-production-domain.");
  process.exit(1);
}

const baseUrl = rawBaseUrl.replace(/\/+$/, "");

async function request(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = performance.now();
  try {
    const response = await fetch(`${baseUrl}${path}`, { redirect: "manual", signal: controller.signal, cache: "no-store" });
    const latencyMs = Math.round(performance.now() - startedAt);
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json") ? await response.json() : await response.text();
    return { response, body, latencyMs };
  } finally {
    clearTimeout(timer);
  }
}

function check(name, pass, detail) {
  return { name, pass, detail, checkedAt: new Date().toISOString() };
}

const checks = [];
const latencies = [];

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  for (const probe of ["/api/health", "/api/ready", "/api/status", "/api/version"]) {
    try {
      const result = await request(probe);
      latencies.push(result.latencyMs);
      const name = `${probe}:attempt-${attempt}`;
      checks.push(check(`${name}:http`, result.response.ok, `HTTP ${result.response.status}`));
      checks.push(check(`${name}:latency`, result.latencyMs <= maxLatencyMs, `${result.latencyMs}ms (limit ${maxLatencyMs}ms)`));

      if (probe === "/api/health") checks.push(check(`${name}:body`, result.body?.ok === true, "health reports ok"));
      if (probe === "/api/ready") checks.push(check(`${name}:body`, result.body?.ok === true && result.body?.status === "ready", `readiness is ${result.body?.status ?? "unknown"}`));
      if (probe === "/api/status") checks.push(check(`${name}:body`, result.body?.overall !== "outage" && Array.isArray(result.body?.incidents), `public status is ${result.body?.overall ?? "unknown"}`));
      if (probe === "/api/version") checks.push(check(`${name}:version`, result.body?.version === expectedVersion, `expected ${expectedVersion}, received ${result.body?.version ?? "unknown"}`));
    } catch (error) {
      checks.push(check(`${probe}:attempt-${attempt}:request`, false, error instanceof Error ? error.message : "request failed"));
    }
  }
}

const orderedLatencies = latencies.toSorted((a, b) => a - b);
const p95LatencyMs = orderedLatencies.length ? orderedLatencies[Math.ceil(orderedLatencies.length * 0.95) - 1] : null;
checks.push(check("monitor:p95", p95LatencyMs !== null && p95LatencyMs <= maxLatencyMs, `${p95LatencyMs ?? "missing"}ms (limit ${maxLatencyMs}ms)`));

try {
  const root = await request("/");
  const securityHeaders = ["content-security-policy", "x-content-type-options", "x-frame-options", "referrer-policy"];
  checks.push(check("/:http", root.response.status >= 200 && root.response.status < 400, `HTTP ${root.response.status}`));
  checks.push(check("/:latency", root.latencyMs <= maxLatencyMs, `${root.latencyMs}ms (limit ${maxLatencyMs}ms)`));
  checks.push(check("/:security-headers", securityHeaders.every((header) => root.response.headers.has(header)), "required browser security headers present"));
} catch (error) {
  checks.push(check("/:request", false, error instanceof Error ? error.message : "request failed"));
}

const failed = checks.filter((item) => !item.pass);
const report = {
  service: "teachx",
  target: baseUrl,
  status: failed.length ? "alert" : "healthy",
  checkedAt: new Date().toISOString(),
  passed: checks.length - failed.length,
  failed: failed.length,
  checks
  , p95LatencyMs
};

if (process.env.MONITOR_JSON === "1") {
  console.log(JSON.stringify(report));
} else {
  console.log(`TeachX production monitor: ${report.passed}/${checks.length} checks passed for ${baseUrl}`);
  for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name} - ${item.detail}`);
}

if (failed.length) process.exit(1);
