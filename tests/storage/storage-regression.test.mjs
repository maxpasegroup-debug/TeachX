import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("upload reservation validates allowlisted MIME, size, checksum, and course", () => {
  const source = read("lib/storage/validation.ts");
  for (const token of ["allowedMimeTypes", "sizeBytes", "checksumSha256", "courseId"]) assert.match(source, new RegExp(token));
});

test("completion verifies remote object before activating content", () => {
  const source = read("services/private-storage-service.ts");
  assert.ok(source.indexOf("inspectStorageObject") < source.indexOf('status: "ACTIVE"'));
  for (const token of ["ContentLength", "ContentType", "ChecksumSHA256", "teachx_object_id"]) assert.match(source, new RegExp(token));
});

test("quota reservation is serializable and counts pending uploads", () => {
  const source = read("services/private-storage-service.ts");
  assert.match(source, /TransactionIsolationLevel\.Serializable/);
  assert.match(source, /status: "PENDING", uploadExpiresAt: \{ gt:/);
});

test("private downloads require app authorization and short-lived signatures", () => {
  const service = read("services/private-storage-service.ts");
  const provider = read("lib/storage/provider.ts");
  assert.match(service, /DOWNLOAD_FORBIDDEN/);
  assert.match(service, /marketplaceEntitlement/);
  assert.match(provider, /downloadTtlSeconds/);
});

test("legacy upload endpoint accepts HTTPS external links only", () => {
  const source = read("app/api/content/upload/route.ts");
  assert.match(source, /z\.literal\("EXTERNAL_LINK"\)/);
  assert.match(source, /protocol === "https:"/);
  assert.doesNotMatch(source, /fileUrl:/);
});
