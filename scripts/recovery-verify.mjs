import { GetObjectCommand, HeadObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import process from "node:process";

const required = [
  "BACKUP_PROVIDER", "BACKUP_S3_ENDPOINT", "BACKUP_S3_REGION", "BACKUP_S3_BUCKET",
  "BACKUP_S3_ACCESS_KEY_ID", "BACKUP_S3_SECRET_ACCESS_KEY", "BACKUP_S3_PREFIX",
  "BACKUP_PITR_ENABLED", "BACKUP_VOLUME_SCHEDULE", "BACKUP_RPO_HOURS",
  "BACKUP_RTO_MINUTES", "BACKUP_RETENTION_DAYS", "BACKUP_DRILL_MAX_AGE_DAYS",
  "BACKUP_MEDIA_VERSIONING_ENABLED", "BACKUP_MEDIA_RETENTION_DAYS"
];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Recovery verification failed: missing ${missing.join(", ")}.`);
  process.exit(1);
}

const rpoHours = Number(process.env.BACKUP_RPO_HOURS);
const rtoMinutes = Number(process.env.BACKUP_RTO_MINUTES);
const retentionDays = Number(process.env.BACKUP_RETENTION_DAYS);
const drillMaxAgeDays = Number(process.env.BACKUP_DRILL_MAX_AGE_DAYS);
const mediaRetentionDays = Number(process.env.BACKUP_MEDIA_RETENTION_DAYS);
const schedule = process.env.BACKUP_VOLUME_SCHEDULE.toLowerCase();
if (!(rpoHours > 0 && rpoHours <= 24 && rtoMinutes > 0 && rtoMinutes <= 120 && retentionDays >= 30 && mediaRetentionDays >= 30 && drillMaxAgeDays > 0 && drillMaxAgeDays <= 90)) {
  console.error("Recovery verification failed: RPO, RTO, retention, or drill-age policy is outside the launch standard.");
  process.exit(1);
}
if (process.env.BACKUP_PITR_ENABLED !== "true" || !["daily", "daily+weekly", "daily+weekly+monthly"].includes(schedule)) {
  console.error("Recovery verification failed: PITR and daily volume snapshots must be enabled.");
  process.exit(1);
}
if (process.env.BACKUP_MEDIA_VERSIONING_ENABLED !== "true") {
  console.error("Recovery verification failed: media object versioning must be enabled.");
  process.exit(1);
}

const s3 = new S3Client({
  endpoint: process.env.BACKUP_S3_ENDPOINT,
  region: process.env.BACKUP_S3_REGION,
  forcePathStyle: true,
  credentials: { accessKeyId: process.env.BACKUP_S3_ACCESS_KEY_ID, secretAccessKey: process.env.BACKUP_S3_SECRET_ACCESS_KEY }
});
const bucket = process.env.BACKUP_S3_BUCKET;
const prefix = process.env.BACKUP_S3_PREFIX.replace(/^\/+|\/+$/g, "");

try {
  const listed = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: `${prefix}/database/`, MaxKeys: 1000 }));
  const latest = (listed.Contents || []).filter((item) => item.Key?.endsWith(".dump") && item.LastModified).sort((a, b) => b.LastModified.getTime() - a.LastModified.getTime())[0];
  if (!latest?.Key || !latest.LastModified) throw new Error("No portable database backup was found.");
  const ageHours = (Date.now() - latest.LastModified.getTime()) / 3_600_000;
  if (ageHours > rpoHours) throw new Error(`Latest backup exceeds the ${rpoHours}-hour RPO.`);
  await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: `${latest.Key}.sha256` }));

  const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: `${prefix}/recovery/latest.json` }));
  const body = await response.Body?.transformToString();
  const drill = JSON.parse(body || "null");
  const drillAgeDays = (Date.now() - new Date(drill?.completedAt).getTime()) / 86_400_000;
  const drillSourceAgeHours = (new Date(drill?.completedAt).getTime() - new Date(drill?.backupCreatedAt).getTime()) / 3_600_000;
  const drillDurationMinutes = Number(drill?.durationSeconds) / 60;
  const validDrill = drill?.schemaVersion === 1 && drill?.result === "passed" && drill?.checksumVerified === true && drill?.schemaVerified === true
    && drill?.criticalTablesVerified >= 4 && drill?.migrationCount > 0 && typeof drill?.backupKey === "string"
    && drill.backupKey.startsWith(`${prefix}/database/`) && drill.backupKey.endsWith(".dump")
    && Number.isFinite(drillAgeDays) && drillAgeDays <= drillMaxAgeDays
    && Number.isFinite(drillSourceAgeHours) && drillSourceAgeHours >= 0 && drillSourceAgeHours <= rpoHours
    && Number.isFinite(drillDurationMinutes) && drillDurationMinutes > 0 && drillDurationMinutes <= rtoMinutes;
  if (!validDrill) throw new Error("Restore-drill evidence is missing, stale, or incomplete.");

  console.log(`TeachX recovery verification passed: backup age ${ageHours.toFixed(2)}h, restore drill age ${drillAgeDays.toFixed(2)}d.`);
} catch (error) {
  console.error(`Recovery verification failed: ${error instanceof Error ? error.message : "provider request failed"}`);
  process.exit(1);
}
