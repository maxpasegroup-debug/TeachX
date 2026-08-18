import process from "node:process";

const rawBaseUrl = process.env.SMOKE_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || "http://localhost:3000";
const baseUrl = rawBaseUrl.replace(/\/+$/, "");
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 15000);
const strictReady = process.env.SMOKE_STRICT_READY === "1";

const publicRoutes = [
  "/",
  "/teachers",
  "/pricing",
  "/trust",
  "/status",
  "/privacy",
  "/terms",
  "/security",
  "/refund-policy",
  "/cookies",
  "/contact",
  "/.well-known/security.txt",
  "/robots.txt",
  "/sitemap.xml"
];

const probeRoutes = [
  { path: "/api/health", required: true },
  { path: "/api/version", required: true },
  { path: "/api/status", required: strictReady },
  { path: "/api/ready", required: strictReady }
];

const protectedRoutes = [
  "/teacher",
  "/teacher/support",
  "/admin/launch",
  "/api/launch/readiness"
];

function withTimeout(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { controller, done: () => clearTimeout(timer) };
}

async function request(path, init = {}) {
  const { controller, done } = withTimeout(timeoutMs);
  try {
    return await fetch(`${baseUrl}${path}`, {
      redirect: "manual",
      signal: controller.signal,
      ...init
    });
  } finally {
    done();
  }
}

function result(name, pass, detail) {
  return { name, pass, detail };
}

function hasSecurityHeaders(response) {
  return [
    "x-frame-options",
    "x-content-type-options",
    "referrer-policy",
    "content-security-policy"
  ].every((key) => response.headers.has(key));
}

const results = [];

console.log(`TeachX launch smoke target: ${baseUrl}`);

for (const path of publicRoutes) {
  try {
    const response = await request(path);
    const ok = response.status >= 200 && response.status < 400;
    results.push(result(`public:${path}`, ok, `HTTP ${response.status}`));
    if (path === "/") {
      results.push(result("headers:security", hasSecurityHeaders(response), "root response includes security headers"));
    }
  } catch (error) {
    results.push(result(`public:${path}`, false, error instanceof Error ? error.message : "request failed"));
  }
}

for (const route of probeRoutes) {
  try {
    const response = await request(route.path);
    const body = await response.text();
    const okStatus = route.required ? response.ok : response.status < 600;
    const okBody = body.includes("ok") || body.includes("version") || body.includes("status");
    const detail = route.path === "/api/ready" && !strictReady && !response.ok ? `HTTP ${response.status} allowed without SMOKE_STRICT_READY=1` : `HTTP ${response.status}`;
    results.push(result(`probe:${route.path}`, okStatus && okBody, detail));
  } catch (error) {
    results.push(result(`probe:${route.path}`, !route.required, error instanceof Error ? error.message : "request failed"));
  }
}

for (const path of protectedRoutes) {
  try {
    const response = await request(path);
    const location = response.headers.get("location") || "";
    const protectedBehavior = response.status === 401 || response.status === 403 || response.status === 307 || response.status === 308 || location.includes("/login");
    results.push(result(`protected:${path}`, protectedBehavior, `HTTP ${response.status}${location ? ` -> ${location}` : ""}`));
  } catch (error) {
    results.push(result(`protected:${path}`, false, error instanceof Error ? error.message : "request failed"));
  }
}

const failed = results.filter((item) => !item.pass);
const passed = results.length - failed.length;

console.log(`TeachX launch smoke: ${passed}/${results.length} checks passed`);
for (const item of results) {
  console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name} - ${item.detail}`);
}

if (failed.length) {
  console.error(`Launch smoke failed with ${failed.length} issue(s).`);
  process.exit(1);
}

console.log("Launch smoke passed.");
