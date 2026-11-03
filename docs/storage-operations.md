# Local storage operations

The development Compose stack uses named volumes (`postgres_data` and `redis_data`) so database/cache files survive ordinary container recreation. PostgreSQL and Redis ports bind to `127.0.0.1` only; do not expose this development stack directly to the internet.

## Start safely

1. Copy `.env.example` to `.env`.
2. Replace `POSTGRES_PASSWORD` with a long random local password, and use the exact same value in `DATABASE_URL` (URL-encode special characters in the URL password).
3. Start services with `docker compose up -d postgres redis`.
4. Check status with `docker compose ps` and `docker compose logs postgres`.

Do not put real secrets in `.env.example`, source control, chat, or issue comments. For production, use the hosting provider's secret manager and managed database/cache services; this Compose configuration is for local development.

## Back up PostgreSQL

Run `sh scripts/backup-storage.sh`. It writes a timestamped SQL dump under `backups/` with owner-only permissions. The directory is ignored by Git. Store a copy in an encrypted, access-controlled location separate from the machine running Docker, and periodically test a restore against a disposable database.

To restore into the current local database, first make a backup of the current data, then run:

```sh
docker compose exec -T postgres psql -U "${POSTGRES_USER:-pmcosmetics}" -d "${POSTGRES_DB:-pmcosmetics}" < backups/your-backup-file.sql
```

A restore can overwrite or conflict with existing records; verify the target database before running it. The command above expects `POSTGRES_USER` and `POSTGRES_DB` to be exported in the shell or set to the shown defaults. Never restore production data into a public demo environment.

## Redis

Redis is a disposable local cache/session store and is not the system of record. The named volume preserves its state across ordinary restarts. If cache data is safe to rebuild, it can be cleared with `docker compose down -v`, but that command deletes **all** Compose volumes, including PostgreSQL data—do not use it as a routine cleanup. To reset only Redis, stop the stack, remove the specific Redis volume after verifying its name with `docker volume ls`, and recreate the service.
