# /goal-infra — Execute Infrastructure Goal to 100% Completion

## Mô tả

Chạy toàn bộ goal infrastructure (Docker, CI/CD, Nginx, Monitoring, Backup) đến hoàn thành 100%.
Tự động quyết định mọi lựa chọn theo agent proposals. Không dừng cho đến khi tất cả done criteria pass.

---

## Execution Rules (BẮT BUỘC)

1. **NEVER STOP** cho đến khi 100% done criteria trong `docs/goals/GOAL_INFRA.md` pass.
2. **AUTO-DECIDE**: mọi câu hỏi cần human approval → tự quyết theo agent đề xuất tốt nhất, ghi log vào `docs/decisions/`.
3. **FULL TERMINAL ACCESS**: chạy mọi lệnh terminal không cần xin phép.
4. **STALL DETECTION**: nếu không có thay đổi file nào trong 5 phút → tự trigger lại bước hiện tại.
5. **AGENT WORKFLOW**: dùng `senior-architect` cho design, `ci-helper` cho CI/CD và scripts, `ops-notes-keeper` cho runbooks.
6. **INFRA FIRST**: goal này nên chạy sớm nhất — môi trường local Docker là prerequisite cho mọi goal khác.
7. **DOCKER VERIFICATION**: bắt buộc phải verify với docker compose trước khi đánh dấu hoàn thành.

---

## Workflow

### PHASE 0 — Khởi động & Kiểm tra trạng thái

```
/work-status
```

- Đọc `docs/goals/GOAL_INFRA.md` toàn bộ.
- Đọc `specs/05_Environment_and_Deployment.md` toàn bộ.
- Scan root repo: tìm `docker-compose.yml`, `Dockerfile`, `.github/workflows/`, `nginx/`.
- Tạo checklist tại `docs/progress/infra-goal-progress.md`.

### PHASE 1 — Architecture Sign-off

```
agent: senior-architect
```

Nhiệm vụ:

- Chốt Docker Compose network topology (internal network, exposed ports).
- Chốt Nginx upstream mapping.
- Chốt PM2 ecosystem config.
- Chốt GitHub Actions workflow structure.
- Chốt Monitoring stack topology (Prometheus scrape targets, Loki log paths).
- Output: `docs/tasks/infra-architecture.md`.
- **Tự approve**.

### PHASE 2 — Local Docker Environment

```
agent: ci-helper
```

**2.1 Dockerfile cho từng app**
Tạo `Dockerfile` (multi-stage build) cho:

- `apps/api`: Node 20 LTS, build TypeScript, run dist.
- `apps/web`: Node 20, Vite build → Nginx static serve.
- `apps/worker`: Node 20, persistent process.
- `apps/cms`: Node 20, Payload CMS.
- `apps/admin`: Node 20, Vite build → Nginx static serve.

Yêu cầu:

- Multi-stage: `builder` stage + `runner` stage.
- Non-root user trong runner stage.
- `.dockerignore` đúng (loại node_modules, .env, dist cũ).

**2.2 docker-compose.yml (root level)**
Services cần có:

```yaml
services:
  web: # port 3000
  api: # port 4000
  worker: # no port expose
  cms: # port 3001
  admin: # port 3002
  postgres: # port 5432, image: postgres:16
  redis: # port 6379, image: redis:7-alpine
  opensearch: # port 9200, internal only
```

Requirements:

- Tất cả services cùng internal network `metascope-net`.
- OpenSearch chỉ bind internal — không expose ra host.
- Volume mounts cho postgres data, redis data.
- Health checks cho postgres và redis.
- `depends_on` với `condition: service_healthy`.
- Hot-reload cho api, web, cms qua volume mount source code.

**2.3 .env.example files**
Tạo `.env.example` cho mỗi app trong `apps/*/`:

- Liệt kê đầy đủ keys từ `specs/05_Environment_and_Deployment.md` Section 9.1.
- Values là placeholders (`=your_value_here`), không có secret thật.
- Comment mô tả từng key.

