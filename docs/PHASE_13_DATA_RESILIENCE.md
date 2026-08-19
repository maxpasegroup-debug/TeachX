# Phase 13: Data Resilience and Disaster Recovery

Phase 13 makes recovery a verified launch condition. A configured backup is not considered ready until a portable dump is fresh, its checksum exists, and an isolated restore drill has produced valid evidence.

## Recovery standard

- Recovery point objective (RPO): 24 hours or less.
- Recovery time objective (RTO): 120 minutes or less.
- Portable database dump retention: at least 30 days.
- Media object version/retention protection: at least 30 days.
- Restore drill frequency: at least every 90 days and before first public launch.
- A successful drill must verify checksum integrity, Prisma migration history, and the `User`, `Institution`, `AuditLog`, and `Setting` tables.

## Railway protection layers

1. Enable Daily, Weekly, and Monthly schedules in the PostgreSQL service's **Backups** tab.
2. Enable Railway PostgreSQL point-in-time recovery before launch. Its recovery window begins only after the first base backup completes.
3. Deploy `ops/backup/Dockerfile` as a private Railway cron service with command `/opt/teachx/backup.sh` and schedule `0 3 * * *` (UTC).
4. Store portable dumps in a private S3-compatible bucket in a separate recovery project/account or provider. Do not expose a public bucket URL.
5. Enable versioning or equivalent undelete retention on the application's media storage and set the corresponding attestation variables only after verifying it in the provider console.

Railway volume snapshots restore within the same project/environment. PITR creates a sibling PostgreSQL service. Portable dumps provide the provider-independent recovery copy.

## Application variables

Set these on the TeachX web service:

```text
BACKUP_PROVIDER=railway-volume+pitr+s3
BACKUP_S3_ENDPOINT=<private S3-compatible endpoint>
BACKUP_S3_REGION=<bucket region or auto>
BACKUP_S3_BUCKET=<private recovery bucket>
BACKUP_S3_ACCESS_KEY_ID=<read-only application credential>
BACKUP_S3_SECRET_ACCESS_KEY=<read-only application credential>
BACKUP_S3_PREFIX=teachx-production
BACKUP_PITR_ENABLED=true
BACKUP_VOLUME_SCHEDULE=daily+weekly+monthly
BACKUP_RPO_HOURS=24
BACKUP_RTO_MINUTES=120
BACKUP_RETENTION_DAYS=30
BACKUP_DRILL_MAX_AGE_DAYS=90
BACKUP_MEDIA_VERSIONING_ENABLED=true
BACKUP_MEDIA_RETENTION_DAYS=30
```

Use a read-only bucket credential for the web service. The cron services require a separate credential with write/delete access and the same `BACKUP_S3_*`, retention, and prefix variables.

## Backup cron

The backup job:

- exits when any required variable is missing;
- creates a compressed custom-format `pg_dump` without owner or ACL coupling;
- calculates and uploads a SHA-256 sidecar;
- removes database dump objects older than `BACKUP_RETENTION_DAYS`;
- emits no database URL, bucket credential, or row data to logs.

Configure Railway to alert when the cron deployment exits non-zero. A failed or skipped job will also make recovery readiness fail when the newest dump crosses the RPO.

## Restore drill

Deploy a second private scheduled/one-off service from the same Dockerfile with command `/opt/teachx/restore-drill.sh`. Add:

```text
RESTORE_DATABASE_URL=<dedicated disposable PostgreSQL database>
RESTORE_DRILL_CONFIRM=isolated-database
```

Also provide production `DATABASE_URL` as a read-only/reference variable. The drill compares both servers' resolved address, port, and database name before any restore. Never reference production `DATABASE_URL` as `RESTORE_DATABASE_URL`. The drill uses `pg_restore --clean` and is intentionally destructive to the isolated drill database. Run it once before launch and at least quarterly. A successful run uploads `<prefix>/recovery/latest.json`; failures never publish passing evidence.

## Verification

```powershell
npm run recovery:audit
npm run recovery:test
npm run recovery:verify
npm run quality:gate
```

`recovery:verify` makes live private-bucket requests and is automatically included in `launch:gate:production`. After deployment, an administrator can open `/api/backup/readiness`; `ok` must be `true`. The endpoint never returns bucket names, object keys, endpoints, or credentials.

## Incident recovery

1. Stop writes or place the service in maintenance mode when continued writes increase damage.
2. Record the incident timestamp and select a recovery point before the damaging event.
3. Prefer PITR for precise row/data corruption, a volume snapshot for whole-volume rollback, or the portable dump when the project/provider is unavailable.
4. Restore into a sibling or isolated database. Never overwrite the only production copy during diagnosis.
5. Verify migrations, critical table counts, authentication, tenant isolation, recent teacher content, audit history, and media access.
6. Switch `DATABASE_URL` only after the incident owner and recovery owner approve the restored copy.
7. Run `npm run launch:gate:production`, complete a teacher workflow, and obtain two successful Phase 9 monitor runs before reopening traffic.
8. Preserve the old database read-only until reconciliation and incident review are complete.
