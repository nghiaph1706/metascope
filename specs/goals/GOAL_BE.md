# GOAL: Backend (`apps/api` + `apps/worker`)

## Tổng quan vai trò

Backend là **source of truth** duy nhất cho identity, entitlement, quota và billing state. Frontend là lớp hiển thị — mọi logic nghiệp vụ phải được validate và enforce tại đây.

---

## Mục tiêu chính

### 1. Auth & Identity (`/modules/auth`)

- **Goal:** Thiết lập Firebase UID làm canonical identity cho toàn hệ thống.
- Implement `FirebaseAuthGuard` verify JWT mỗi request; gắn `user` object vào request context.
- Implement `sync-profile` endpoint: nhận Firebase UID sau login, tạo hoặc cập nhật bản ghi `users` trong PostgreSQL.
- Xử lý edge case: provider không trả email → fallback UID-based profile.
- Expose `GET /api/v1/auth/me` trả tier, quota usage, profile info từ DB (không từ token).

**Done criteria:**

- [ ] `FirebaseAuthGuard` verify thành công và thất bại đúng cách.
- [ ] `sync-profile` idempotent — gọi nhiều lần không tạo duplicate user.
- [ ] `GET /me` phản ánh đúng tier và `tier_expires_at` từ DB.

---

### 2. Entitlement & Quota Enforcement (`/modules/subscription`, middleware)

- **Goal:** Server-side enforcement đúng spec Section 2 + Section 5.5.
- Implement `TierGuard` kiểm tra `tier` + `tier_expires_at < NOW()` mỗi request vào premium route.
- Implement `QuotaGuard` đọc/ghi Redis counter theo window daily/weekly; trả `HTTP 429` khi vượt giới hạn.
- Downgrade tự động: không cần cron — middleware check `tier_expires_at` runtime.
- Quota limits:
  - `post_game_analysis`: basic → 2/tuần; premium → 3/ngày.
  - `elo_predictor`: basic → 5/tuần; premium → unlimited (fair-use).
  - `matchup_coach`: basic → blocked; premium → unlimited.

**Done criteria:**

- [ ] Basic user vượt quota → `429 Too Many Requests`.
- [ ] Premium user hết hạn → request premium route trả `403 Forbidden`.
- [ ] Quota counter atomic (Redis INCR + EXPIRE), không race condition.

---

### 3. AI Tools (`/modules/tools`)

- **Goal:** Implement 3 AI tools với đúng luồng, guard, quota per PRD.

#### 3a. Elo Predictor (`elo-predictor.ts`)

- Input: rank hiện tại, LP, rank mục tiêu, kết quả 5 trận gần nhất (placement 1–8).
- Output: quỹ đạo leo rank, LP trung bình nhận/trừ, số game ước tính, lời khuyên.
- Logic: heuristic thuần (không cần LLM).
- Guard: `FirebaseAuthGuard` + `QuotaGuard('elo_predictor', 'weekly', 1)`.
- Idempotency key theo PRD.

#### 3b. Post-Game AI Analysis (`post-game.ts`)

- Input: Riot ID hoặc match ID.
- Output: Report Card với điểm số (Kinh tế, Flex trang bị, Tối ưu Lõi) và ghi chú cụ thể.
- Logic: parse match data → scoring algorithm → LLM call cho narrative.
- LLM response cache per-match (không per-user).
- Guard: `FirebaseAuthGuard` + `TierGuard('basic')` + `QuotaGuard('post_game_analysis', ...)`.

#### 3c. Matchup Coach (`matchup-coach.ts`) — Premium Only

- Input: enemy comp ID.
- Output: điểm yếu địch, hard counters, easy matchups, lời khuyên xếp bài.
- Logic: query `comp_counters` table + LLM call cho context narrative.
- LLM response cache theo `(enemy_comp_id, patch_version)` — dùng chung mọi user.
- Guard: `FirebaseAuthGuard` + `TierGuard('premium')` + `QuotaGuard('matchup_coach', ...)`.

**Done criteria:**

- [ ] Elo Predictor output đúng với input biên (toàn top1, toàn top8, mixed).
- [ ] Post-Game Analysis trả Report Card hợp lệ từ real match ID.
- [ ] Matchup Coach bị chặn với Basic user, pass với Premium.
- [ ] LLM cache hoạt động: lần 2 cùng input không gọi LLM API.

---

### 4. Player Stats (`/modules/player`)

- **Goal:** Proxy Riot API an toàn, cache đúng cách, enforce auth.
- Endpoint `GET /api/v1/player/:riotId` — profile tổng quan, LP chart.
- Endpoint `GET /api/v1/player/:riotId/matches` — 20 match gần nhất.
- Endpoint `GET /api/v1/player/:riotId/matches/:matchId` — chi tiết trận.
- Mọi Riot API call phải đi qua `riot.service.ts` với rate limiter (bottleneck).
- Cache response vào `match_cache` table; TTL theo `RIOT_MATCH_CACHE_RETENTION_DAYS`.
- Guard: `FirebaseAuthGuard` + `TierGuard('basic')`.

