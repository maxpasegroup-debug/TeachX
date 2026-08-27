import { spawnSync } from "node:child_process";

import { getQaDatabaseConfig, verifyQaDatabase } from "./qa-database.mjs";

function stop(message) {
  throw new Error(`QA test runner refused to start: ${message}`);
}

function run(command, args, env) {
  const executable = process.platform === "win32" ? `${command}.cmd` : command;
  const result = spawnSync(executable, args, { cwd: process.cwd(), env, stdio: "inherit" });
  if (result.status !== 0) stop(`${command} ${args.join(" ")} exited with status ${result.status ?? "unknown"}.`);
}

async function main() {
  const config = getQaDatabaseConfig();
  await verifyQaDatabase();

  const redisUrl = process.env.QA_REDIS_URL;
  if (!redisUrl) stop("QA_REDIS_URL is required because authenticated production-mode tests fail closed without Redis.");
  let parsedRedis;
  try {
    parsedRedis = new URL(redisUrl);
  } catch {
    stop("QA_REDIS_URL is invalid.");
  }
  if (!new Set(["redis:", "rediss:"]).has(parsedRedis.protocol)) stop("QA_REDIS_URL must use redis or rediss.");
  if (process.env.PRODUCTION_REDIS_URL && redisUrl === process.env.PRODUCTION_REDIS_URL) stop("QA_REDIS_URL must not equal PRODUCTION_REDIS_URL.");
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) stop("AUTH_SECRET must be a QA-only value of at least 32 characters.");

  const appUrl = "http://127.0.0.1:3100";
  const env = {
    ...process.env,
    DATABASE_URL: config.rawUrl,
    QA001_DATABASE_URL: config.rawUrl,
    QA001_ALLOW_DATABASE_WRITES: "true",
    REDIS_URL: redisUrl,
    AUTH_URL: appUrl,
    NEXT_PUBLIC_APP_URL: appUrl
  };

  run("npx", ["prisma", "generate"], env);
  run("npm", ["run", "build"], env);
  run("npx", ["playwright", "test", "tests/e2e/qa001-community-tenant-isolation.spec.ts"], env);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "QA test runner failed.");
  process.exitCode = 1;
});
