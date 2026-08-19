import process from "node:process";
import { PrismaClient } from "@prisma/client";

const required = ["DATABASE_URL", "SMOKE_BASE_URL", "RESILIENCE_REAL_DEVICE_READY", "RESILIENCE_OFFLINE_DRAFT_READY", "RESILIENCE_RESUMABLE_UPLOAD_READY", "RESILIENCE_LOW_BANDWIDTH_TESTED_AT", "RESILIENCE_PWA_INSTALL_TESTED_AT", "RESILIENCE_RESUMABLE_UPLOAD_TESTED_AT"];
const missing = required.filter((key) => !process.env[key]);
const fail = (message) => { console.error(`Resilience verification failed: ${message}`); process.exit(1); };
if (missing.length) fail(`missing ${missing.join(", ")}.`);
if (!["RESILIENCE_REAL_DEVICE_READY", "RESILIENCE_OFFLINE_DRAFT_READY", "RESILIENCE_RESUMABLE_UPLOAD_READY"].every((key) => process.env[key] === "true")) fail("real-device, offline-draft, and resumable-upload controls are not approved.");
const ageDays = (value) => (Date.now() - new Date(value).getTime()) / 86_400_000;
for (const key of ["RESILIENCE_LOW_BANDWIDTH_TESTED_AT", "RESILIENCE_PWA_INSTALL_TESTED_AT", "RESILIENCE_RESUMABLE_UPLOAD_TESTED_AT"]) if (!Number.isFinite(ageDays(process.env[key])) || ageDays(process.env[key]) < 0 || ageDays(process.env[key]) > 30) fail(`${key} evidence is invalid or older than 30 days.`);

let base;
try { base = new URL(process.env.SMOKE_BASE_URL); } catch { fail("SMOKE_BASE_URL is invalid."); }
if (base.protocol !== "https:") fail("production resilience verification requires HTTPS.");
for (const [path, type] of [["/sw.js", "javascript"], ["/manifest.webmanifest", "json"], ["/offline", "html"], ["/icons/icon-192.png", "image/png"], ["/icons/icon-512.png", "image/png"], ["/icons/icon-maskable-512.png", "image/png"]]) {
  const response = await fetch(new URL(path, base));
  if (!response.ok || !response.headers.get("content-type")?.includes(type)) fail(`${path} is unavailable or has the wrong content type.`);
}
const worker = await (await fetch(new URL("/sw.js", base))).text();
if (!worker.includes('url.pathname.startsWith("/api/")') || !worker.includes("MAX_RUNTIME_ENTRIES") || !worker.includes("SKIP_WAITING")) fail("the deployed service worker is missing private-cache exclusion, bounds, or update control.");
const manifest = await (await fetch(new URL("/manifest.webmanifest", base))).json();
if (!manifest.icons?.some((icon) => icon.sizes === "192x192") || !manifest.icons?.some((icon) => icon.sizes === "512x512") || !manifest.icons?.some((icon) => icon.purpose === "maskable")) fail("the deployed PWA manifest is incomplete.");

const prisma = new PrismaClient();
try {
  const since = new Date(Date.now() - 30 * 86_400_000);
  const [completed, parts, interrupted] = await Promise.all([
    prisma.storageTransferEvent.count({ where: { kind: "MULTIPART_COMPLETED", createdAt: { gte: since }, object: { status: "ACTIVE", contentItemId: { not: null } } } }),
    prisma.storageTransferEvent.count({ where: { kind: "PART_RECORDED", createdAt: { gte: since } } }),
    prisma.storageTransferEvent.count({ where: { kind: "MULTIPART_ABORTED", createdAt: { gte: since } } })
  ]);
  if (!completed || parts < 2 || !interrupted) fail("recent multipart completion, part retry, or interruption cleanup evidence is missing.");
} finally {
  await prisma.$disconnect();
}
console.log("TeachX live low-connectivity verification passed for PWA installability, bounded private caching, resumable transfer, and interruption cleanup evidence.");
