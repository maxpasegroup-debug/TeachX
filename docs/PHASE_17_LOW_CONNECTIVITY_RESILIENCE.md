# Phase 17: Low-Connectivity Resilience

## Launch outcome

TeachX now protects a rural teacher's work across weak, intermittent, or expensive connections. Large private files use resumable S3-compatible multipart uploads. Form metadata remains on the teacher's device until the verified content record is created. The PWA caches only a bounded public/static shell and never caches private pages or API data.

## Resumable upload contract

- Files below `STORAGE_MULTIPART_THRESHOLD_MB` keep the Phase 16 single PUT path.
- Larger files are split into `STORAGE_MULTIPART_PART_MB` parts, with the S3 minimum of 5 MiB enforced by configuration.
- Large-file hashing is memory-bounded: each part is read and SHA-256 hashed independently. A deterministic manifest checksum binds file size, part size, order, and all part checksums.
- The provider validates every part checksum. Before completion, TeachX compares provider part number, size, ETag, and SHA-256 against the durable `StorageUploadPart` ledger.
- Completed parts are rediscovered after reload when the teacher selects the same file. Only absent parts are uploaded again.
- Each transfer retries at most four total attempts with exponential delay. Offline transfers wait for the browser's online event.
- Teachers can pause without deleting completed parts. Explicit cancellation and scheduled cleanup abort the multipart provider session so unfinished parts stop incurring storage cost.
- Resumable reservations expire after `STORAGE_RESUMABLE_TTL_HOURS`; the hourly Phase 16 cleanup removes them.

Cloudflare recommends multipart upload for large files and unreliable connections because failed parts can be retried independently. AWS requires consecutive part numbers when checksums are used. TeachX signs and completes parts consecutively.

## Offline and PWA contract

- Content Studio saves text/select upload metadata in local storage on input. File bytes are never written to local storage.
- Browser security prevents silently restoring a local file after restart; the teacher reselects the same file and TeachX validates its size, timestamp, manifest, and server session before resuming.
- The service worker excludes every `/api/` request, root session variant, and private navigation from caches.
- Only explicit public pages and same-origin static assets can enter the bounded 80-entry runtime cache.
- Private navigation while offline receives `/offline`, never another user's cached dashboard.
- A waiting service worker displays an update action. It activates and reloads only after the user chooses Update.
- Standard 192px, 512px, Apple touch, and maskable PNG icons are included.

## Railway variables

Set the Phase 17 variables from `.env.example`:

- `STORAGE_MULTIPART_THRESHOLD_MB=10`
- `STORAGE_MULTIPART_PART_MB=8`
- `STORAGE_RESUMABLE_TTL_HOURS=48`
- `RESILIENCE_REAL_DEVICE_READY=true`
- `RESILIENCE_OFFLINE_DRAFT_READY=true`
- `RESILIENCE_RESUMABLE_UPLOAD_READY=true`
- Three current `RESILIENCE_*_TESTED_AT` ISO-8601 UTC timestamps

Bucket CORS must permit `PUT`, the `x-amz-checksum-sha256` header, and expose `ETag`. Keep the Phase 16 hourly `npm run storage:cleanup` Railway cron.

## Production drill

1. Apply migrations and deploy over HTTPS.
2. On a low-memory Android device, install TeachX from Chrome and launch it in standalone mode.
3. Open Content Studio, enter upload metadata, switch to airplane mode, reload/open the offline shell, reconnect, and confirm metadata is restored.
4. Select a file larger than the multipart threshold. During a middle part, disable connectivity, then reconnect. Confirm progress continues without re-uploading recorded parts.
5. Reload once during a second multipart upload, reselect the same file, and complete it.
6. Start a third multipart upload and cancel it or let the cleanup job abort it. Confirm `MULTIPART_ABORTED` evidence exists.
7. Download the completed file and compare it with the source.
8. Verify private pages and API responses do not appear from the browser cache while signed out/offline on the same device.
9. Test Chrome Slow 3G at 4x CPU slowdown for layout stability and usable progress feedback.
10. Set the three tested-at timestamps and run `SMOKE_BASE_URL=https://your-domain npm run resilience:verify`.
11. Run `npm run launch:gate:production`.

The live verifier intentionally requires recent multipart completion, multiple recorded parts, and interruption cleanup evidence. Provider availability alone does not certify the rural-teacher workflow.

## References

- Cloudflare R2 upload methods: https://developers.cloudflare.com/r2/objects/upload-objects/
- Cloudflare R2 S3 compatibility: https://developers.cloudflare.com/r2/api/s3/api/
- AWS multipart overview: https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html
- AWS checksum integrity: https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity-upload.html
