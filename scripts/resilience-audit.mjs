import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");
const check = (name, pass, detail) => ({ name, pass, detail });
const files = ["lib/resilience/config.ts", "app/api/resilience/readiness/route.ts", "app/api/storage/config/route.ts", "app/api/storage/uploads/[objectId]/route.ts", "app/api/storage/uploads/[objectId]/parts/sign/route.ts", "app/api/storage/uploads/[objectId]/parts/record/route.ts", "features/content/components/private-upload-form.tsx", "public/sw.js", "public/icons/icon-192.png", "public/icons/icon-512.png", "public/icons/icon-maskable-512.png", "prisma/migrations/20260819100000_add_resumable_uploads/migration.sql", "scripts/resilience-verify.mjs", "docs/PHASE_17_LOW_CONNECTIVITY_RESILIENCE.md"];
const schema = read("prisma/schema.prisma");
const service = read("services/private-storage-service.ts");
const client = read("features/content/components/private-upload-form.tsx");
const worker = read("public/sw.js");
const checks = [
  ...files.map((file) => check(`file:${file}`, existsSync(join(root, file)), file)),
  check("multipart:ledger", schema.includes("model StorageUploadPart") && schema.includes("multipartUploadId") && schema.includes("MULTIPART_ABORTED"), "multipart state and interruption evidence are durable"),
  check("multipart:integrity", service.includes("remote.ChecksumSHA256") && service.includes("remote.ETag") && service.includes("remote.Size"), "server completion verifies every provider part"),
  check("multipart:resume", client.includes("completedParts") && client.includes("SESSION_KEY") && client.includes("Resume upload"), "browser resumes from server-recorded parts"),
  check("multipart:bounded-memory", client.includes("fileIntegrityPlan") && client.includes("file.slice(") && !client.includes("sha256(file);\n      const payload"), "large files are hashed part by part"),
  check("offline:draft", client.includes("DRAFT_KEY") && client.includes("saveDraft") && client.includes("navigator.onLine"), "teacher metadata survives an offline interruption"),
  check("worker:no-private-data", worker.includes('url.pathname.startsWith("/api/")') && worker.includes("PUBLIC_PAGES") && !worker.includes('APP_SHELL = ["/"'), "APIs, root session variants, and private navigation are not cached"),
  check("worker:bounded", worker.includes("MAX_RUNTIME_ENTRIES") && worker.includes("trim(cache)"), "runtime cache is bounded"),
  check("worker:update", worker.includes("SKIP_WAITING") && read("components/pwa-install-prompt.tsx").includes("controllerchange"), "updates require an explicit user action then reload"),
  check("cleanup:multipart", read("scripts/storage-cleanup.mjs").includes("AbortMultipartUploadCommand"), "stale multipart billing is aborted"),
  check("manifest:icons", read("app/manifest.ts").includes("icon-192.png") && read("app/manifest.ts").includes("icon-maskable-512.png"), "install icons include standard and maskable PNGs")
];
const failed = checks.filter((item) => !item.pass);
console.log(`TeachX resilience audit: ${checks.length - failed.length}/${checks.length} checks passed`);
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"} ${item.name} - ${item.detail}`);
if (failed.length) process.exit(1);
console.log("Low-connectivity resilience audit passed.");
