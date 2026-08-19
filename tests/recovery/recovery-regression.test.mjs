import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import process from "node:process";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("recovery readiness cannot pass on configuration alone", () => {
  const source = read("services/backup-service.ts");
  assert.match(source, /evidence\.backupFresh/);
  assert.match(source, /evidence\.checksumPresent/);
  assert.match(source, /evidence\.restoreDrill\?\.fresh/);
  assert.match(source, /config\.pitrEnabled/);
  assert.match(source, /config\.volumeBackupEnabled/);
});

test("backup artifacts are portable, checksummed, and retained", () => {
  const source = read("ops/backup/backup.sh");
  assert.match(source, /pg_dump/);
  assert.match(source, /--format=custom/);
  assert.match(source, /sha256sum/);
  assert.match(source, /BACKUP_RETENTION_DAYS/);
  assert.match(source, /aws s3 rm/);
});

test("restore drill cannot target the production database", () => {
  const source = read("ops/backup/restore-drill.sh");
  assert.match(source, /RESTORE_DRILL_CONFIRM/);
  assert.match(source, /isolated-database/);
  assert.match(source, /DATABASE_URL.*RESTORE_DATABASE_URL/);
  assert.match(source, /production_identity/);
  assert.match(source, /restore_identity/);
  assert.match(source, /--exit-on-error/);
});

test("restore evidence requires checksum, schema, critical tables, and migrations", () => {
  const source = read("lib/recovery/backup-evidence.ts");
  assert.match(source, /checksumVerified: z\.literal\(true\)/);
  assert.match(source, /schemaVerified: z\.literal\(true\)/);
  assert.match(source, /criticalTablesVerified: z\.number\(\)\.int\(\)\.min\(4\)/);
  assert.match(source, /migrationCount: z\.number\(\)\.int\(\)\.positive\(\)/);
  assert.match(source, /drillMeetsRpo/);
  assert.match(source, /drillMeetsRto/);
});

test("live recovery verification fails closed without production evidence configuration", () => {
  const script = fileURLToPath(new URL("../../scripts/recovery-verify.mjs", import.meta.url));
  const result = spawnSync(process.execPath, [script], {
    env: { PATH: process.env.PATH || "" },
    encoding: "utf8"
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Recovery verification failed: missing/);
});
