import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import process from "node:process";

const root = process.cwd();
const apiRoot = join(root, "app", "api");
const policy = JSON.parse(readFileSync(join(root, "security", "api-route-policy.json"), "utf8"));

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function routeFor(file) {
  const directory = relative(join(root, "app"), file.slice(0, -`${sep}route.ts`.length));
  return `/${directory.split(sep).join("/")}`;
}

function isPublic(route) {
  return policy.publicExact.includes(route)
    || policy.publicPrefixes.some((prefix) => route === prefix || route.startsWith(`${prefix}/`));
}

function result(name, pass, detail) {
  return { name, pass, detail };
}

const routeFiles = walk(apiRoot).filter((file) => file.endsWith(`${sep}route.ts`));
const routes = routeFiles.map((file) => ({ file, route: routeFor(file), source: readFileSync(file, "utf8") }));
const checks = [];

for (const item of routes) {
  // Routes may use the approved current-user helper, which validates the
  // Auth.js session, active account, session version, and tenant context.
  const explicitAuth = /\brequireApiSession\s*\(|\bauth\s*\(|\bgetCurrentUser\s*\(/.test(item.source);
  checks.push(result(`api:${item.route}`, isPublic(item.route) || explicitAuth, isPublic(item.route) ? "governed public endpoint" : "explicit route authentication"));

  const mutating = /export\s+async\s+function\s+(POST|PUT|PATCH|DELETE)\b/.test(item.source);
  const signedProviderWebhook = (item.route.startsWith("/api/payments/webhooks/") || item.route.startsWith("/api/email/webhooks/"))
    && (/constructEvent\s*\(/.test(item.source) || /verifyRazorpayWebhook\s*\(/.test(item.source) || /verifyResendWebhook\s*\(/.test(item.source));
  const governedPrivacyConsent = item.route === "/api/privacy/consent" && /rateLimit\s*\(/.test(item.source) && /Invalid request origin/.test(item.source);
  const allowedPublicMutation = item.route === "/api/setup" || item.route.startsWith("/api/auth") || signedProviderWebhook || governedPrivacyConsent;
  checks.push(result(`mutation:${item.route}`, !isPublic(item.route) || !mutating || allowedPublicMutation, mutating ? "public mutation policy" : "read-only or protected"));
}

for (const route of policy.publicExact) {
  checks.push(result(`public-policy:${route}`, routes.some((item) => item.route === route), "public exact route exists"));
}

const requiredSecurityFiles = ["proxy.ts", "lib/security.ts", "security/api-route-policy.json"];
for (const file of requiredSecurityFiles) checks.push(result(`file:${file}`, existsSync(join(root, file)), file));

const proxySource = readFileSync(join(root, "proxy.ts"), "utf8");
const setupSource = readFileSync(join(root, "app", "api", "setup", "route.ts"), "utf8");
const securitySource = readFileSync(join(root, "lib", "security.ts"), "utf8");
const nextConfig = readFileSync(join(root, "next.config.ts"), "utf8");

checks.push(result("proxy:private-api", proxySource.includes("if (isApi && !isAuthenticated)"), "private APIs fail before route execution"));
checks.push(result("proxy:public-api", proxySource.indexOf("if (publicApi)") < proxySource.indexOf("token = await getToken"), "public probes do not depend on session decoding"));
checks.push(result("proxy:token-errors", proxySource.includes("catch") && /unauthorizedApi\s*\(/.test(proxySource), "malformed tokens fail closed"));
checks.push(result("proxy:body-limit", proxySource.includes("MAX_API_BODY_BYTES") && proxySource.includes("413"), "API request size limited"));
checks.push(result("setup:secret", setupSource.includes("secureSecretMatch") && setupSource.includes("SETUP_SECRET"), "first-run setup requires secret"));
checks.push(result("rate-limit:redis", securitySource.includes("REDIS_URL") && securitySource.includes("redis.eval(RATE_LIMIT_SCRIPT"), "distributed atomic rate limiting"));
checks.push(result("rate-limit:privacy", securitySource.includes('createHash("sha256")'), "rate-limit identifiers are hashed"));
checks.push(result("rate-limit:fail-closed", securitySource.includes('NODE_ENV === "production" ? unavailableResponse()'), "production limiter fails closed"));
checks.push(result("csp:no-production-eval", nextConfig.includes('process.env.NODE_ENV === "production" ? "" : " \'unsafe-eval\'"'), "unsafe-eval is development-only"));

const failed = checks.filter((item) => !item.pass);
console.log(`TeachX security policy audit: ${checks.length - failed.length}/${checks.length} checks passed across ${routes.length} API routes`);
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name} - ${item.detail}`);

if (failed.length) {
  console.error(`Security policy audit failed with ${failed.length} issue(s).`);
  process.exit(1);
}

console.log("Security policy audit passed.");
