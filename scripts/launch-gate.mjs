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
run("Prisma schema", "prisma:validate", {
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://launch_gate:launch_gate@127.0.0.1:5432/teachx_validation"
});
run("TypeScript", "typecheck");
run("Lint", "lint");
run("Production build", "build");

if (production) {
  run("Strict production smoke", "launch:smoke", { SMOKE_STRICT_READY: "1" });
}

console.log(`\nTEACHX ${production ? "PRODUCTION" : "LOCAL"} RELEASE GATE PASSED.`);
