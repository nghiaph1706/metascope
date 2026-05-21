#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required for integration tests" >&2
  exit 1
fi

pnpm --filter @metascope/api run test:integration