const integer = (value: string | undefined, fallback: number, minimum: number, maximum: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : fallback;
};

export type StorageConfig = ReturnType<typeof getStorageConfig>;

export function getStorageConfig() {
  const provider = process.env.STORAGE_PROVIDER?.trim().toLowerCase() ?? "";
  const endpoint = process.env.STORAGE_S3_ENDPOINT?.trim() ?? "";
  const region = process.env.STORAGE_S3_REGION?.trim() || "us-east-1";
  const bucket = process.env.STORAGE_S3_BUCKET?.trim() ?? "";
  const accessKeyId = process.env.STORAGE_S3_ACCESS_KEY_ID?.trim() ?? "";
  const secretAccessKey = process.env.STORAGE_S3_SECRET_ACCESS_KEY?.trim() ?? "";
  const prefix = (process.env.STORAGE_S3_PREFIX?.trim() || "teachx").replace(/^\/+|\/+$/g, "");
  const maxFileMb = integer(process.env.STORAGE_MAX_FILE_MB, 100, 1, 500);
  const defaultQuotaMb = integer(process.env.STORAGE_DEFAULT_QUOTA_MB, 1024, 1, 1_048_576);
  const uploadTtlSeconds = integer(process.env.STORAGE_UPLOAD_TTL_SECONDS, 600, 60, 3600);
  const downloadTtlSeconds = integer(process.env.STORAGE_DOWNLOAD_TTL_SECONDS, 300, 30, 3600);
  const multipartThresholdMb = integer(process.env.STORAGE_MULTIPART_THRESHOLD_MB, 10, 5, 500);
  const multipartPartMb = integer(process.env.STORAGE_MULTIPART_PART_MB, 8, 5, 100);
  const resumableTtlHours = integer(process.env.STORAGE_RESUMABLE_TTL_HOURS, 48, 1, 168);
  const credentialsReady = Boolean(bucket && accessKeyId && secretAccessKey);
  const controlsReady = ["STORAGE_PRIVATE_BUCKET_READY", "STORAGE_CORS_READY", "STORAGE_RETENTION_READY", "STORAGE_CLEANUP_READY"]
    .every((key) => process.env[key] === "true");

  return {
    provider,
    endpoint,
    region,
    bucket,
    accessKeyId,
    secretAccessKey,
    prefix,
    maxFileMb,
    maxFileBytes: maxFileMb * 1024 * 1024,
    defaultQuotaMb,
    uploadTtlSeconds,
    downloadTtlSeconds,
    multipartThresholdBytes: multipartThresholdMb * 1024 * 1024,
    multipartPartBytes: multipartPartMb * 1024 * 1024,
    multipartThresholdMb,
    multipartPartMb,
    resumableTtlHours,
    forcePathStyle: process.env.STORAGE_S3_FORCE_PATH_STYLE === "true",
    credentialsReady,
    controlsReady,
    live: provider === "s3" && credentialsReady && controlsReady
  };
}

export function requireStorageConfig() {
  const config = getStorageConfig();
  if (!config.live) throw new Error("Private storage is not fully configured.");
  return config;
}