**Done criteria:**

- [ ] Không bao giờ expose Riot API key ra client.
- [ ] Match hit cache không gọi Riot API lần 2.
- [ ] Riot API 429 → retry đúng cách, không crash.

---

### 5. Meta Library API (`/modules/meta`)

- **Goal:** Serve tier list, champion stats, patch notes từ DB/OpenSearch.
- `GET /api/v1/meta/comps` — tier list theo patch hiện tại (chỉ `status='live' AND approved=true`).
- `GET /api/v1/meta/comps/:compId` — chi tiết 1 comp (hex grid, items, augments).
- `GET /api/v1/meta/champions` — bảng champion stats.
- `GET /api/v1/meta/champions/:championId` — chi tiết tướng + best items.
- `GET /api/v1/meta/patch-notes` + `/:version` — từ Payload CMS qua DB.
- Public endpoints (Guest access) — không cần auth, nhưng có cache/versioning.
- Query OpenSearch qua alias `metascope_*_current`; nếu OpenSearch lỗi thì fallback PostgreSQL.

**Done criteria:**

- [ ] Chỉ comp `status='live'` xuất hiện trên web.
- [ ] OpenSearch down → endpoint fallback PostgreSQL, không trả 500.

---

### 6. Guides CRUD (`/modules/guides`)

- **Goal:** Cho phép Basic+ user tạo/sửa/xóa guide cá nhân.
- `POST /api/v1/guides` — tạo guide mới.
- `PUT /api/v1/guides/:id` — sửa (chỉ owner).
- `DELETE /api/v1/guides/:id` — xóa (chỉ owner).
- `GET /api/v1/guides` — danh sách guide của user hiện tại.
- RLS enforce ở PostgreSQL; BE cũng double-check ownership.

---

### 7. Payment — PayOS Integration (`/modules/subscription`)

- **Goal:** Implement toàn bộ payment flow theo Section 10.
- `POST /api/v1/subscription/create-payment-link` — tạo PayOS payment link, lưu `pending` transaction.
- `POST /api/v1/webhooks/payos` — xử lý webhook (không cần Firebase auth).
  - Verify HMAC-SHA256 signature với `PAYOS_CHECKSUM_KEY` **trước tiên**.
  - Idempotency check qua `processed_webhooks` table.
  - Atomic update: `payment_transactions` + `users.tier` + `entitlement_ledger`.
  - Gia hạn logic: nếu đang premium chưa hết → cộng thêm 1 tháng từ `tier_expires_at`.
- Không cấp entitlement từ `returnUrl` hay client callback.

**Done criteria:**

- [ ] Webhook signature sai → reject, tier không đổi.
- [ ] Webhook gửi lại 2 lần → idempotent, tier chỉ cập nhật 1 lần.
- [ ] Gia hạn khi đang premium → `tier_expires_at` được extend đúng.

---

### 8. Worker — Meta Crawler & Aggregator (`apps/worker`)

- **Goal:** Tự động crawl và aggregate meta data sau mỗi patch.
- `meta-crawler.ts`: seed top 500 Challenger/Grandmaster → crawl 20 match/player (~10,000 records/cycle).
- `meta-aggregator.ts`: parse → classify comp → tính win_rate, avg_placement, pick_rate, best_augments, best_items → lưu vào `meta_snapshots` với `status='draft'`.
- `patch-checker.ts`: detect patch version mới → trigger full crawl.
- Incremental crawl hàng ngày: top 100 players, 5 match gần nhất.
- Rate limit: dùng `axios + bottleneck` tránh Riot API 429.
- Lỗi Riot 429 → exponential backoff, alert qua Alertmanager.
- **KHÔNG implement Live Tracker.**

**Done criteria:**

- [ ] Comp mới sau crawl có `status='draft'` — chưa xuất hiện trên web.
- [ ] Pipeline không crash khi Riot API trả 429.
- [ ] `patch_version` được ghi đúng, snapshot cũ không bị overwrite.

---

## Guardrails bắt buộc

| Rule                    | Mô tả                                                    |
| ----------------------- | -------------------------------------------------------- |
| Firebase UID canonical  | Không dùng email hay ingame_name làm identity key        |
| Server-side entitlement | Không tin bất kỳ giá trị tier/quota từ client            |
| Riot API server-only    | Không expose API key, không gọi từ FE                    |
| Webhook signature first | Verify trước khi xử lý bất kỳ logic payment nào          |
| No Live Tracker         | Tính năng này bị loại bỏ vĩnh viễn — không implement     |
| Match cache retention   | Tuân thủ `RIOT_MATCH_CACHE_RETENTION_DAYS` theo Riot ToS |

---

## Test coverage bắt buộc

- Elo Predictor: input biên (toàn 1, toàn 8, mixed).
- Quota middleware: basic vượt quota → 429; premium → pass.
- PayOS signature: valid → true, tampered → false.
- Tier downgrade: `tier_expires_at` quá khứ → reject premium request.
- Riot API 429 → retry đúng cách.
- Webhook idempotency: nhận 2 lần → chỉ xử lý 1 lần.
