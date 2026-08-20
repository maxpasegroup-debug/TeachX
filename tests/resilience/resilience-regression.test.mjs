import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("service worker excludes APIs and private navigation from runtime caches", () => {
  const worker = read("public/sw.js");
  assert.match(worker, /url\.pathname\.startsWith\("\/api\/"\)/);
  assert.match(worker, /PUBLIC_PAGES/);
  assert.doesNotMatch(worker, /APP_SHELL = \["\/"/);
});

test("service worker cache is versioned, bounded, and user-updatable", () => {
  const worker = read("public/sw.js");
  assert.match(worker, /teachx-offline-v4/);
  assert.match(worker, /MAX_RUNTIME_ENTRIES = 80/);
  assert.match(worker, /SKIP_WAITING/);
});

test("resumable upload verifies provider part size, etag, and checksum", () => {
  const service = read("services/private-storage-service.ts");
  for (const token of ["remote.Size", "remote.ETag", "remote.ChecksumSHA256", "UPLOAD_PARTS_INCOMPLETE"]) assert.match(service, new RegExp(token.replace(".", "\\.")));
});

test("upload UI saves metadata locally and retries boundedly", () => {
  const client = read("features/content/components/private-upload-form.tsx");
  assert.match(client, /DRAFT_KEY/);
  assert.match(client, /attempt <= 4/);
  assert.match(client, /completedParts/);
  assert.match(client, /waitUntilOnline/);
});

test("PWA manifest has standard and maskable PNG icons", () => {
  const manifest = read("app/manifest.ts");
  assert.match(manifest, /192x192/);
  assert.match(manifest, /512x512/);
  assert.match(manifest, /purpose: "maskable"/);
});
