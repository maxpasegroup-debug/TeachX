import { readFileSync } from "node:fs";
import process from "node:process";

const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const rawBaseUrl = process.env.MONITOR_BASE_URL || process.env.SMOKE_BASE_URL;
const timeoutMs = Number(process.env.MONITOR_TIMEOUT_MS || 10000);
const maxLatencyMs = Number(process.env.MONITOR_MAX_LATENCY_MS || 3000);
const expectedVersion = process.env.MONITOR_EXPECTED_VERSION || packageJson.version;

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

for (const probe of ["/api/health", "/api/ready", "/api/status", "/api/version"]) {
  try {
    const result = await request(probe);
    checks.push(check(`${probe}:http`, result.response.ok, `HTTP ${result.response.status}`));
    checks.push(check(`${probe}:latency`, result.latencyMs <= maxLatencyMs, `${result.latencyMs}ms (limit ${maxLatencyMs}ms)`));

    if (probe === "/api/health") checks.push(check(`${probe}:body`, result.body?.ok === true, "health reports ok"));
    if (probe === "/api/ready") checks.push(check(`${probe}:body`, result.body?.ok === true && result.body?.status === "ready", `readiness is ${result.body?.status ?? "unknown"}`));
    if (probe === "/api/status") checks.push(check(`${probe}:body`, result.body?.overall !== "outage", `public status is ${result.body?.overall ?? "unknown"}`));
    if (probe === "/api/version") checks.push(check(`${probe}:version`, result.body?.version === expectedVersion, `expected ${expectedVersion}, received ${result.body?.version ?? "unknown"}`));
  } catch (error) {
    checks.push(check(`${probe}:request`, false, error instanceof Error ? error.message : "request failed"));
  }
}

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
};

if (process.env.MONITOR_JSON === "1") {
  console.log(JSON.stringify(report));
} else {
  console.log(`TeachX production monitor: ${report.passed}/${checks.length} checks passed for ${baseUrl}`);
  for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name} - ${item.detail}`);
}

if (failed.length) process.exit(1);

