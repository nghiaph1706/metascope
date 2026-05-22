#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${REPO_URL:-}"
REPO_BRANCH="${REPO_BRANCH:-prepare-vps-coding}"
REPO_ROOT="${REPO_ROOT:-/opt/metascope}"
TARGET_USER="${SUDO_USER:-$USER}"

if [[ -z "$REPO_URL" ]]; then
  echo "REPO_URL is required. Example: REPO_URL=https://github.com/<org>/<repo>.git" >&2
  exit 1
fi

echo "[1/8] Installing base packages"
sudo apt-get update
sudo apt-get install -y ca-certificates curl git jq tmux python3 python3-venv python3-pip gnupg lsb-release

echo "[2/8] Installing Node.js 22"
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo corepack enable
sudo corepack prepare pnpm@latest --activate

echo "[3/8] Installing Docker"
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker "$TARGET_USER"

echo "[4/8] Preparing repository"
sudo mkdir -p "$REPO_ROOT"
sudo chown -R "$TARGET_USER":"$TARGET_USER" "$REPO_ROOT"
if [[ ! -d "$REPO_ROOT/.git" ]]; then
  git clone --branch "$REPO_BRANCH" "$REPO_URL" "$REPO_ROOT"
else
  git -C "$REPO_ROOT" fetch origin "$REPO_BRANCH"
  git -C "$REPO_ROOT" checkout "$REPO_BRANCH"
  git -C "$REPO_ROOT" pull --ff-only origin "$REPO_BRANCH"
fi

echo "[5/8] Installing workspace dependencies"
pnpm install --dir "$REPO_ROOT" --frozen-lockfile

echo "[6/8] Preparing runtime directories"
mkdir -p "$REPO_ROOT/logs/goals" "$REPO_ROOT/logs/watchdog" "$REPO_ROOT/tmp/goal-locks"

echo "[7/8] Creating env templates"
sudo mkdir -p /etc/metascope
if [[ ! -f /etc/metascope/goal-all.env ]]; then
  sudo tee /etc/metascope/goal-all.env >/dev/null <<EOF
METASCOPE_ROOT=$REPO_ROOT
STALL_MINUTES=15
EOF
fi
if [[ ! -f /etc/metascope/reporter.env ]]; then
  sudo tee /etc/metascope/reporter.env >/dev/null <<'EOF'
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
METASCOPE_ROOT=/opt/metascope
EOF
  sudo sed -i "s|^METASCOPE_ROOT=.*$|METASCOPE_ROOT=$REPO_ROOT|" /etc/metascope/reporter.env
fi
sudo chmod 600 /etc/metascope/goal-all.env /etc/metascope/reporter.env

echo "[8/8] Done"
echo "Bootstrap complete. Next steps:"
echo "1) Fill /etc/metascope/reporter.env"
echo "2) Run: sudo $REPO_ROOT/scripts/vps/install-systemd.sh"
echo "3) Re-login (or run: newgrp docker) before using docker without sudo"
