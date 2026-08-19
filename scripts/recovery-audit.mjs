import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");
const check = (name, pass, detail) => ({ name, pass, detail });

const requiredFiles = [
  "lib/recovery/config.ts",
  "lib/recovery/backup-evidence.ts",
  "services/backup-service.ts",
  "app/api/backup/readiness/route.ts",
  "ops/backup/Dockerfile",
  "ops/backup/backup.sh",
  "ops/backup/restore-drill.sh",
  "scripts/recovery-verify.mjs",
  "docs/PHASE_13_DATA_RESILIENCE.md"
];

const config = read("lib/recovery/config.ts");
const evidence = read("lib/recovery/backup-evidence.ts");
const service = read("services/backup-service.ts");
const route = read("app/api/backup/readiness/route.ts");
const backup = read("ops/backup/backup.sh");
const restore = read("ops/backup/restore-drill.sh");
const env = read(".env.example");

const variables = [
  "BACKUP_PROVIDER", "BACKUP_S3_ENDPOINT", "BACKUP_S3_REGION", "BACKUP_S3_BUCKET",
  "BACKUP_S3_ACCESS_KEY_ID", "BACKUP_S3_SECRET_ACCESS_KEY", "BACKUP_S3_PREFIX",
  "BACKUP_PITR_ENABLED", "BACKUP_VOLUME_SCHEDULE", "BACKUP_RPO_HOURS",
  "BACKUP_RTO_MINUTES", "BACKUP_RETENTION_DAYS", "BACKUP_DRILL_MAX_AGE_DAYS",
  "BACKUP_MEDIA_VERSIONING_ENABLED", "BACKUP_MEDIA_RETENTION_DAYS"
];

const checks = [
  ...requiredFiles.map((file) => check(`file:${file}`, existsSync(join(root, file)), file)),
  check("policy:rpo", config.includes("rpoHours <= 24"), "RPO cannot exceed 24 hours"),
  check("policy:rto", config.includes("rtoMinutes <= 120"), "RTO cannot exceed 120 minutes"),
  check("policy:retention", config.includes("retentionDays >= 30"), "portable dumps retained for at least 30 days"),
  check("policy:media", config.includes("mediaRetentionDays >= 30") && service.includes("config.mediaProtection"), "media versioning and retention are required"),
  check("policy:drill-age", config.includes("drillMaxAgeDays <= 90"), "restore drills required at least quarterly"),
  check("evidence:private-s3", evidence.includes("S3Client") && evidence.includes("forcePathStyle: true"), "private S3-compatible evidence is queried server-side"),
  check("evidence:checksum", evidence.includes("HeadObjectCommand") && evidence.includes(".sha256"), "latest dump requires checksum evidence"),
  check("evidence:restore-schema", evidence.includes('schemaVerified: z.literal(true)') && evidence.includes("criticalTablesVerified"), "restore evidence is schema validated"),
  check("evidence:objectives", evidence.includes("drillMeetsRpo") && evidence.includes("drillMeetsRto") && evidence.includes("drillSourceAgeHours"), "restore evidence must meet RPO and RTO"),
  check("readiness:truthful", service.includes("evidence.backupFresh") && service.includes("evidence.checksumPresent") && service.includes("evidence.restoreDrill?.fresh"), "readiness requires fresh backup and drill evidence"),
  check("readiness:protected", route.includes('requireApiSession("settings.manage")'), "recovery readiness is operator-only"),
  check("backup:portable", backup.includes("pg_dump") && backup.includes("--format=custom") && backup.includes("--no-owner"), "portable compressed PostgreSQL dump created"),
  check("backup:checksum", backup.includes("sha256sum") && backup.includes(".sha256"), "backup checksum uploaded"),
  check("backup:retention", backup.includes("BACKUP_RETENTION_DAYS") && backup.includes("s3 rm"), "expired dump objects are removed"),
  check("restore:isolation", restore.includes('RESTORE_DRILL_CONFIRM') && restore.includes('!= "isolated-database"') && restore.includes("production_identity") && restore.includes("restore_identity"), "restore refuses an unconfirmed or matching production database identity"),
  check("restore:integrity", restore.includes("expected") && restore.includes("actual") && restore.includes("pg_restore") && restore.includes("--exit-on-error"), "restore verifies checksum and fails on SQL errors"),
  check("restore:critical-schema", restore.includes("'User','Institution','AuditLog','Setting'") && restore.includes('"_prisma_migrations"'), "restore verifies critical tables and migrations"),
  check("env:documented", variables.every((key) => env.includes(`${key}=`)), "all Railway recovery variables are documented")
];

const failed = checks.filter((item) => !item.pass);
console.log(`TeachX recovery audit: ${checks.length - failed.length}/${checks.length} checks passed`);
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name} - ${item.detail}`);
if (failed.length) {
  console.error(`Recovery audit failed with ${failed.length} issue(s).`);
  process.exit(1);
}
console.log("Recovery audit passed.");
