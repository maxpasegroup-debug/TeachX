import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const QA_MARKER = "TEACHX_QA_ONLY";
const QA_DATABASE_PATTERN = /^teachx_(?:qa|test)(?:_[a-z0-9_]+)?$/;
const qaEnvFile = path.join(process.cwd(), ".env.qa.local");
const expectedCheckConstraints = [
  "MarketplaceBuyerReview_rating_check",
  "MarketplaceListing_price_nonnegative_check",
  "MarketplaceListing_previous_price_nonnegative_check",
  "MarketplaceListing_currency_format_check",
  "StudentCommunityVote_value_check",
  "StudentCommunityBlock_not_self_check",
  "StudentCommunityResourceShare_type_check",
  "StudentGroupEvent_kind_check",
  "StudentGroupEvent_status_check",
  "StudentGroupEvent_time_check",
  "StudentGroupEventRsvp_status_check",
  "StudentGroupChallenge_kind_check",
  "StudentGroupChallenge_status_check",
  "StudentGroupChallenge_target_check",
  "StudentGroupChallenge_time_check",
  "StudentGroupChallengeParticipant_progress_check",
  "StudentCommunityReputation_points_check",
  "StudentCommunityReputation_event_check",
  "StudentCommunityResourceShare_version_check",
  "StudentCommunityResourceShare_status_check"
];

if (fs.existsSync(qaEnvFile)) {
  if (typeof process.loadEnvFile !== "function") throw new Error("Node.js 20.12 or newer is required to load .env.qa.local safely.");
  process.loadEnvFile(qaEnvFile);
}

function stop(message) {
  throw new Error(`QA database safety check failed: ${message}`);
}

function databaseIdentity(url) {
  return `${url.hostname.toLowerCase()}:${url.port || "5432"}/${decodeURIComponent(url.pathname.slice(1)).toLowerCase()}`;
}

export function getQaDatabaseConfig() {
  const rawUrl = process.env.QA_DATABASE_URL || process.env.QA001_DATABASE_URL;
  if (!rawUrl) stop("QA_DATABASE_URL is required.");
  if (process.env.QA_DATABASE_CONFIRM !== QA_MARKER) stop(`QA_DATABASE_CONFIRM must equal ${QA_MARKER}.`);
  if (process.env.QA_ALLOW_DATABASE_WRITES !== "true") stop("QA_ALLOW_DATABASE_WRITES must equal true.");
  if (process.env.NODE_ENV === "production") stop("NODE_ENV=production is never allowed for QA database tooling.");

  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    stop("QA_DATABASE_URL is not a valid URL.");
  }

  if (!new Set(["postgres:", "postgresql:"]).has(url.protocol)) stop("QA_DATABASE_URL must use PostgreSQL.");
  const databaseName = decodeURIComponent(url.pathname.slice(1));
  if (!QA_DATABASE_PATTERN.test(databaseName)) {
    stop("the database name must be teachx_qa, teachx_test, or begin with teachx_qa_/teachx_test_.");
  }
  if (!url.username || !url.hostname) stop("QA_DATABASE_URL must include a database user and host.");

  const productionUrl = process.env.PRODUCTION_DATABASE_URL;
  if (productionUrl) {
    let parsedProductionUrl;
    try {
      parsedProductionUrl = new URL(productionUrl);
    } catch {
      stop("PRODUCTION_DATABASE_URL is present but invalid, so isolation cannot be compared safely.");
    }
    if (databaseIdentity(url) === databaseIdentity(parsedProductionUrl)) stop("QA and production database identities are identical.");
  }

  return { rawUrl, databaseName };
}

async function connect(config) {
  process.env.DATABASE_URL = config.rawUrl;
  const { PrismaClient } = await import("@prisma/client");
  return new PrismaClient({ datasourceUrl: config.rawUrl });
}

async function inspectDatabase(prisma) {
  const [identity] = await prisma.$queryRawUnsafe(`
    SELECT
      current_database() AS "databaseName",
      COALESCE((SELECT description FROM pg_shdescription WHERE objoid = (SELECT oid FROM pg_database WHERE datname = current_database())), '') AS marker,
      (SELECT COUNT(*)::integer FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name <> '_prisma_migrations') AS "tableCount"
  `);
  return { databaseName: identity.databaseName, marker: identity.marker, tableCount: Number(identity.tableCount) };
}

