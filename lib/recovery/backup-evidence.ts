import "server-only";

import { GetObjectCommand, HeadObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { z } from "zod";

import { getRecoveryConfig } from "@/lib/recovery/config";

const restoreEvidenceSchema = z.object({
  schemaVersion: z.literal(1),
  result: z.literal("passed"),
  completedAt: z.string().datetime(),
  durationSeconds: z.number().positive(),
  backupKey: z.string().min(1),
  backupCreatedAt: z.string().datetime(),
  checksumVerified: z.literal(true),
  schemaVerified: z.literal(true),
  criticalTablesVerified: z.number().int().min(4),
  migrationCount: z.number().int().positive()
});

function client() {
  return new S3Client({
    endpoint: process.env.BACKUP_S3_ENDPOINT,
    region: process.env.BACKUP_S3_REGION,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.BACKUP_S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.BACKUP_S3_SECRET_ACCESS_KEY!
    }
  });
}

export type BackupEvidence = Awaited<ReturnType<typeof getBackupEvidence>> | {
  available: false;
  reason: "provider_unavailable";
};

export async function getBackupEvidence(now = new Date()) {
  const config = getRecoveryConfig();
  if (!config.storageConfigured) {
    return { available: false as const, reason: "storage_not_configured" as const };
  }

  const s3 = client();
  const bucket = process.env.BACKUP_S3_BUCKET!;
  const databasePrefix = `${config.prefix}/database/`;
  const listed = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: databasePrefix, MaxKeys: 1000 }));
  const latest = (listed.Contents || [])
    .filter((item) => item.Key?.endsWith(".dump") && item.LastModified)
    .sort((left, right) => right.LastModified!.getTime() - left.LastModified!.getTime())[0];

  if (!latest?.Key || !latest.LastModified) {
    return { available: false as const, reason: "backup_missing" as const };
  }

  let checksumPresent = false;
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: `${latest.Key}.sha256` }));
    checksumPresent = true;
  } catch {
    checksumPresent = false;
  }

  let drill: z.infer<typeof restoreEvidenceSchema> | null = null;
  try {
    const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: `${config.prefix}/recovery/latest.json` }));
    const body = await response.Body?.transformToString();
    if (body) {
      const parsed = restoreEvidenceSchema.parse(JSON.parse(body));
      if (parsed.backupKey.startsWith(databasePrefix) && parsed.backupKey.endsWith(".dump")) drill = parsed;
    }
  } catch {
    drill = null;
  }

  const backupAgeHours = Math.max(0, (now.getTime() - latest.LastModified.getTime()) / 3_600_000);
  const drillAgeDays = drill ? Math.max(0, (now.getTime() - new Date(drill.completedAt).getTime()) / 86_400_000) : null;
  const drillSourceAgeHours = drill ? Math.max(0, (new Date(drill.completedAt).getTime() - new Date(drill.backupCreatedAt).getTime()) / 3_600_000) : null;
  const drillMeetsRpo = Boolean(drill && config.rpoHours && drillSourceAgeHours !== null && drillSourceAgeHours <= config.rpoHours);
  const drillMeetsRto = Boolean(drill && config.rtoMinutes && drill.durationSeconds / 60 <= config.rtoMinutes);
  const backupFresh = Boolean(config.rpoHours && backupAgeHours <= config.rpoHours);
  const drillFresh = Boolean(drill && config.drillMaxAgeDays && drillAgeDays !== null && drillAgeDays <= config.drillMaxAgeDays && drillMeetsRpo && drillMeetsRto);

  return {
    available: true as const,
    latestBackupAt: latest.LastModified.toISOString(),
    backupAgeHours: Number(backupAgeHours.toFixed(2)),
    backupFresh,
    checksumPresent,
    restoreDrill: drill ? {
      completedAt: drill.completedAt,
      durationMinutes: Number((drill.durationSeconds / 60).toFixed(2)),
      ageDays: Number(drillAgeDays!.toFixed(2)),
      sourceBackupAgeHours: Number(drillSourceAgeHours!.toFixed(2)),
      fresh: drillFresh,
      meetsRpo: drillMeetsRpo,
      meetsRto: drillMeetsRto,
      checksumVerified: drill.checksumVerified,
      schemaVerified: drill.schemaVerified,
      criticalTablesVerified: drill.criticalTablesVerified,
      migrationCount: drill.migrationCount
    } : null
  };
}
