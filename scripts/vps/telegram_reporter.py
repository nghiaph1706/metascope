#!/usr/bin/env python3
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

REPORTER_ENV = "/etc/metascope/reporter.env"
COOLDOWN_SECONDS = 180
COOLDOWN_DIR = Path("/tmp/metascope-reporter")


def load_env(path: str) -> None:
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            raw = line.strip()
            if not raw or raw.startswith("#") or "=" not in raw:
                continue
            key, value = raw.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())


def should_send(event: str) -> bool:
    COOLDOWN_DIR.mkdir(parents=True, exist_ok=True)
    marker = COOLDOWN_DIR / f"{event}.ts"
    now = int(time.time())
    if marker.exists():
        last = int(marker.read_text(encoding="utf-8").strip() or "0")
        if now - last < COOLDOWN_SECONDS:
            return False
    marker.write_text(str(now), encoding="utf-8")
    return True


def send_message(text: str) -> None:
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID", "")
    if not token or not chat_id:
        raise RuntimeError("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID")

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "disable_web_page_preview": True,
    }
    data = urllib.parse.urlencode(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    with urllib.request.urlopen(req, timeout=15) as resp:
        body = resp.read().decode("utf-8")
    parsed = json.loads(body)
    if not parsed.get("ok"):
        raise RuntimeError(f"Telegram API error: {body}")


def main() -> int:
    load_env(REPORTER_ENV)
    event = sys.argv[1] if len(sys.argv) > 1 else "info"
    message = sys.argv[2] if len(sys.argv) > 2 else ""

    if event in {"stall", "restart", "failure"} and not should_send(event):
        return 0

    host = os.uname().nodename
    text = f"[MetaScope][{host}] {event.upper()}\n{message}".strip()
    send_message(text)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"reporter error: {exc}", file=sys.stderr)
        raise SystemExit(1)