export async function verifyQaDatabase({ allowInitialize = false, requireSchema = true } = {}) {
  const config = getQaDatabaseConfig();
  const prisma = await connect(config);
  try {
    const identity = await inspectDatabase(prisma);
    if (identity.databaseName !== config.databaseName) stop("the connected database name differs from QA_DATABASE_URL.");

    if (identity.marker !== QA_MARKER) {
      if (!allowInitialize) stop(`database comment marker ${QA_MARKER} is missing.`);
      if (process.env.QA_DATABASE_INITIALIZE !== "true") stop("QA_DATABASE_INITIALIZE=true is required to mark a new QA database.");
      if (identity.tableCount !== 0) stop("an unmarked non-empty database is never eligible for QA initialization.");
      await prisma.$executeRawUnsafe(`COMMENT ON DATABASE "${config.databaseName}" IS '${QA_MARKER}'`);
    }

    const verified = await inspectDatabase(prisma);
    if (verified.marker !== QA_MARKER) stop("the QA database marker could not be verified after initialization.");
    if (requireSchema && verified.tableCount === 0) stop("the QA database is marked but the application schema has not been prepared.");
    if (requireSchema) {
      const checks = await prisma.$queryRawUnsafe(`SELECT conname AS name FROM pg_constraint WHERE contype = 'c'`);
      const checkNames = new Set(checks.map((row) => row.name));
      const missingChecks = expectedCheckConstraints.filter((name) => !checkNames.has(name));
      if (missingChecks.length) stop(`SQL-managed check constraints are missing: ${missingChecks.join(", ")}.`);

      const expectedMigrations = fs.readdirSync(path.join(process.cwd(), "prisma", "migrations"), { withFileTypes: true })
        .filter((entry) => entry.isDirectory()).length;
      const [migrationState] = await prisma.$queryRawUnsafe(`
        SELECT
          COUNT(*) FILTER (WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL)::integer AS applied,
          COUNT(*) FILTER (WHERE finished_at IS NULL OR rolled_back_at IS NOT NULL)::integer AS incomplete
        FROM "_prisma_migrations"
      `);
      if (Number(migrationState.applied) !== expectedMigrations || Number(migrationState.incomplete) !== 0) {
        stop(`migration ledger is incomplete: expected ${expectedMigrations} applied and 0 incomplete.`);
      }
    }
    return { config, tableCount: verified.tableCount };
  } finally {
    await prisma.$disconnect();
  }
}

function run(command, args, env) {
  const executable = process.platform === "win32" ? `${command}.cmd` : command;
  const result = spawnSync(executable, args, { cwd: process.cwd(), env, stdio: "inherit" });
  if (result.status !== 0) stop(`${command} ${args.join(" ")} exited with status ${result.status ?? "unknown"}.`);
}

async function prepare() {
  const { config } = await verifyQaDatabase({ allowInitialize: true, requireSchema: false });
  const env = { ...process.env, DATABASE_URL: config.rawUrl };
  run("npx", ["prisma", "migrate", "deploy"], env);
  run("npx", ["prisma", "migrate", "status"], env);
  run("npx", ["prisma", "migrate", "diff", "--from-schema-datasource", "prisma/schema.prisma", "--to-schema-datamodel", "prisma/schema.prisma", "--exit-code"], env);
  const verified = await verifyQaDatabase();
  console.log(`QA database ready: ${verified.config.databaseName} (${verified.tableCount} application tables).`);
}

async function main() {
  const mode = process.argv[2] || "verify";
  if (mode === "prepare") return prepare();
  if (mode === "verify") {
    const verified = await verifyQaDatabase();
    console.log(`QA database verified: ${verified.config.databaseName} (${verified.tableCount} application tables).`);
    return;
  }
  stop(`unknown mode ${mode}. Use verify or prepare.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "QA database safety check failed.");
    process.exitCode = 1;
  });
}
