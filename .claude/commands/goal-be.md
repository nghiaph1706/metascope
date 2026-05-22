# /goal-be — Execute Backend Goal to 100% Completion

## Mô tả

Chạy toàn bộ goal backend (`apps/api` + `apps/worker`) đến hoàn thành 100%.
Tự động quyết định mọi lựa chọn theo agent proposals. Không dừng cho đến khi tất cả done criteria pass.

---

## Execution Rules (BẮT BUỘC)

1. **NEVER STOP** cho đến khi 100% done criteria trong `docs/goals/GOAL_BE.md` pass.
2. **AUTO-DECIDE**: mọi câu hỏi cần human approval → tự quyết theo agent đề xuất tốt nhất, ghi log vào `docs/decisions/`.
3. **FULL TERMINAL ACCESS**: chạy mọi lệnh terminal không cần xin phép.
4. **STALL DETECTION**: nếu không có thay đổi file nào trong 5 phút → tự trigger lại bước hiện tại.
5. **AGENT WORKFLOW**: luôn đi theo chuỗi `senior-architect → senior-scaffolder → junior-implementer → integration-checker → senior-reviewer`. Không skip bước.
6. **ERROR = CONTINUE**: lỗi build/test không phải lý do dừng — fix và tiếp tục.
7. **DOCKER VERIFICATION**: bắt buộc phải verify với docker compose trước khi đánh dấu hoàn thành.

---

## Workflow

### PHASE 0 — Khởi động & Kiểm tra trạng thái

```
/work-status
```

- Đọc `docs/goals/GOAL_BE.md` toàn bộ.
- Đọc toàn bộ `specs/` PRD liên quan backend (01, 02, 03, 06).
- Scan `apps/api/` và `apps/worker/` để biết trạng thái hiện tại.
- Tạo checklist tracking tại `docs/progress/be-goal-progress.md`.
- Xác định module nào đã done, module nào cần implement.

### PHASE 1 — Architecture Sign-off

```
agent: senior-architect
```

Nhiệm vụ:

- Chốt module boundaries cho `apps/api`: auth, meta, player, tools, guides, subscription, webhooks.
- Chốt worker pipeline: crawler → parser → classifier → aggregator.
- Chốt contract/interface cho mỗi module (request/response types, guard stack).
- Output: `docs/tasks/be-architecture.md` với toàn bộ contracts đã approved.
- **Tự approve** output của senior-architect. Không chờ human.

### PHASE 2 — Scaffold

```
/scaffold-task apps/api
agent: senior-scaffolder
```

Nhiệm vụ (theo thứ tự):

1. Scaffold NestJS module structure: `auth`, `meta`, `player`, `tools`, `guides`, `subscription`, `webhooks`.
2. Scaffold guards: `FirebaseAuthGuard`, `TierGuard`, `QuotaGuard`.
3. Scaffold services: `riot.service`, `llm.service`, `quota.service`.
4. Scaffold worker: `meta-crawler`, `meta-aggregator`, `patch-checker`.
5. Scaffold DB schema migrations (Supabase PostgreSQL).
6. Scaffold Redis key patterns và TTL config.

### PHASE 3 — Implementation (theo thứ tự dependency)

```
/implement-task <module>
agent: junior-implementer
```

Thứ tự bắt buộc — implement từng module, chạy test, fix, tiếp tục:

**3.1 Auth & Identity**

- `FirebaseAuthGuard`: verify Firebase JWT, gắn user vào request.
- `sync-profile` endpoint: upsert `users` table từ Firebase UID.
- `GET /api/v1/auth/me`: trả tier + quota + profile từ DB.
- Test: guard pass/fail, sync-profile idempotency.

**3.2 DB Schema & Migrations**

- Tạo toàn bộ migrations cho: `users`, `entitlement_ledger`, `usage_quotas`, `meta_snapshots`, `champion_stats`, `guides`, `match_cache`, `comp_counters`, `payment_transactions`, `processed_webhooks`.
- Enable RLS policies theo GOAL_BE.md.
- Seed script cho local dev.

**3.3 Quota & Entitlement System**

- `QuotaService`: đọc/ghi Redis counter, atomic INCR + EXPIRE.
- `TierGuard`: check `tier` + `tier_expires_at < NOW()`.
- `QuotaGuard`: check + increment theo feature + window.
- Limits: post_game_analysis (basic: 2/week, premium: 3/day), elo_predictor (basic: 5/week, premium: unlimited), matchup_coach (basic: blocked, premium: unlimited).
- Test: basic vượt quota → 429, premium hết hạn → 403.

**3.4 Meta Library API**

- `GET /api/v1/meta/comps` — query OpenSearch alias `metascope_meta_comps_current`; fallback PostgreSQL khi OpenSearch lỗi.
- `GET /api/v1/meta/comps/:compId`
- `GET /api/v1/meta/champions` + `/:championId`
- `GET /api/v1/meta/patch-notes` + `/:version`
- Chỉ trả `status='live' AND approved=true`.
- OpenSearch index setup + alias creation.

**3.5 Player Stats API**