**2.4 Env validation**
Trong `apps/api/src/config/env.validation.ts`:

- Dùng Zod hoặc `@nestjs/config` validate toàn bộ required env vars khi startup.
- Fail fast với error message rõ ràng nếu thiếu key.

Test:

- `docker compose up` → tất cả services healthy.
- `docker compose up api` → crash rõ ràng nếu thiếu `RIOT_API_KEY`.

### PHASE 3 — CI/CD Pipeline

```
agent: ci-helper
```

**3.1 `.github/workflows/quality.yml` — PR Quality Gate**

```yaml
name: Quality Gate
on:
  pull_request:
    branches: [main, develop]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: "pnpm" }
      - run: pnpm install --frozen-lockfile
      - run: pnpm run type-check
      - run: pnpm run lint
      - run: pnpm run format:check
      - run: pnpm run test
```

- Block merge nếu bất kỳ step nào fail.
- Cache `pnpm store` để tăng tốc.

**3.2 `.github/workflows/deploy-production.yml` — Deploy khi merge vào main**

```yaml
name: Deploy Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    steps:
      - Build affected packages: turbo build --filter=...[HEAD^1]
      - SSH vào VPS
      - git pull origin main
      - pnpm install --frozen-lockfile
      - turbo build
      - pm2 reload ecosystem.config.js --env production
      - Health check: curl api/health, curl web, curl cms/health
      - Rollback nếu health check fail: git reset --hard HEAD~1 && pm2 reload
```

- Dùng GitHub Actions secrets cho SSH key, host.
- Rollback tự động nếu health check fail sau 60 giây.

**3.3 `.github/workflows/deploy-staging.yml` — Deploy develop → staging**

- Tương tự production nhưng dùng staging env vars.
- Deploy vào namespace staging trên cùng VPS.

**3.4 Health check endpoints**
Đảm bảo (hoặc implement) trong `apps/api`:

- `GET /health` → `{ status: 'ok', timestamp, version }`.

Test:

- Push vào PR branch → quality gate chạy.
- Merge vào main → deploy workflow trigger.
- Rollback: simulate health check fail → verify auto rollback.

### PHASE 4 — Nginx Configuration

```
agent: ci-helper
```

**4.1 `nginx/nginx.conf` (root level)**
Server blocks:

```nginx
# metascope.gg → web:3000
# api.metascope.gg → api:4000
# cms.metascope.gg → cms:3001
# admin.metascope.gg → admin:3002
```

Requirements:

