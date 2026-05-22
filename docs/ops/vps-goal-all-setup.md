# VPS Goal-All Setup (Debian 13)

## 1) Bootstrap clean VPS

```bash
cd /opt
sudo apt-get update
sudo apt-get install -y git
git clone <YOUR_REPO_URL> metascope
cd metascope
REPO_URL=<YOUR_REPO_URL> REPO_BRANCH=prepare-vps-coding REPO_ROOT=/opt/metascope bash scripts/vps/bootstrap-clean-vps.sh
```

## 2) Cấu hình env

Sửa file:

```bash
sudo nano /etc/metascope/reporter.env
```

Điền:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Kiểm tra:

```bash
cat /etc/metascope/goal-all.env
sudo cat /etc/metascope/reporter.env
```

## 3) Cài systemd services

```bash
sudo /opt/metascope/scripts/vps/install-systemd.sh
```

## 4) Theo dõi runtime

```bash
systemctl status metascope-goal-all.service
systemctl status metascope-watchdog.timer
journalctl -u metascope-goal-all.service -f
```

Log file:

- `/opt/metascope/logs/goals/latest.log`
- `/opt/metascope/logs/goals/goal-all-*.log`

## 5) Gửi test Telegram

```bash
python3 /opt/metascope/scripts/vps/telegram_reporter.py start "manual test"
```

## 6) Điều khiển service

```bash
sudo systemctl restart metascope-goal-all.service
sudo systemctl stop metascope-goal-all.service
sudo systemctl start metascope-goal-all.service
sudo systemctl restart metascope-watchdog.service
```

## Troubleshooting

### Docker permission denied

Chạy lại session shell hoặc:

```bash
newgrp docker
```

### Missing env file

Đảm bảo tồn tại:

- `/etc/metascope/goal-all.env`
- `/etc/metascope/reporter.env`

### Service restart liên tục

Kiểm tra log:

```bash
journalctl -u metascope-goal-all.service -n 200 --no-pager
```

### Telegram không gửi được

- Kiểm tra token/chat id
- Kiểm tra outbound internet tới `api.telegram.org`
