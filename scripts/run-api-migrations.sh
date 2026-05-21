#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

MIGRATIONS_DIR="$(dirname "$0")/../apps/api/db/migrations"

if [[ ! -d "$MIGRATIONS_DIR" ]]; then
  echo "Migrations directory not found: $MIGRATIONS_DIR" >&2
  exit 1
fi

for file in "$MIGRATIONS_DIR"/*.sql; do
  if [[ ! -f "$file" ]]; then
    continue
  fi
  echo "Applying migration: $file"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
done

echo "API migrations applied successfully."