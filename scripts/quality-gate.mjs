import { spawnSync } from "node:child_process";
import process from "node:process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npmCli = process.env.npm_execpath;

function run(label, script) {
  console.log(`\n== ${label} ==`);
  const command = npmCli ? process.execPath : npmCommand;
  const args = npmCli ? [npmCli, "run", script] : ["run", script];
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
    shell: !npmCli && process.platform === "win32"
  });

  if (result.error || result.status !== 0) {
    console.error(`\nQUALITY GATE FAILED: ${label}${result.error ? `: ${result.error.message}` : ""}`);
    process.exit(result.status || 1);
  }
}

run("Static release gate", "launch:gate");
run("Desktop and mobile browser certification", "test:browser");
run("Lighthouse budgets", "quality:lighthouse");

console.log("\nTEACHX AUTOMATED QUALITY GATE PASSED.");
