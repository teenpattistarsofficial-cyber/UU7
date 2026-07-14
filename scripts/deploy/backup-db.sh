#!/usr/bin/env bash
set -euo pipefail

# Nightly pg_dump + uploads tarball + off-box sync, run via cron/systemd
# timer on the VPS (see uu7-backup.service + uu7-backup.timer in this
# directory). Backups stay ONLY on the same VPS's disk until rclone copies
# them elsewhere — that's not a real backup against disk failure or account
# compromise, so this script requires rclone already configured with a
# remote named `offbox` (`rclone config`) pointing at wherever backups
# should actually land (S3, Backblaze B2, etc.). This script doesn't set
# that part up.
#
# The uploads tarball is read straight out of the running `app` container
# (`docker compose exec`) rather than touching the named volume directly —
# no container restart, no interruption to the site, just a read of files
# that are never modified in place after being written (see
# lib/media/process-upload.ts: every filename is a fresh randomUUID().webp).

cd "$(dirname "$0")/../.."

BACKUP_DIR="${BACKUP_DIR:-/var/backups/uu7}"
RCLONE_REMOTE="${RCLONE_REMOTE:-offbox:uu7-backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DB_FILE="$BACKUP_DIR/uu7-$STAMP.sql.gz"
UPLOADS_FILE="$BACKUP_DIR/uu7-uploads-$STAMP.tar.gz"

mkdir -p "$BACKUP_DIR"

docker compose exec -T postgres pg_dump -U "${POSTGRES_USER:-uu7}" "${POSTGRES_DB:-uu7}" | gzip > "$DB_FILE"

if [ ! -s "$DB_FILE" ]; then
  echo "Backup file is empty — aborting before syncing a broken dump." >&2
  rm -f "$DB_FILE"
  exit 1
fi

docker compose exec -T app tar -czf - -C /app/uploads . > "$UPLOADS_FILE"

if [ ! -s "$UPLOADS_FILE" ]; then
  echo "Uploads tarball is empty — aborting before syncing a broken archive." >&2
  rm -f "$UPLOADS_FILE"
  exit 1
fi

rclone copy "$DB_FILE" "$RCLONE_REMOTE" --checksum
rclone copy "$UPLOADS_FILE" "$RCLONE_REMOTE/uploads" --checksum

# Local retention only — the off-box copy's retention is whatever the
# rclone remote/bucket lifecycle policy is configured to keep.
find "$BACKUP_DIR" -name "uu7-*.sql.gz" -mtime "+$RETENTION_DAYS" -delete
find "$BACKUP_DIR" -name "uu7-uploads-*.tar.gz" -mtime "+$RETENTION_DAYS" -delete

echo "Backed up to $DB_FILE and $UPLOADS_FILE, synced to $RCLONE_REMOTE"
