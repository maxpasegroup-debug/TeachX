import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const root = process.cwd();

const requiredFiles = [
  "app/pricing/page.tsx",
  "app/trust/page.tsx",
  "app/status/page.tsx",
  "app/api/status/route.ts",
  "app/privacy/page.tsx",
  "app/terms/page.tsx",
  "app/security/page.tsx",
  "app/refund-policy/page.tsx",
  "app/cookies/page.tsx",
  "app/contact/page.tsx",
  "app/(app)/checkout/[orderId]/page.tsx",
  "app/(app)/teacher/support/page.tsx",
  "app/(app)/admin/launch/page.tsx",
  "app/api/launch/readiness/route.ts",
  "app/.well-known/security.txt/route.ts",
  "docs/PHASE_6_LAUNCH_RUNBOOK.md",
  "docs/PHASE_7_LAUNCH_REHEARSAL.md",
  "docs/PHASE_8_RELEASE_GATE.md",
  "docs/PHASE_9_POST_LAUNCH_RELIABILITY.md",
  "CHANGELOG.md",
  "features/launch-intelligence/actions.ts",
  "services/launch-readiness-service.ts",
  "scripts/launch-smoke.mjs",
  "scripts/launch-gate.mjs",
  "scripts/launch-monitor.mjs",
  "services/public-status-service.ts",
  "release/manifest.json"
];

const requiredEnv = ["DATABASE_URL", "AUTH_SECRET", "AUTH_URL", "NEXT_PUBLIC_APP_URL"];
const recommendedEnv = ["OPENAI_API_KEY", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "STRIPE_SECRET_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "PAYMENTS_LIVE"];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function check(name, pass, detail) {
  return { name, pass, detail };
}

const packageJson = JSON.parse(read("package.json"));
const releaseManifest = JSON.parse(read("release/manifest.json"));
const routePermissions = read("lib/constants/route-permissions.ts");
const navigation = read("lib/constants/navigation.ts");
const nextConfig = read("next.config.ts");
const envExample = read(".env.example");

const checks = [
  ...requiredFiles.map((file) => check(`file:${file}`, existsSync(join(root, file)), file)),
  check("script:build", Boolean(packageJson.scripts?.build), "package.json has build script"),
  check("script:lint", Boolean(packageJson.scripts?.lint), "package.json has lint script"),
  check("script:typecheck", Boolean(packageJson.scripts?.typecheck), "package.json has typecheck script"),
  check("script:launch:verify", packageJson.scripts?.["launch:verify"] === "node scripts/launch-verify.mjs", "package.json exposes launch verifier"),
  check("script:launch:smoke", packageJson.scripts?.["launch:smoke"] === "node scripts/launch-smoke.mjs", "package.json exposes deployment smoke test"),
  check("script:launch:gate", packageJson.scripts?.["launch:gate"] === "node scripts/launch-gate.mjs", "package.json exposes the complete local release gate"),
  check("script:launch:gate:production", packageJson.scripts?.["launch:gate:production"] === "node scripts/launch-gate.mjs --production", "package.json exposes the strict production release gate"),
  check("script:launch:monitor", packageJson.scripts?.["launch:monitor"] === "node scripts/launch-monitor.mjs", "package.json exposes the post-launch monitor"),
  check("release:version", releaseManifest.version === packageJson.version, "release manifest matches package version"),
  check("release:gates", ["launch:verify", "build", "strict-production-smoke", "manual-teacher-rehearsal", "manual-admin-rehearsal"].every((gate) => releaseManifest.requiredGates?.includes(gate)), "release manifest records automated and manual gates"),
  check("public:trust", routePermissions.includes('"/trust"'), "trust route is public"),
  check("public:status", routePermissions.includes('"/status"'), "status route is public"),
  check("public:policies", ["/privacy", "/terms", "/security", "/cookies", "/refund-policy", "/contact"].every((route) => routePermissions.includes(`"${route}"`)), "policy routes are public"),
  check("nav:teacher-help", navigation.includes('href: "/teacher/support"'), "teacher support is in navigation"),
  check("nav:admin-launch", navigation.includes('href: "/admin/launch"'), "admin launch board is in navigation"),
  check("headers:csp", nextConfig.includes("Content-Security-Policy"), "CSP header configured"),
  check("headers:hsts", nextConfig.includes("Strict-Transport-Security"), "HSTS header configured"),
  ...requiredEnv.map((key) => check(`env-required:${key}`, envExample.includes(`${key}=`), `${key} is documented`)),
  ...recommendedEnv.map((key) => check(`env-recommended:${key}`, envExample.includes(`${key}=`), `${key} is documented`))
];

const failed = checks.filter((item) => !item.pass);
const passed = checks.length - failed.length;

console.log(`TeachX launch verification: ${passed}/${checks.length} checks passed`);

for (const item of checks) {
  console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name} - ${item.detail}`);
}

if (failed.length) {
  console.error(`Launch verification failed with ${failed.length} issue(s).`);
  process.exit(1);
}

console.log("Launch verification passed.");
