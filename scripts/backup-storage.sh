#!/bin/sh
set -eu

# Creates a private local SQL backup from the running Compose Postgres service.
# Compose reads POSTGRES_* values from the root .env file.
backup_dir=${BACKUP_DIR:-backups}
mkdir -p "$backup_dir"
# Backups may contain personal/order data; keep them private and out of Git.
umask 077
stamp=$(date -u +%Y%m%dT%H%M%SZ)
backup_file="$backup_dir/pmcosmetics-$stamp.sql"
user=${POSTGRES_USER:-pmcosmetics}
database=${POSTGRES_DB:-pmcosmetics}

if ! docker compose exec -T postgres pg_dump -U "$user" "$database" > "$backup_file"; then
  rm -f "$backup_file"
  echo "Backup failed; removed incomplete output." >&2
  exit 1
fi

printf 'Database backup created: %s\n' "$backup_file"