- `GET /api/v1/player/:riotId` — proxy Riot API qua `riot.service`.
- `GET /api/v1/player/:riotId/matches`
- `GET /api/v1/player/:riotId/matches/:matchId`
- `riot.service`: axios + bottleneck rate limiter, cache vào `match_cache`, TTL theo `RIOT_MATCH_CACHE_RETENTION_DAYS`.
- Guard: FirebaseAuthGuard + TierGuard('basic').
- Test: cache hit, Riot 429 retry.

**3.6 Elo Predictor Tool**

- `POST /api/v1/tools/elo-predictor`
- Input validation: Zod schema.
- Heuristic algorithm: quỹ đạo, LP avg, số game ước tính, lời khuyên.
- Guard: FirebaseAuthGuard + QuotaGuard('elo_predictor', 'weekly', 1).
- Idempotency key.
- Test: input biên (toàn 1, toàn 8, mixed).

**3.7 Post-Game AI Analysis**

- `POST /api/v1/tools/post-game-analysis`
- Parse match data → scoring algorithm → LLM call.
- LLM cache per-match (Redis, không per-user).
- Guard: FirebaseAuthGuard + TierGuard('basic') + QuotaGuard('post_game_analysis', ...).
- Test: valid match ID → Report Card; LLM cache hit.

**3.8 Matchup Coach (Premium)**

- `POST /api/v1/tools/matchup-coach`
- Query `comp_counters` + LLM narrative.
- LLM cache theo `(enemy_comp_id, patch_version)`.
- Guard: FirebaseAuthGuard + TierGuard('premium') + QuotaGuard('matchup_coach', ...).
- Test: basic user → 403; LLM cache theo patch.

**3.9 Guides CRUD**

- `POST/GET/PUT/DELETE /api/v1/guides`
- Ownership check server-side.
- RLS double-check.

**3.10 PayOS Payment Flow**

- `POST /api/v1/subscription/create-payment-link`
- `POST /api/v1/webhooks/payos` (no auth required)
  - Verify HMAC-SHA256 signature FIRST.
  - Idempotency check via `processed_webhooks`.
  - Atomic update: transaction + users.tier + entitlement_ledger.
  - Gia hạn logic: extend từ `tier_expires_at` nếu đang premium.
- Test: signature valid/tampered, idempotency, tier extend.

**3.11 Worker — Meta Crawler & Aggregator**

- `meta-crawler`: seed top 500 → crawl 20 match/player.
- `meta-aggregator`: parse → classify → aggregate → store `meta_snapshots` với `status='draft'`.
- `patch-checker`: detect patch mới → trigger full crawl.
- Incremental daily crawl.
- Rate limit: bottleneck, exponential backoff trên 429.
- Test: 429 handling, draft status sau crawl.

### PHASE 4 — Integration Check

```
agent: integration-checker
```

- Verify toàn bộ imports đúng.
- Verify guard stack đúng thứ tự trên mỗi endpoint.
- Verify Redis TTL patterns đúng spec.
- Verify OpenSearch alias usage (không query physical index).
- Verify webhook không cấp entitlement từ returnUrl.
- Chạy `pnpm type-check` và fix tất cả errors.

### PHASE 5 — Test Suite

```
agent: junior-test-writer
```

Viết và chạy toàn bộ tests bắt buộc:

- Unit: Elo Predictor biên, quota middleware, PayOS signature, tier downgrade.
- Integration: Riot 429 retry, webhook → tier upgrade, webhook idempotency.
- Chạy: `pnpm test` — fix cho đến khi pass.

### PHASE 6 — Final Quality Gate

```
/review-task apps/api apps/worker
agent: senior-reviewer
```

- Review toàn bộ theo guardrails trong `GOAL_BE.md`.
- Checklist: Firebase UID canonical, server-side entitlement, no Riot key leak, webhook signature first, no Live Tracker, match cache retention.
- Nếu tìm thấy violation → fix ngay, không defer.
- Chạy `pnpm run check` (format + lint + typecheck + test).

### PHASE 7 — Done Criteria Verification

```
/log-progress
agent: work-manager
```

Tick từng done criteria trong `GOAL_BE.md`:

- [ ] All 8 mục tiêu: Auth, Quota, AI Tools, Player Stats, Meta API, Guides, Payment, Worker.
- [ ] Tất cả test pass.
- [ ] `pnpm run check` pass clean.
- Cập nhật `docs/progress/be-goal-progress.md` với status COMPLETED.
- **Nếu bất kỳ criteria nào chưa pass → quay lại phase tương ứng và fix.**

---

## Stall Recovery

Nếu không có thay đổi file trong 5 phút:

1. Đọc lại `docs/progress/be-goal-progress.md`.
2. Xác định bước cuối cùng đang chạy.
3. Chạy lại bước đó với agent tương ứng.
4. Nếu có lỗi blocker → tự quyết theo best option, ghi vào `docs/decisions/DEC-$(date +%Y%m%d)-be-<slug>.md`.

## Auto-Decision Log Format

```markdown
# DEC-YYYYMMDD-be-<slug>

**Context:** <mô tả tình huống>
**Options considered:**
A) <option A>
B) <option B>
**Decision:** <option chosen>
**Rationale:** <lý do ngắn gọn theo PRD/guardrails>
```
