# Phase 16: Private Object Storage

## Launch outcome

TeachX stores teacher uploads in a private S3-compatible bucket. The application database keeps the durable object lifecycle and transfer evidence; bucket credentials never reach the browser. A browser receives one short-lived signed PUT for one server-generated key, and downloads use short-lived signed GET redirects after application authorization.

## Security and integrity controls

- Uploads are limited to the MIME allowlist and `STORAGE_MAX_FILE_MB`.
- The browser computes SHA-256. TeachX signs that checksum and verifies size, MIME type, checksum, and object ownership metadata with `HeadObject` before activating content.
- Quota reservations count active objects and unexpired pending uploads in a serializable transaction.
- Keys are server-generated beneath institution and owner prefixes. User input cannot choose an object key.
- A failed integrity check is quarantined and removed. Expired reservations are excluded from quota and removed by the scheduled cleanup.
- A file is downloadable only by its owner, a same-institution content manager, an allowed enrolled learner, or an active marketplace entitlement holder.
- Download URLs expire after `STORAGE_DOWNLOAD_TTL_SECONDS` and are treated as bearer credentials.
- The legacy content endpoint accepts HTTPS external links only; it cannot register a caller-supplied file URL.

## Railway configuration

Set every `STORAGE_*` variable in `.env.example`. For Cloudflare R2 use its S3 API endpoint, region `auto`, and an object read/write token scoped only to the TeachX bucket. For AWS S3, the endpoint can be empty and the region must match the bucket.

Keep the bucket private. Configure browser CORS for the exact production origin, not `*`:

```json
[
  {
    "AllowedOrigins": ["https://teachx.guru"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type", "x-amz-checksum-sha256"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Use a Railway cron service with the same database and storage variables:

```text
Schedule: 0 * * * *
Command: npm run storage:cleanup
```

Provider lifecycle rules should also abort incomplete multipart uploads and retain/delete objects according to the published retention policy. Phase 17 uses resumable multipart uploads above `STORAGE_MULTIPART_THRESHOLD_MB`; smaller files continue to use a single PUT.

## Production drill

1. Apply the Prisma migration and deploy the application.
2. Sign in as a teacher and upload an allowlisted file from Content Studio.
3. Confirm the progress completes and the file appears with a Download file action.
4. Download it as its teacher owner and as one authorized student or purchaser.
5. Confirm an unrelated signed-in user receives `403` from the object download route.
6. Run `npm run storage:cleanup` and verify it exits successfully.
7. Set `STORAGE_UPLOAD_TESTED_AT`, `STORAGE_DOWNLOAD_TESTED_AT`, and `STORAGE_CLEANUP_TESTED_AT` to current ISO-8601 UTC timestamps.
8. Run `npm run storage:verify`. It checks credentials, checksum round-trip, signed retrieval, anonymous denial, fresh evidence, and removes its canary.
9. Run `npm run launch:gate:production` with the production smoke URL.

The live verifier intentionally fails until real application upload and download evidence exists. This prevents a provider-only canary from being mistaken for a working teacher workflow.

## Provider references

- AWS S3 object integrity: https://docs.aws.amazon.com/AmazonS3/latest/userguide/checking-object-integrity-upload.html
- Cloudflare R2 presigned URLs: https://developers.cloudflare.com/r2/api/s3/presigned-urls/
- Cloudflare R2 CORS: https://developers.cloudflare.com/r2/buckets/cors/
