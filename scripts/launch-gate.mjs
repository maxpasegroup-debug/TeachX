import { spawnSync } from "node:child_process";
import process from "node:process";

const production = process.argv.includes("--production");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npmCli = process.env.npm_execpath;

function fail(message) {
  console.error(`\nLAUNCH GATE FAILED: ${message}`);
  process.exit(1);
}

function run(label, script, extraEnv = {}) {
  console.log(`\n== ${label} ==`);
  const command = npmCli ? process.execPath : npmCommand;
  const args = npmCli ? [npmCli, "run", script] : ["run", script];
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: { ...process.env, ...extraEnv },
    stdio: "inherit",
    shell: !npmCli && process.platform === "win32"
  });

  if (result.error) {
    fail(`${label} could not start: ${result.error.message}`);
  }

  if (result.status !== 0) {
    fail(`${label} exited with code ${result.status ?? "unknown"}.`);
  }
}

if (production) {
  const target = process.env.SMOKE_BASE_URL;
  if (!target) {
    fail("Production mode requires SMOKE_BASE_URL=https://your-production-domain.");
  }

  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    fail("SMOKE_BASE_URL must be a valid URL.");
  }

  if (parsed.protocol !== "https:") {
    fail("Production mode requires an HTTPS SMOKE_BASE_URL.");
  }
}

console.log(`TeachX release gate: ${production ? "production" : "local"}`);

run("Launch structure", "launch:verify");
run("Dependency security audit", "security:audit");
run("API security policy", "security:routes");
run("Security regression tests", "security:test");
run("Observability policy", "observability:audit");
run("Observability regression tests", "observability:test");
run("Recovery policy", "recovery:audit");
run("Recovery regression tests", "recovery:test");
run("Payment integrity policy", "payments:audit");
run("Payment regression tests", "payments:test");
run("Transactional email policy", "email:audit");
run("Transactional email regression tests", "email:test");
run("Private storage policy", "storage:audit");
run("Private storage regression tests", "storage:test");
run("Low-connectivity resilience policy", "resilience:audit");
run("Low-connectivity resilience tests", "resilience:test");
run("Globalization and accessibility policy", "globalization:audit");
run("Globalization and accessibility tests", "globalization:test");
run("Global scale and performance policy", "performance:audit");
run("Global scale and performance tests", "performance:test");
run("Production operations policy", "operations:audit");
run("Production operations tests", "operations:test");
run("Global privacy governance policy", "privacy:audit");
run("Global privacy governance tests", "privacy:test");
run("Prisma schema", "prisma:validate", {
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://launch_gate:launch_gate@127.0.0.1:5432/teachx_validation"
});
run("TypeScript", "typecheck");
run("Lint", "lint");
run("Production build", "build");

if (production) {
  run("Live recovery evidence", "recovery:verify");
  run("Live payment evidence", "payments:verify");
  run("Live email evidence", "email:verify");
  run("Live private storage evidence", "storage:verify");
  run("Live low-connectivity evidence", "resilience:verify");
  run("Live globalization and accessibility evidence", "globalization:verify");
  run("Live global scale and performance evidence", "performance:verify");
  run("Live production operations evidence", "operations:verify");
  run("Live global privacy evidence", "privacy:verify");
  run("Strict production smoke", "launch:smoke", { SMOKE_STRICT_READY: "1" });
}

console.log(`\nTEACHX ${production ? "PRODUCTION" : "LOCAL"} RELEASE GATE PASSED.`);
