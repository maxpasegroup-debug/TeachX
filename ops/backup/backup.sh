#!/bin/sh
set -eu

required="DATABASE_URL BACKUP_S3_ENDPOINT BACKUP_S3_REGION BACKUP_S3_BUCKET BACKUP_S3_ACCESS_KEY_ID BACKUP_S3_SECRET_ACCESS_KEY BACKUP_S3_PREFIX BACKUP_RETENTION_DAYS"
for name in $required; do
  eval "value=\${$name:-}"
  if [ -z "$value" ]; then
    echo "Missing required variable: $name" >&2
    exit 1
  fi
done

export AWS_ACCESS_KEY_ID="$BACKUP_S3_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$BACKUP_S3_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="$BACKUP_S3_REGION"

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
prefix="$(printf '%s' "$BACKUP_S3_PREFIX" | sed 's#^/*##;s#/*$##')"
key="$prefix/database/teachx-$stamp.dump"
workdir="$(mktemp -d)"
dump="$workdir/teachx.dump"
checksum="$workdir/teachx.dump.sha256"
trap 'rm -rf "$workdir"' EXIT HUP INT TERM

echo "Creating portable PostgreSQL backup $stamp"
pg_dump "$DATABASE_URL" --format=custom --compress=9 --no-owner --no-acl --file="$dump"
sha256sum "$dump" | awk '{print $1}' > "$checksum"

aws s3 cp "$dump" "s3://$BACKUP_S3_BUCKET/$key" --endpoint-url "$BACKUP_S3_ENDPOINT" --only-show-errors
aws s3 cp "$checksum" "s3://$BACKUP_S3_BUCKET/$key.sha256" --endpoint-url "$BACKUP_S3_ENDPOINT" --content-type text/plain --only-show-errors

cutoff="$(date -u -d "-$BACKUP_RETENTION_DAYS days" +%s)"
aws s3api list-objects-v2 --bucket "$BACKUP_S3_BUCKET" --prefix "$prefix/database/" --endpoint-url "$BACKUP_S3_ENDPOINT" --output json \
  | jq -r '.Contents[]? | [.Key, .LastModified] | @tsv' \
  | while IFS="$(printf '\t')" read -r object_key modified; do
      modified_epoch="$(date -u -d "$modified" +%s)"
      if [ "$modified_epoch" -lt "$cutoff" ]; then
        aws s3 rm "s3://$BACKUP_S3_BUCKET/$object_key" --endpoint-url "$BACKUP_S3_ENDPOINT" --only-show-errors
      fi
    done

echo "Backup uploaded and retention enforced: $key"

