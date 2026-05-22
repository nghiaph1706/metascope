# GOAL: Infrastructure (`infra` / `ops`)

## Tổng quan vai trò

Toàn bộ hệ thống MetaScope triển khai trên **1 VPS duy nhất**. Infra goal tập trung vào: môi trường local chuẩn hóa, CI/CD pipeline, monitoring, backup, và bảo mật network.

---

## Mục tiêu chính

### 1. Local Development Environment

- **Goal:** Developer onboard bằng 1 lệnh, môi trường đồng nhất trên mọi máy.
- Dùng Docker Compose cho toàn bộ local stack: web, api, worker, cms, admin, PostgreSQL, Redis, OpenSearch.
- Mỗi service mount source code để hot-reload khi dev.
- File `.env.local` template cho từng app (không commit giá trị thật).

**Cấu trúc Docker Compose services:**

| Service      | Port | Notes                           |
| ------------ | ---- | ------------------------------- |
| `web`        | 3000 | React/Vite dev server           |
| `api`        | 4000 | NestJS với nodemon              |
| `worker`     | —    | BullMQ + cron, restart on crash |
| `cms`        | 3001 | Payload CMS                     |
| `admin`      | 3002 | React Admin                     |
| `postgres`   | 5432 | Supabase-compatible PostgreSQL  |
| `redis`      | 6379 | TCP-compatible cho BullMQ       |
| `opensearch` | 9200 | Single-node, internal only      |

**Done criteria:**

- [ ] `docker compose up` khởi động toàn bộ stack thành công.
- [ ] Hot-reload hoạt động cho web, api, cms.
- [ ] OpenSearch chỉ bind internal network, không expose ra host.

---

### 2. Environment Variables & Secrets Management

- **Goal:** Không bao giờ hardcode secrets vào source code hay commit lên git.
- Mỗi app có file `.env.local` riêng (gitignored).
- Template `.env.example` cho mỗi app — liệt kê keys không có values.
- Production secrets lưu trong secret manager hoặc GitHub Actions secrets.
- Validate env vars khi startup — fail fast nếu thiếu biến bắt buộc.

**Biến môi trường quan trọng cần có:**

| App      | Key bắt buộc                                                                                   |
| -------- | ---------------------------------------------------------------------------------------------- |
| `api`    | `RIOT_API_KEY`, `FIREBASE_*`, `SUPABASE_*`, `REDIS_TCP_*`, `PAYOS_CHECKSUM_KEY`, `LLM_API_KEY` |
| `web`    | `VITE_FIREBASE_*`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`                               |
| `worker` | `RIOT_API_KEY`, `SUPABASE_*`, `UPSTASH_REDIS_*`, `CRAWL_SCHEDULE`                              |
| `cms`    | `PAYLOAD_SECRET`, `SUPABASE_*`, `FIREBASE_*`                                                   |

**Done criteria:**

- [ ] `.env.example` tồn tại cho mọi app trong monorepo.
- [ ] Startup crash rõ ràng khi thiếu biến bắt buộc (không silent fail).
- [ ] Không có secret nào trong git history.

---

### 3. CI/CD Pipeline (GitHub Actions)

- **Goal:** Auto deploy khi merge, quality gate bắt buộc trước merge.

**Nhánh:**

- `main` → auto deploy production lên VPS.
- `develop` → auto deploy staging (cùng VPS, namespace riêng).

**Pipeline mỗi PR (quality gate — bắt buộc pass trước merge):**

```yaml
jobs:
  quality:
    steps:
      - pnpm install
      - pnpm run type-check # tsc --noEmit toàn monorepo
      - pnpm run lint # ESLint
      - pnpm run format:check # Prettier
      - pnpm run test # Vitest + Jest
```

**Pipeline deploy production (`main` merge):**

```yaml
jobs:
  deploy:
    steps:
      - SSH vào VPS
      - git pull main
      - turbo build (chỉ affected packages)
      - pm2 reload / systemd restart các service
      - Health check mỗi service
      - Rollback nếu health check fail
