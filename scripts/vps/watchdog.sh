#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="${METASCOPE_ROOT:-$(cd "$(dirname "$0")/../.." && pwd)}"
LOG_DIR="$REPO_ROOT/logs/goals"
LATEST_LINK="$LOG_DIR/latest.log"
STALL_MINUTES="${STALL_MINUTES:-15}"
SERVICE_NAME="metascope-goal-all.service"

if ! systemctl is-active --quiet "$SERVICE_NAME"; then
  python3 "$REPO_ROOT/scripts/vps/telegram_reporter.py" restart "$SERVICE_NAME inactive; restarting" || true
  systemctl restart "$SERVICE_NAME"
  exit 0
fi

if [[ ! -L "$LATEST_LINK" ]]; then
  python3 "$REPO_ROOT/scripts/vps/telegram_reporter.py" stall "latest log link missing; restarting service" || true
  systemctl restart "$SERVICE_NAME"
  exit 0
fi

LATEST_FILE="$(readlink -f "$LATEST_LINK")"
if [[ ! -f "$LATEST_FILE" ]]; then
  python3 "$REPO_ROOT/scripts/vps/telegram_reporter.py" stall "latest log file missing; restarting service" || true
  systemctl restart "$SERVICE_NAME"
  exit 0
fi

NOW="$(date +%s)"
MTIME="$(stat -c %Y "$LATEST_FILE")"
DELTA_MIN=$(( (NOW - MTIME) / 60 ))

if (( DELTA_MIN > STALL_MINUTES )); then
  python3 "$REPO_ROOT/scripts/vps/telegram_reporter.py" stall "log stalled ${DELTA_MIN}m (> ${STALL_MINUTES}m). restarting" || true
  systemctl restart "$SERVICE_NAME"
fi
