#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${METASCOPE_ROOT:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
LOCK_DIR="$REPO_ROOT/tmp/goal-locks"
LOG_DIR="$REPO_ROOT/logs/goals"
LOCK_FILE="$LOCK_DIR/goal-all.lock"

mkdir -p "$LOCK_DIR" "$LOG_DIR"

if [[ -f "$LOCK_FILE" ]]; then
  echo "goal-all is already running (lock: $LOCK_FILE)" >&2
  exit 1
fi
trap 'rm -f "$LOCK_FILE"' EXIT
printf '%s\n' "$$" > "$LOCK_FILE"

source /etc/metascope/goal-all.env

"$SCRIPT_DIR/preflight.sh"

TS="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$LOG_DIR/goal-all-$TS.log"
ln -sfn "$LOG_FILE" "$LOG_DIR/latest.log"

python3 "$SCRIPT_DIR/telegram_reporter.py" start "goal-all started. log=$LOG_FILE" || true

cd "$REPO_ROOT"

set +e
{
  echo "== goal-all start: $(date -Is) =="
  claude -p "/goal-all"
  RC=$?
  echo "== goal-all end: $(date -Is), rc=$RC =="
  exit "$RC"
} >>"$LOG_FILE" 2>&1
RC=$?
set -e

if [[ $RC -eq 0 ]]; then
  python3 "$SCRIPT_DIR/telegram_reporter.py" success "goal-all completed. log=$LOG_FILE" || true
else
  TAIL="$(tail -n 40 "$LOG_FILE" | tr -d '\000')"
  python3 "$SCRIPT_DIR/telegram_reporter.py" failure "goal-all failed (rc=$RC). log=$LOG_FILE\n$TAIL" || true
fi

exit "$RC"
