#!/usr/bin/env bash
set -euo pipefail

REQUIRED_BINS=(git curl docker node pnpm python3)

for bin in "${REQUIRED_BINS[@]}"; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "Missing required binary: $bin" >&2
    exit 1
  fi
done

if [[ "$(systemctl is-system-running || true)" == "offline" ]]; then
  echo "systemd is not running" >&2
  exit 1
fi

REPO_ROOT="${METASCOPE_ROOT:-$(pwd)}"
if [[ ! -d "$REPO_ROOT/.git" ]]; then
  echo "Repository not found at: $REPO_ROOT" >&2
  exit 1
fi

if [[ ! -f "$REPO_ROOT/.claude/commands/goal-all.md" ]]; then
  echo "Missing goal command file: $REPO_ROOT/.claude/commands/goal-all.md" >&2
  exit 1
fi

if [[ ! -f "/etc/metascope/goal-all.env" ]]; then
  echo "Missing env file: /etc/metascope/goal-all.env" >&2
  exit 1
fi

if [[ ! -f "/etc/metascope/reporter.env" ]]; then
  echo "Missing env file: /etc/metascope/reporter.env" >&2
  exit 1
fi

echo "Preflight check passed"
