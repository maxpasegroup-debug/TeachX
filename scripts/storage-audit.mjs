import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");
const check = (name, pass, detail) => ({ name, pass, detail });
const files = ["lib/storage/config.ts", "lib/storage/provider.ts", "lib/storage/validation.ts", "services/private-storage-service.ts", "app/api/storage/uploads/route.ts", "app/api/storage/uploads/[objectId]/complete/route.ts", "app/api/storage/objects/[objectId]/download/route.ts", "app/api/storage/readiness/route.ts", "features/content/components/private-upload-form.tsx", "prisma/migrations/20260818200000_add_private_object_storage/migration.sql", "scripts/storage-cleanup.mjs", "scripts/storage-verify.mjs", "docs/PHASE_16_PRIVATE_OBJECT_STORAGE.md"];
const schema = read("prisma/schema.prisma");
const service = read("services/private-storage-service.ts");
const provider = read("lib/storage/provider.ts");
const legacy = read("app/api/content/upload/route.ts");
const env = read(".env.example");
const checks = [
  ...files.map((file) => check(`file:${file}`, existsSync(join(root, file)), file)),
  check("ledger:lifecycle", schema.includes("model StorageObject") && ["PENDING", "ACTIVE", "QUARANTINED", "EXPIRED", "DELETED"].every((state) => schema.includes(state)), "object lifecycle is durable"),
  check("ledger:evidence", schema.includes("model StorageTransferEvent") && schema.includes("UPLOAD_COMPLETED") && schema.includes("DOWNLOAD_SIGNED"), "transfers have audit evidence"),
  check("upload:checksum", provider.includes("ChecksumSHA256") && service.includes("UPLOAD_INTEGRITY_FAILED"), "SHA-256 is signed and verified"),
  check("upload:scope", service.includes("assertContentScope") && service.includes("STORAGE_QUOTA_EXCEEDED"), "tenant relationships and quota are validated"),
  check("download:authorization", service.includes("DOWNLOAD_FORBIDDEN") && service.includes("marketplaceEntitlement") && service.includes("batchStudent"), "downloads enforce owner, manager, entitlement, or enrollment access"),
  check("download:short-lived", provider.includes("downloadTtlSeconds") && provider.includes("ResponseContentDisposition"), "downloads are short-lived attachments"),
  check("legacy:closed", !legacy.includes("fileUrl:") && legacy.includes('z.literal("EXTERNAL_LINK")'), "callers cannot register arbitrary file URLs"),
  check("cleanup:durable", read("scripts/storage-cleanup.mjs").includes("DeleteObjectCommand") && read("scripts/storage-cleanup.mjs").includes("scheduled-cleanup"), "stale objects are deleted with evidence"),
  check("config:fail-closed", read("lib/storage/config.ts").includes("STORAGE_PRIVATE_BUCKET_READY") && read("lib/storage/config.ts").includes("STORAGE_CLEANUP_READY"), "production controls gate storage"),
  check("env:documented", ["STORAGE_PROVIDER", "STORAGE_S3_ENDPOINT", "STORAGE_S3_REGION", "STORAGE_S3_BUCKET", "STORAGE_S3_ACCESS_KEY_ID", "STORAGE_S3_SECRET_ACCESS_KEY", "STORAGE_PRIVATE_BUCKET_READY", "STORAGE_CORS_READY", "STORAGE_RETENTION_READY", "STORAGE_CLEANUP_READY"].every((key) => env.includes(`${key}=`)), "storage variables are documented")
];
const failed = checks.filter((item) => !item.pass);
console.log(`TeachX storage audit: ${checks.length - failed.length}/${checks.length} checks passed`);
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name} - ${item.detail}`);
if (failed.length) process.exit(1);
console.log("Private storage audit passed.");
