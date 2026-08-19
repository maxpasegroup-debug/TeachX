#!/bin/sh
set -eu

required="DATABASE_URL BACKUP_S3_ENDPOINT BACKUP_S3_REGION BACKUP_S3_BUCKET BACKUP_S3_ACCESS_KEY_ID BACKUP_S3_SECRET_ACCESS_KEY BACKUP_S3_PREFIX RESTORE_DATABASE_URL RESTORE_DRILL_CONFIRM"
for name in $required; do
  eval "value=\${$name:-}"
  if [ -z "$value" ]; then
    echo "Missing required variable: $name" >&2
    exit 1
  fi
done

if [ "$RESTORE_DRILL_CONFIRM" != "isolated-database" ]; then
  echo "RESTORE_DRILL_CONFIRM must equal isolated-database." >&2
  exit 1
fi
production_identity="$(psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -Atqc "SELECT current_database() || '|' || inet_server_addr() || '|' || inet_server_port();")"
restore_identity="$(psql "$RESTORE_DATABASE_URL" -v ON_ERROR_STOP=1 -Atqc "SELECT current_database() || '|' || inet_server_addr() || '|' || inet_server_port();")"
if [ "$production_identity" = "$restore_identity" ]; then
  echo "Restore drill refuses to target DATABASE_URL." >&2
  exit 1
fi

export AWS_ACCESS_KEY_ID="$BACKUP_S3_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$BACKUP_S3_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="$BACKUP_S3_REGION"

prefix="$(printf '%s' "$BACKUP_S3_PREFIX" | sed 's#^/*##;s#/*$##')"
key="$(aws s3api list-objects-v2 --bucket "$BACKUP_S3_BUCKET" --prefix "$prefix/database/" --endpoint-url "$BACKUP_S3_ENDPOINT" --output json \
  | jq -r '[.Contents[]? | select(.Key | endswith(".dump"))] | sort_by(.LastModified) | last | .Key // empty')"
if [ -z "$key" ]; then
  echo "No database dump is available for a restore drill." >&2
  exit 1
fi

workdir="$(mktemp -d)"
dump="$workdir/teachx.dump"
checksum="$workdir/teachx.dump.sha256"
evidence="$workdir/latest.json"
trap 'rm -rf "$workdir"' EXIT HUP INT TERM

started_epoch="$(date -u +%s)"
aws s3 cp "s3://$BACKUP_S3_BUCKET/$key" "$dump" --endpoint-url "$BACKUP_S3_ENDPOINT" --only-show-errors
aws s3 cp "s3://$BACKUP_S3_BUCKET/$key.sha256" "$checksum" --endpoint-url "$BACKUP_S3_ENDPOINT" --only-show-errors
expected="$(tr -d '[:space:]' < "$checksum")"
actual="$(sha256sum "$dump" | awk '{print $1}')"
if [ "$expected" != "$actual" ]; then
  echo "Backup checksum verification failed." >&2
  exit 1
fi

pg_restore --dbname="$RESTORE_DATABASE_URL" --clean --if-exists --no-owner --no-acl --exit-on-error "$dump"
table_count="$(psql "$RESTORE_DATABASE_URL" -v ON_ERROR_STOP=1 -Atqc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('User','Institution','AuditLog','Setting');")"
migration_count="$(psql "$RESTORE_DATABASE_URL" -v ON_ERROR_STOP=1 -Atqc 'SELECT count(*) FROM "_prisma_migrations";')"
if [ "$table_count" -lt 4 ] || [ "$migration_count" -lt 1 ]; then
  echo "Restored schema verification failed." >&2
  exit 1
fi

completed_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
completed_epoch="$(date -u +%s)"
duration="$((completed_epoch - started_epoch))"
if [ "$duration" -lt 1 ]; then duration=1; fi
backup_created_at="$(aws s3api head-object --bucket "$BACKUP_S3_BUCKET" --key "$key" --endpoint-url "$BACKUP_S3_ENDPOINT" --output json | jq -r '.LastModified')"

jq -n \
  --arg completedAt "$completed_at" \
  --arg backupKey "$key" \
  --arg backupCreatedAt "$backup_created_at" \
  --argjson durationSeconds "$duration" \
  --argjson criticalTablesVerified "$table_count" \
  --argjson migrationCount "$migration_count" \
  '{schemaVersion:1,result:"passed",completedAt:$completedAt,durationSeconds:$durationSeconds,backupKey:$backupKey,backupCreatedAt:$backupCreatedAt,checksumVerified:true,schemaVerified:true,criticalTablesVerified:$criticalTablesVerified,migrationCount:$migrationCount}' > "$evidence"

aws s3 cp "$evidence" "s3://$BACKUP_S3_BUCKET/$prefix/recovery/latest.json" --endpoint-url "$BACKUP_S3_ENDPOINT" --content-type application/json --only-show-errors
echo "Restore drill passed in $duration seconds using $key"