```

**Done criteria:**

- [ ] PR không pass type-check/lint/test không thể merge vào main.
- [ ] Deploy production chỉ chạy khi merge vào main.
- [ ] Rollback tự động nếu health check sau deploy fail.

---

### 4. Nginx Reverse Proxy

- **Goal:** Route traffic đúng domain đến đúng service, enforce HTTPS.

**Domain mapping:**

| Domain               | Upstream     |
| -------------------- | ------------ |
| `metascope.gg`       | `web:3000`   |
| `api.metascope.gg`   | `api:4000`   |
| `cms.metascope.gg`   | `cms:3001`   |
| `admin.metascope.gg` | `admin:3002` |

**Nginx config requirements:**

- Redirect HTTP → HTTPS (bắt buộc).
- SSL/TLS qua Let's Encrypt (Certbot auto-renew).
- CORS headers không set ở Nginx — để NestJS tự handle theo `CORS_ORIGIN`.
- `admin.metascope.gg` và `cms.metascope.gg` — restrict access (IP whitelist nếu có thể).
- Helmet headers: CSP, X-Frame-Options, HSTS đặt tại NestJS level.
- Rate limit: 120 req/phút/IP tại Nginx cho public API; endpoint auth có ngưỡng riêng.
- Request body size limit: 1MB default.

**Done criteria:**

- [ ] HTTP tự redirect sang HTTPS.
- [ ] SSL cert auto-renew hoạt động.
- [ ] Mỗi subdomain route đúng service.

---

### 5. Process Management (PM2 / systemd)

- **Goal:** Mọi service chạy persistent, tự restart khi crash.

**Services cần manage:**

| Service      | Process manager                 | Notes                                                    |
| ------------ | ------------------------------- | -------------------------------------------------------- |
| `api`        | PM2 hoặc systemd                | Cluster mode nếu đủ CPU                                  |
| `worker`     | PM2 hoặc systemd                | Single instance, giới hạn CPU/RAM để không ảnh hưởng api |
| `cms`        | PM2 hoặc systemd                | —                                                        |
| `admin`      | PM2 hoặc systemd (static serve) | Hoặc Nginx static                                        |
| `opensearch` | systemd                         | Bind internal only                                       |

**Baseline VPS specs (production):** 8 vCPU, 16GB RAM, 200GB SSD, Ubuntu LTS.

**Resource limits khuyến nghị:**

- Worker: giới hạn 2 vCPU, 2GB RAM — tránh ảnh hưởng API khi crawl.
- OpenSearch: 4GB heap max.

**Done criteria:**

- [ ] Mọi service tự restart sau crash (max restart attempts + backoff).
- [ ] Worker không vượt resource limit được cấp.

---

### 6. Monitoring & Alerting

- **Goal:** Visibility đầy đủ vào health, performance và lỗi của toàn hệ thống.

| Công cụ                     | Mục đích                             | Setup                        |
| --------------------------- | ------------------------------------ | ---------------------------- |
| **Sentry**                  | Error tracking FE + BE               | SDK trong web và api         |
| **Uptime Kuma**             | Healthcheck mọi service              | Ping mỗi 60s, alert khi down |
| **Prometheus + Grafana**    | API latency, CPU/RAM, queue depth    | Exporter cho NestJS + Node   |
| **Loki + Promtail**         | Centralized logs (app + Nginx)       | Promtail tail log files      |
| **OpenSearch Dashboards**   | Search query latency, shard health   | Built-in với OpenSearch      |
| **Alertmanager + Telegram** | Alert khi crawler job fail liên tiếp | Webhook đến Telegram bot     |

**Metrics cần alert:**

- API error rate > 5% trong 5 phút.
- Crawler job fail > 3 lần liên tiếp.
- Riot API 429 rate bất thường.
- RAM > 85% VPS.
- Disk > 80%.

**Done criteria:**

- [ ] Sentry catch exception FE và BE, alert qua email.
- [ ] Uptime Kuma alert khi bất kỳ service nào down > 2 phút.
- [ ] Grafana dashboard hiển thị API latency p50/p95/p99.
- [ ] Crawler failure alert đến Telegram trong 5 phút.

---

### 7. Backup & Disaster Recovery

- **Goal:** Đảm bảo khả năng recover với RTO 4 giờ, RPO 24 giờ.

**Supabase:**

- Auto daily snapshot, retention 14 ngày.
- Test restore procedure định kỳ (hàng tháng).

**Redis:**

- AOF persistence bật.
- Backup daily snapshot ra external storage.

**Quy trình restore khi aggregate data corrupt:**

1. Restore DB từ Supabase snapshot gần nhất.
2. Re-run incremental crawler + aggregator để tái đồng bộ meta data.
3. Verify data integrity trước khi `status='live'` cho comps.

**Done criteria:**

- [ ] Supabase auto-backup chạy daily và verifiable.
- [ ] Restore procedure được document trong `docs/ops/restore-runbook.md`.
- [ ] RTO < 4 giờ trong scenario test.

---

### 8. Database — PostgreSQL & RLS

- **Goal:** RLS enforce tại database layer, service role key chỉ dùng server-side.

**RLS policies bắt buộc:**

| Bảng                   | Policy                                                                 |
| ---------------------- | ---------------------------------------------------------------------- |
| `users`                | User chỉ read/update row của chính mình; admin bypass qua service role |
| `guides`               | Owner full quyền; public chỉ read khi `is_public=true`                 |
| `usage_quotas`         | User chỉ read quota của mình; chỉ service role mới ghi                 |
| `payment_transactions` | User chỉ read của mình; không cho client insert/update/delete          |
| `meta_snapshots`       | Public read; chỉ service role mới write                                |

**VITE_SUPABASE_ANON_KEY** là public key an toàn expose ra FE. `SUPABASE_SERVICE_ROLE_KEY` chỉ dùng ở server, không bao giờ expose.

**Done criteria:**

- [ ] RLS test: client với anon key không đọc được data user khác.
- [ ] Service role key không tồn tại trong bất kỳ FE bundle nào.

---

### 9. OpenSearch Operations

- **Goal:** Index management và sync pipeline ổn định.

**Index naming convention:**

- Physical: `metascope_meta_comps_v1`, `metascope_champion_stats_v1`, ...
- Alias: `metascope_meta_comps_current`, ... (code chỉ query alias).

**Upgrade mapping (zero downtime):**

1. Tạo index mới `*_v2`.
2. Reindex từ `*_v1` sang `*_v2`.
3. Swap alias atomically.
4. Xóa `*_v1` sau verify.

**Cron jobs:**

- `nightly_reindex`: đối soát và rebuild index từ PostgreSQL nếu lệch dữ liệu.

**Done criteria:**

- [ ] Code không query physical index — chỉ qua alias.
- [ ] Reindex không downtime (alias swap atomic).
- [ ] OpenSearch down → API fallback PostgreSQL, không 500.

---

## Checklist pre-launch

- [ ] Riot ToS disclaimer hiển thị ở footer web.
- [ ] Privacy Policy và Terms of Service published trước khi mở đăng ký.
- [ ] `RIOT_MATCH_CACHE_RETENTION_DAYS` set theo Riot policy hiện hành.
- [ ] SSL cert installed và auto-renew configured.
- [ ] Rate limiting active trên tất cả public endpoints.
- [ ] Sentry, Uptime Kuma, Alertmanager đều có alert destination configured.
- [ ] Backup restore procedure tested thành công ít nhất 1 lần.
- [ ] Không có secret nào trong git history (`git secrets scan`).
