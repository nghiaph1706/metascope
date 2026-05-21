# Environment and Deployment

## 9. Môi Trường & Deployment

> Các giá trị môi trường dưới đây là chuẩn triển khai production hiện tại. Developer không được hardcode các giá trị bí mật vào source code.


### 9.0. Môi Trường Local (Local Development)

> Ở local nên chạy Docker cho các repository (repo) để đảm bảo tính đồng nhất môi trường và giảm tải việc cài đặt dependencies thủ công. Cập nhật specs: Các dev workflow nên gắn với local docker compose.

### 9.1. Biến Môi Trường (Environment Variables)

Tất cả env vars phải được lưu trong secret manager (không commit lên git). Mỗi app trong monorepo có file `.env.local` riêng.

#### `/apps/api` (NestJS)

```env
# Riot Games
RIOT_API_KEY=                        # Production key từ Riot Developer Portal
RIOT_API_REGION=                     # vd: sea, na1, euw1
RIOT_MATCH_CACHE_RETENTION_DAYS=30    # Mặc định 30 ngày, điều chỉnh theo Riot policy hiện hành

# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=           # Server-side only, không expose ra client

# Redis TCP-compatible (bắt buộc cho BullMQ)
REDIS_TCP_HOST=
REDIS_TCP_PORT=6379
REDIS_TCP_PASSWORD=

# Upstash REST (optional, chỉ dùng cho cache REST nếu cần)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# OpenSearch
OPENSEARCH_NODE=
OPENSEARCH_USERNAME=
OPENSEARCH_PASSWORD=
OPENSEARCH_INDEX_PREFIX=metascope

# LLM
LLM_API_KEY=                         # API key provider LLM (bắt buộc)
LLM_MODEL=claude-sonnet-4-6          # model mặc định production

# PayOS
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=                  # Dùng để verify webhook signature

# App
PORT=4000
NODE_ENV=production
API_BASE_URL=                        # vd: [https://api.metascope.gg](https://api.metascope.gg)
CORS_ORIGIN=                         # vd: [https://metascope.gg](https://metascope.gg)

```

#### `/apps/web` (React/Vite)

```env
# Chỉ VITE_ prefix mới expose ra browser
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=              # Public key, an toàn để expose
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_API_BASE_URL=                   # NestJS API URL

```

#### `/apps/worker` (Crawler)

```env
RIOT_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
CRAWL_SCHEDULE=                      # Cron expression, vd: 0 2 * * 3 (thứ 4 2am)
CRAWL_PLAYER_SAMPLE_SIZE=500         # Số player top ladder crawl mỗi full cycle

```

#### `/apps/cms` (Payload)

```env
PAYLOAD_SECRET=                      # Random string, dùng để sign Payload sessions
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

```

### 9.2. Hosting & Deployment

> Toàn bộ hệ thống deploy trên **01 VPS** duy nhất. Các ứng dụng chạy dạng process/container riêng, reverse proxy bằng Nginx.

| App | Hosting triển khai | Ghi chú |
| --- | --- | --- |
| `web` | VPS (Nginx + static build hoặc Node serve) | domain: metascope.gg |
| `api` | VPS | domain: api.metascope.gg |
| `worker` | VPS | chạy persistent bằng systemd/pm2, giới hạn concurrency để không ảnh hưởng API realtime |
| `cms` | VPS | domain: cms.metascope.gg |
| `admin` | VPS | domain: admin.metascope.gg |
| `opensearch` | VPS | chạy node OpenSearch local, bind private network/internal only |

**Baseline tài nguyên VPS (production):** tối thiểu 8 vCPU, 16GB RAM, 200GB SSD, Ubuntu LTS; tách process bằng systemd/pm2 và đặt CPU/memory limits cho worker/monitoring.

### 9.3. CI/CD Pipeline

> CI/CD được chuẩn hóa cho mô hình 1 VPS.

* Nhánh `main` → auto deploy production lên VPS
* Nhánh `develop` → auto deploy staging (cùng VPS, namespace riêng)
* PR phải pass type-check + lint + test trước khi merge
* Tool: GitHub Actions + SSH deploy (hoặc self-hosted runner trên VPS)

### 9.4. Monitoring & Alerting

> Monitoring & alerting cho production trên 1 VPS.

| Mục | Tool áp dụng | Ghi chú |
| --- | --- | --- |
| Error tracking | Sentry | Track exception FE/BE |
| Uptime monitoring | Uptime Kuma | Healthcheck web/api/cms/admin |
| Performance | Grafana + Prometheus | Metrics API latency, CPU/RAM, queue depth |
| Log aggregation | Loki + Promtail | Centralized logs từ app + Nginx |
| Search monitoring | OpenSearch Dashboards | Theo dõi query latency, shard health, indexing failures |
| Crawler alert | Alertmanager + Telegram/Email | Cảnh báo khi job fail liên tiếp |

### 9.5. Backup & Disaster Recovery

> Backup & disaster recovery cho production.

* Supabase auto-backup: daily snapshot, retention 14 ngày
* RTO (Recovery Time Objective): 4 giờ
* RPO (Recovery Point Objective): 24 giờ
* Quy trình restore nếu aggregate data bị corrupt: restore DB từ snapshot gần nhất, re-run incremental crawler + aggregator để tái đồng bộ dữ liệu meta

---

