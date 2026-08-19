import { createHash, randomUUID } from "node:crypto";
import { DeleteObjectCommand, GetObjectCommand, HeadBucketCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PrismaClient } from "@prisma/client";

const required = ["DATABASE_URL", "STORAGE_PROVIDER", "STORAGE_S3_REGION", "STORAGE_S3_BUCKET", "STORAGE_S3_ACCESS_KEY_ID", "STORAGE_S3_SECRET_ACCESS_KEY", "STORAGE_PRIVATE_BUCKET_READY", "STORAGE_CORS_READY", "STORAGE_RETENTION_READY", "STORAGE_CLEANUP_READY", "STORAGE_UPLOAD_TESTED_AT", "STORAGE_DOWNLOAD_TESTED_AT", "STORAGE_CLEANUP_TESTED_AT"];
const fail = (message) => { console.error(`Storage verification failed: ${message}`); process.exit(1); };
const missing = required.filter((key) => !process.env[key]);
if (missing.length) fail(`missing ${missing.join(", ")}.`);
if (process.env.STORAGE_PROVIDER !== "s3" || !["STORAGE_PRIVATE_BUCKET_READY", "STORAGE_CORS_READY", "STORAGE_RETENTION_READY", "STORAGE_CLEANUP_READY"].every((key) => process.env[key] === "true")) fail("private storage controls are not approved.");
const ageDays = (value) => (Date.now() - new Date(value).getTime()) / 86_400_000;
for (const key of ["STORAGE_UPLOAD_TESTED_AT", "STORAGE_DOWNLOAD_TESTED_AT", "STORAGE_CLEANUP_TESTED_AT"]) if (!Number.isFinite(ageDays(process.env[key])) || ageDays(process.env[key]) < 0 || ageDays(process.env[key]) > 30) fail(`${key} evidence is invalid or older than 30 days.`);

const client = new S3Client({ endpoint: process.env.STORAGE_S3_ENDPOINT || undefined, region: process.env.STORAGE_S3_REGION, forcePathStyle: process.env.STORAGE_S3_FORCE_PATH_STYLE === "true", credentials: { accessKeyId: process.env.STORAGE_S3_ACCESS_KEY_ID, secretAccessKey: process.env.STORAGE_S3_SECRET_ACCESS_KEY } });
const bucket = process.env.STORAGE_S3_BUCKET;
const body = Buffer.from(`teachx-storage-canary:${randomUUID()}`);
const checksum = createHash("sha256").update(body).digest("base64");
const key = `${(process.env.STORAGE_S3_PREFIX || "teachx").replace(/^\/+|\/+$/g, "")}/verification/${randomUUID()}.txt`;

try {
  await client.send(new HeadBucketCommand({ Bucket: bucket }));
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: "text/plain", ChecksumSHA256: checksum, Metadata: { teachx_verification: "true" } }));
  const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key, ChecksumMode: "ENABLED" }));
  if (Number(head.ContentLength) !== body.length || head.ChecksumSHA256 !== checksum || head.Metadata?.teachx_verification !== "true") throw new Error("provider integrity verification failed.");
  const signedUrl = await getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 60 });
  const signedResponse = await fetch(signedUrl);
  if (!signedResponse.ok || !Buffer.from(await signedResponse.arrayBuffer()).equals(body)) throw new Error("signed download verification failed.");
  const unsigned = new URL(signedUrl); unsigned.search = "";
  const anonymousResponse = await fetch(unsigned, { redirect: "manual" });
  if (anonymousResponse.ok) throw new Error("the bucket object is publicly readable without a signature.");

  const prisma = new PrismaClient();
  try {
    const since = new Date(Date.now() - 30 * 86_400_000);
    const completed = await prisma.storageTransferEvent.count({ where: { kind: "UPLOAD_COMPLETED", createdAt: { gte: since }, object: { status: "ACTIVE", contentItemId: { not: null } } } });
    const downloaded = await prisma.storageTransferEvent.count({ where: { kind: "DOWNLOAD_SIGNED", createdAt: { gte: since } } });
    if (!completed || !downloaded) throw new Error("recent end-to-end application upload and download evidence is missing.");
  } finally {
    await prisma.$disconnect();
  }
  console.log("TeachX live storage verification passed for private access, checksum integrity, signed delivery, and application evidence.");
} catch (error) {
  console.error(`Storage verification failed: ${error instanceof Error ? error.message : "provider verification failed."}`);
  process.exitCode = 1;
} finally {
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })).catch(() => undefined);
}
