import "server-only";

function positiveNumber(value: string | undefined) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function getRecoveryConfig() {
  const prefix = (process.env.BACKUP_S3_PREFIX || "teachx-production").replace(/^\/+|\/+$/g, "");
  const rpoHours = positiveNumber(process.env.BACKUP_RPO_HOURS);
  const rtoMinutes = positiveNumber(process.env.BACKUP_RTO_MINUTES);
  const retentionDays = positiveNumber(process.env.BACKUP_RETENTION_DAYS);
  const drillMaxAgeDays = positiveNumber(process.env.BACKUP_DRILL_MAX_AGE_DAYS);
  const volumeSchedule = process.env.BACKUP_VOLUME_SCHEDULE?.toLowerCase() || "";
  const mediaRetentionDays = positiveNumber(process.env.BACKUP_MEDIA_RETENTION_DAYS);

  const storageConfigured = Boolean(
    process.env.BACKUP_S3_ENDPOINT
      && process.env.BACKUP_S3_REGION
      && process.env.BACKUP_S3_BUCKET
      && process.env.BACKUP_S3_ACCESS_KEY_ID
      && process.env.BACKUP_S3_SECRET_ACCESS_KEY
  );

  return {
    provider: process.env.BACKUP_PROVIDER || "unconfigured",
    prefix,
    storageConfigured,
    pitrEnabled: process.env.BACKUP_PITR_ENABLED === "true",
    volumeSchedule,
    volumeBackupEnabled: ["daily", "daily+weekly", "daily+weekly+monthly"].includes(volumeSchedule),
    mediaProtection: process.env.BACKUP_MEDIA_VERSIONING_ENABLED === "true",
    mediaRetentionDays,
    rpoHours,
    rtoMinutes,
    retentionDays,
    drillMaxAgeDays,
    policyValid: Boolean(
      rpoHours && rpoHours <= 24
        && rtoMinutes && rtoMinutes <= 120
      && retentionDays && retentionDays >= 30
        && mediaRetentionDays && mediaRetentionDays >= 30
        && drillMaxAgeDays && drillMaxAgeDays <= 90
    )
  };
}