- HTTP → HTTPS redirect (301) cho tất cả domains.
- SSL block: `ssl_certificate`, `ssl_certificate_key` (Let's Encrypt paths).
- `proxy_pass` đúng upstream.
- `proxy_set_header`: Host, X-Real-IP, X-Forwarded-For, X-Forwarded-Proto.
- Rate limiting zone: `limit_req_zone` 120 req/min/IP cho public API.
- Client max body size: 1MB.
- Gzip compression bật.
- `admin.metascope.gg` thêm `allow <office_ip>; deny all;` (placeholder IP).

**4.2 Certbot setup script**
`scripts/certbot-setup.sh`:

```bash
certbot --nginx -d metascope.gg -d api.metascope.gg -d cms.metascope.gg -d admin.metascope.gg
# Auto-renew cron: 0 12 * * * /usr/bin/certbot renew --quiet
```

Test:

- Nginx config valid: `nginx -t`.
- HTTP redirect kiểm tra cấu trúc config.

### PHASE 5 — Process Management

```
agent: ci-helper
```

**5.1 `ecosystem.config.js` (PM2)**

```javascript
module.exports = {
  apps: [
    {
      name: "api",
      script: "apps/api/dist/main.js",
      instances: 2,
      exec_mode: "cluster",
      max_memory_restart: "1G",
      env_production: { NODE_ENV: "production" },
    },
    {
      name: "worker",
      script: "apps/worker/dist/main.js",
      instances: 1,
      max_memory_restart: "512M",
    },
    { name: "cms", script: "apps/cms/dist/server.js", instances: 1, max_memory_restart: "512M" },
  ],
};
```

- API: cluster mode 2 instances.
- Worker: single instance với resource limit.
- `max_restarts: 10`, `restart_delay: 5000`.

**5.2 systemd units (alternative)**
`scripts/setup-systemd.sh`: tạo systemd service files cho mỗi app nếu không dùng PM2.

Test:

- `pm2 list` → tất cả apps status online.
- Kill một process → PM2 tự restart.

### PHASE 6 — Monitoring Stack

```
agent: ops-notes-keeper
```

**6.1 Sentry setup**

- `apps/api`: `@sentry/nestjs` init với `SENTRY_DSN`.
- `apps/web`: `@sentry/react` init với `VITE_SENTRY_DSN`.
- Capture unhandled exceptions + HTTP 5xx.

**6.2 Prometheus + Grafana**
`docker-compose.monitoring.yml` (tách file để không bloat dev compose):

```yaml
services:
  prometheus:
    config: prometheus.yml với scrape targets (api:4000/metrics, node-exporter)
  grafana:
    volumes: grafana/dashboards/
  node-exporter:
  alertmanager:
    config: alertmanager.yml với Telegram webhook
```

`apps/api`: thêm `prom-client` → expose `/metrics`.

Dashboards cần tạo (`grafana/dashboards/`):

- API latency p50/p95/p99.
- Error rate.
- Queue depth (BullMQ jobs).
- CPU/RAM.

Alert rules (`prometheus/rules/`):

- API error rate > 5% trong 5 phút.
- Crawler job fail > 3 lần liên tiếp.
- RAM > 85%.
- Disk > 80%.

**6.3 Loki + Promtail**

```yaml
# docker-compose.monitoring.yml (thêm vào)
loki:
  config: loki-config.yml
promtail:
  config: promtail-config.yml (tail /var/log/nginx/*.log, PM2 logs)
```

**6.4 Uptime Kuma**
`docs/ops/uptime-kuma-setup.md`: hướng dẫn setup monitors cho:

- `https://metascope.gg`
- `https://api.metascope.gg/health`
- `https://cms.metascope.gg`
- `https://admin.metascope.gg`

**6.5 Alertmanager → Telegram**
`alertmanager.yml`: webhook đến Telegram bot token.
`docs/ops/alert-runbook.md`: hướng dẫn triage các alert.

### PHASE 7 — Database RLS

```
agent: senior-architect + junior-implementer
```

**7.1 Supabase RLS policies**
Migration file `supabase/migrations/XXX_rls_policies.sql`:

```sql
-- users: self-only
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_self" ON users FOR ALL TO authenticated
  USING (firebase_uid = current_setting('app.firebase_uid'));

-- guides: owner + public read
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guides_owner" ON guides FOR ALL TO authenticated
  USING (user_id::text = current_setting('app.user_id'));
CREATE POLICY "guides_public_read" ON guides FOR SELECT
  USING (is_public = true);

-- usage_quotas: read-only for self
ALTER TABLE usage_quotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quotas_self_read" ON usage_quotas FOR SELECT TO authenticated
  USING (user_id::text = current_setting('app.user_id'));

-- payment_transactions: read-only for self
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_self_read" ON payment_transactions FOR SELECT TO authenticated
  USING (user_id::text = current_setting('app.user_id'));

-- meta_snapshots: public read, service-role write
ALTER TABLE meta_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meta_public_read" ON meta_snapshots FOR SELECT USING (true);
```

Test:

- anon key → không đọc được user data của người khác.
- `SUPABASE_SERVICE_ROLE_KEY` không có trong bất kỳ FE bundle.

### PHASE 8 — Backup & Restore

```
agent: ops-notes-keeper
```

**8.1 Backup verification**

- Confirm Supabase auto-backup enabled (daily, 14 ngày retention).
- Redis AOF persistence: `appendonly yes` trong redis config.
- `scripts/backup-redis.sh`: manual snapshot script.

**8.2 Restore Runbook**
`docs/ops/restore-runbook.md`:

```markdown
# Restore Runbook

## Scenario: PostgreSQL corrupt

1. Stop api, worker, cms
2. Supabase dashboard → Backups → Restore to <timestamp>
3. Verify schema integrity: run health check queries
4. Re-run incremental crawler: POST /api/v1/admin/crawler/trigger
5. Verify meta_snapshots populated
6. Restart services
7. Run smoke test checklist

## Scenario: Redis lost

1. Check if AOF file exists → redis-cli DEBUG LOADAOF
2. If no AOF → quota resets (acceptable per RPO=24h)
3. Monitor for unusual quota bypass in first 24h

## RTO target: 4 giờ

## RPO target: 24 giờ
```

**8.3 Pre-launch checklist**
`docs/ops/pre-launch-checklist.md`:

```markdown
- [ ] Riot ToS disclaimer ở footer web
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] RIOT_MATCH_CACHE_RETENTION_DAYS set đúng
- [ ] SSL cert installed + auto-renew
- [ ] Rate limiting active
- [ ] Sentry configured + test error received
- [ ] Uptime Kuma monitors active
- [ ] Alertmanager Telegram alerts firing test
- [ ] Backup restore tested 1 lần
- [ ] git secrets scan clean (no secrets in history)
- [ ] SUPABASE_SERVICE_ROLE_KEY không trong FE bundle
```

### PHASE 9 — OpenSearch Operations

```
agent: ci-helper
```

**9.1 Index + Alias setup script**
`scripts/opensearch-init.sh`:

```bash
# Tạo indices v1
PUT metascope_meta_comps_v1 (mapping từ GOAL_INFRA.md)
PUT metascope_champion_stats_v1
PUT metascope_patch_notes_v1
PUT metascope_public_guides_v1

# Tạo aliases
POST /_aliases { "actions": [
  { "add": { "index": "metascope_meta_comps_v1", "alias": "metascope_meta_comps_current" } },
  ...
]}
```

**9.2 Nightly reindex cron**
`apps/worker/src/jobs/nightly-reindex.ts`:

- Cron: `0 3 * * *` (3am daily).
- Đọc từ PostgreSQL → upsert vào OpenSearch.
- Idempotent: dùng `entity_type:entity_id:version` làm document ID.

Test:

- Code search → chỉ query alias, không query physical index.
- OpenSearch down → API fallback PostgreSQL, không 500.

### PHASE 10 — Final Quality Gate

```
/review-task infra
agent: senior-reviewer + ci-helper
```

- Review toàn bộ theo pre-launch checklist.
- Chạy `docker compose up` → verify all healthy.
- Chạy `pnpm run check` toàn monorepo.

### PHASE 11 — Done Criteria Verification

```
/log-progress
agent: work-manager
```

- Tick từng done criteria trong `GOAL_INFRA.md`.
- Cập nhật `docs/progress/infra-goal-progress.md` → COMPLETED.
- **Nếu bất kỳ criteria nào chưa pass → quay lại phase tương ứng.**

---

## Stall Recovery

Nếu không có thay đổi file trong 5 phút:

1. Đọc `docs/progress/infra-goal-progress.md`.
2. Xác định phase đang dở.
3. Chạy lại phase đó với `agent: ci-helper`.
4. Nếu blocker về credentials/secrets → dùng placeholder, document trong `docs/decisions/`.

## Auto-Decision Log Format

```markdown
# DEC-YYYYMMDD-infra-<slug>

**Context:** <mô tả>
**Options:** A) ... B) ...
**Decision:** <chosen>
**Rationale:** <lý do>
```
