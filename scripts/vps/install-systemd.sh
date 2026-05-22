#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${METASCOPE_ROOT:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
UNIT_SRC_DIR="$REPO_ROOT/infra/systemd"
UNIT_DST_DIR="/etc/systemd/system"

if [[ ! -d "$UNIT_SRC_DIR" ]]; then
  echo "Unit source directory not found: $UNIT_SRC_DIR" >&2
  exit 1
fi

sudo install -m 0644 "$UNIT_SRC_DIR/metascope-goal-all.service" "$UNIT_DST_DIR/metascope-goal-all.service"
sudo install -m 0644 "$UNIT_SRC_DIR/metascope-watchdog.service" "$UNIT_DST_DIR/metascope-watchdog.service"
sudo install -m 0644 "$UNIT_SRC_DIR/metascope-watchdog.timer" "$UNIT_DST_DIR/metascope-watchdog.timer"
sudo install -m 0644 "$UNIT_SRC_DIR/metascope-reporter@.service" "$UNIT_DST_DIR/metascope-reporter@.service"

sudo systemctl daemon-reload
sudo systemctl enable --now metascope-goal-all.service
sudo systemctl enable --now metascope-watchdog.timer

echo "Systemd services installed and started"
echo "Check status:"
echo "  systemctl status metascope-goal-all.service"
echo "  systemctl status metascope-watchdog.timer"
