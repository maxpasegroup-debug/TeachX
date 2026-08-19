import { prisma } from "@/lib/db";
import { captureOperationalError } from "@/lib/observability/logger";
import { getBackupEvidence } from "@/lib/recovery/backup-evidence";
import type { BackupEvidence } from "@/lib/recovery/backup-evidence";
import { getRecoveryConfig } from "@/lib/recovery/config";

export async function getBackupReadiness(institutionId: string, requestId?: string) {
  const config = getRecoveryConfig();
  const [settings, contentItems, users, auditLogs] = await Promise.all([
    prisma.setting.count({ where: { institutionId } }),
    prisma.contentItem.count({ where: { institutionId } }),
    prisma.user.count({ where: { institutionId } }),
    prisma.auditLog.count({ where: { institutionId } })
  ]);

  let evidence: BackupEvidence;
  try {
    evidence = await getBackupEvidence();
  } catch (error) {
    captureOperationalError(error, "recovery.evidence_unavailable", { requestId });
    evidence = { available: false, reason: "provider_unavailable" };
  }

  const verified = evidence.available
    && evidence.backupFresh
    && evidence.checksumPresent
    && Boolean(evidence.restoreDrill?.fresh && evidence.restoreDrill.checksumVerified && evidence.restoreDrill.schemaVerified);
  const ok = Boolean(config.storageConfigured && config.pitrEnabled && config.volumeBackupEnabled && config.mediaProtection && config.policyValid && verified);

  return {
    ok,
    provider: config.provider,
    protection: {
      volumeSnapshots: config.volumeBackupEnabled,
      volumeSchedule: config.volumeSchedule || "unconfigured",
      pointInTimeRecovery: config.pitrEnabled,
      offsiteStorage: config.storageConfigured,
      mediaVersioning: config.mediaProtection,
      mediaRetentionDays: config.mediaRetentionDays
    },
    objectives: {
      rpoHours: config.rpoHours,
      rtoMinutes: config.rtoMinutes,
      retentionDays: config.retentionDays,
      restoreDrillMaxAgeDays: config.drillMaxAgeDays,
      valid: config.policyValid
    },
    evidence,
    inventory: {
      settings,
      users,
      auditLogs,
      mediaRecords: contentItems,
      note: "Media inventory counts references only; object durability remains owned by the configured storage provider."
    }
  };
}
