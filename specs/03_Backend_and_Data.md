# Backend Architecture and Data

## 5. Kiến Trúc Backend & Dữ Liệu

> Phần này mô tả chi tiết thiết kế hệ thống phía server để AI/developer có thể hiểu rõ cách implement từng tầng. Frontend chỉ là lớp hiển thị — mọi logic nghiệp vụ, quota, và tính toán đều phải được xử lý và validate ở BE.

---

### 5.1. Nguồn Dữ Liệu (Data Sources)

MetaScope **không scrape dữ liệu từ các web đối thủ** (vi phạm ToS, không bền vững). Toàn bộ data lấy từ các nguồn hợp lệ sau:

| Nguồn | Loại dữ liệu | Ghi chú |
|---|---|---|
| **Riot Games Official API** | Match history, rank, leaderboard, PUUID lookup | Cần API key; production key có rate limit cao hơn dev key |
| **Data Dragon (Riot)** | Static game data: stats tướng, recipe trang bị, icon | Cập nhật theo từng patch, URL có version number |
| **CommunityDragon** | Asset bổ sung: splash art, icon tộc hệ, tooltip | Free, không cần key, cập nhật nhanh hơn Data Dragon |
| **Tự aggregate (internal)** | Win rate, pick rate, avg placement theo comp | Xây từ match history crawl — đây là core data của toàn hệ thống |

**Riot API endpoints chính cần dùng:**

```

GET /tft/summoner/v1/summoners/by-name/{summonerName}    → lấy PUUID
GET /tft/match/v1/matches/by-puuid/{puuid}/ids           → danh sách match ID
GET /tft/match/v1/matches/{matchId}                      → chi tiết 1 trận
GET /tft/league/v1/entries/by-summoner/{summonerId}      → rank hiện tại
GET /tft/league/v1/{queue}/master|grandmaster|challenger → top ladder

```

> **Lưu ý rate limit:** Development key giới hạn 20 req/s, 100 req/2min. Production key cần apply qua Riot Developer Portal. Mọi Riot API call phải đi qua server — không bao giờ gọi trực tiếp từ client (lộ API key).

---

### 5.2. Pipeline Aggregate Meta Data

Đây là phần phức tạp nhất và quyết định chất lượng toàn bộ sản phẩm. Tier list, win rate, comp ranking đều phụ thuộc vào pipeline này.

**Quy trình chạy sau mỗi patch (khoảng 2 tuần/lần):**


```

1. SEED — Lấy danh sách top ~500 tài khoản (Challenger + Grandmaster)
└─ Riot API: /tft/league/v1/challenger + grandmaster
2. CRAWL — Với mỗi account, lấy 20 match gần nhất
└─ Riot API: /tft/match/v1/matches/by-puuid/{puuid}/ids
└─ Riot API: /tft/match/v1/matches/{matchId}
→ Tổng: ~500 players × 20 matches = ~10,000 match records/patch cycle
3. PARSE — Từ mỗi match, extract dữ liệu cần thiết:
* augments[]        (Lõi công nghệ đã chọn)
* units[]           (Tướng + trang bị + star level)
* traits[]          (Tộc hệ đang active)
* placement         (Vị trí kết thúc: 1–8)
* last_round        (Tổng số round đã đấu)


4. CLASSIFY — Gán mỗi trận vào 1 "comp archetype" dựa trên pattern
* Dùng rule-based matching: nếu có ≥3 units thuộc comp X và carry chính là unit Y → label là comp X
* Các trận không khớp pattern nào → label là "Flex/Other", bỏ qua khi tính win rate theo comp


5. AGGREGATE — Tính toán và lưu vào DB:
* win_rate          = số trận top4 / tổng trận của comp đó
* avg_placement     = trung bình vị trí kết thúc
* pick_rate         = số trận có comp này / tổng match trong sample
* best_augments[]   = augment nào xuất hiện nhiều nhất khi comp đó top4
* best_items[unit]  = trang bị combo nào win rate cao nhất trên từng carry


6. STORE — Ghi vào bảng meta_snapshots với patch_version + timestamp
* Không xóa snapshot cũ → dùng để so sánh meta shift giữa các patch



```

**Tần suất chạy:** Job full crawl chạy sau mỗi patch. Ngoài ra, chạy incremental crawl hàng ngày với sample nhỏ hơn (top 100 players, 5 match gần nhất) để cập nhật nhanh khi meta thay đổi trong patch.

---

### 5.3. Database Schema

Sử dụng **PostgreSQL** cho relational data. **Redis** cho cache và quota tracking.

#### Bảng chính:

```sql
-- Người dùng hệ thống
users (
  id UUID PRIMARY KEY,
  firebase_uid VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  ingame_name VARCHAR,
  is_banned BOOLEAN DEFAULT FALSE,
  banned_reason TEXT,
  banned_at TIMESTAMP,
  tier VARCHAR DEFAULT 'basic',         -- 'basic' | 'premium'
  tier_expires_at TIMESTAMP,            -- NULL nếu basic (không hết hạn)
  created_at TIMESTAMP DEFAULT NOW()
)

-- Nhật ký entitlement để audit/payment reconciliation
entitlement_ledger (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  source VARCHAR NOT NULL,              -- 'payos_webhook' | 'admin_manual' | 'system'
  action VARCHAR NOT NULL,              -- 'grant' | 'extend' | 'downgrade' | 'revoke'
  tier_before VARCHAR,
  tier_after VARCHAR,
  expires_before TIMESTAMP,
  expires_after TIMESTAMP,
  reference_id VARCHAR,                 -- order_code / admin_ticket_id
  created_at TIMESTAMP DEFAULT NOW()
)

-- Quota sử dụng theo tuần/ngày (enforce server-side)
usage_quotas (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  feature VARCHAR NOT NULL,             -- 'post_game_analysis' | 'elo_predictor'
  period_type VARCHAR NOT NULL,         -- 'daily' | 'weekly'
  period_start DATE NOT NULL,           -- ngày đầu tuần hoặc ngày hiện tại
  count INTEGER DEFAULT 0,
  UNIQUE(user_id, feature, period_start)
)

-- Snapshot meta data theo từng patch
meta_snapshots (
  id UUID PRIMARY KEY,
  patch_version VARCHAR NOT NULL,       -- vd: '14.10'
  comp_name VARCHAR NOT NULL,           -- vd: 'Mythic Bard'
  tier VARCHAR,                         -- 'S' | 'A' | 'B' | 'C'
  win_rate DECIMAL(5,4),               -- 0.0000 – 1.0000
  avg_placement DECIMAL(4,2),
  pick_rate DECIMAL(5,4),
  sample_size INTEGER,                  -- số trận dùng để tính
  comp_units JSONB,                     -- [{unit_id, items[], star}]
  best_augments JSONB,                  -- [{augment_id, win_rate}]
  positioning JSONB,                    -- [{unit_id, hex_position}]
  status VARCHAR DEFAULT 'draft',       -- 'draft' | 'live'
  approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Win rate từng tướng trong patch
champion_stats (
  id UUID PRIMARY KEY,
  patch_version VARCHAR NOT NULL,
  champion_id VARCHAR NOT NULL,
  avg_placement DECIMAL(4,2),
  win_rate DECIMAL(5,4),
  pick_rate DECIMAL(5,4),
  best_items JSONB,                     -- [{item_combo[], win_rate}]
  best_traits JSONB,
  sample_size INTEGER
)

-- Giáo án người dùng tự tạo
guides (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR NOT NULL,
  description TEXT,
  comp_data JSONB,                      -- full board state: units, items, augments
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

-- Cache match history đã fetch (tránh gọi Riot API lặp)
match_cache (
  match_id VARCHAR PRIMARY KEY,
  raw_data JSONB NOT NULL,
  fetched_at TIMESTAMP DEFAULT NOW()
)

-- Bảng counter cho Matchup Coach theo patch
comp_counters (
  id UUID PRIMARY KEY,
  patch_version VARCHAR NOT NULL,
  comp_id VARCHAR NOT NULL,
  enemy_comp_id VARCHAR NOT NULL,
  result VARCHAR NOT NULL,              -- 'win' | 'lose' | 'neutral'
  notes TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(patch_version, comp_id, enemy_comp_id)
)

-- Idempotency log cho webhook payment
processed_webhooks (
  id UUID PRIMARY KEY,
  provider VARCHAR NOT NULL,            -- 'payos'
  event_key VARCHAR UNIQUE NOT NULL,
  received_at TIMESTAMP DEFAULT NOW()
)

```

#### Redis keys:

```
quota:{user_id}:{feature}:{YYYY-WW}     → integer (weekly count), TTL 8 ngày
quota:{user_id}:{feature}:{YYYY-MM-DD}  → integer (daily count), TTL 2 ngày
session_revoked_after:{user_id}         → unix timestamp, TTL = 30 ngày
riot_summoner:{region}:{summonerName}   → PUUID JSON, TTL 1 giờ
meta:current_patch                      → patch_version string, TTL 1 giờ

```

---

### 5.4. API Endpoints (Backend REST)

Tất cả endpoint đều có prefix `/api/v1`. Authentication dùng Firebase ID token (Bearer) verify qua Firebase Admin SDK; backend không phát hành JWT nội bộ.

#### Auth:

```
POST /api/v1/auth/sync-profile  body: {ingame_name} (optional) → upsert user profile theo firebase_uid
POST /api/v1/auth/logout        header: Bearer token (thu hồi refresh token + set session_revoked_after)
GET  /api/v1/auth/me            → {user object với tier}

```

#### Meta Library (Public — không cần auth):

```
GET /api/v1/meta/comps?patch=latest&tier=S,A     → danh sách comp với stats
GET /api/v1/meta/comps/:compId                   → chi tiết 1 comp (hex grid, items, augments)
GET /api/v1/meta/champions?sort=win_rate&dir=desc → bảng tướng
GET /api/v1/meta/champions/:championId           → chi tiết tướng + best items
GET /api/v1/meta/traits                          → danh sách tộc hệ + win rate
GET /api/v1/meta/items                           → item matrix (recipe + completed items)
GET /api/v1/meta/roll-odds                       → bảng tỉ lệ theo level (static)
GET /api/v1/meta/patch-notes                     → danh sách patch notes
GET /api/v1/meta/patch-notes/:version            → chi tiết 1 patch note theo version

```

#### Player (Cần auth — Basic trở lên):

```
GET  /api/v1/player/:riotId/profile?region=sea             → rank, LP, tier hiện tại
GET  /api/v1/player/:riotId/matches?page=1&region=sea      → 20 match gần nhất, có pagination
GET  /api/v1/player/:riotId/matches/:matchId?region=sea    → chi tiết 1 trận
GET  /api/v1/player/:riotId/lp-history?region=sea          → lịch sử LP dạng time-series cho chart

Rate limiting riêng cho nhóm `/player/*`:
- per-user: 60 req/10 phút
- per-IP: 120 req/10 phút
- khi vượt ngưỡng trả 429 + `retry_after`.

Trong đó canonical Riot ID ở domain model là `gameName#tagLine` (UTF-8 NFC). Route param dùng percent-encoding URL-safe khi truyền qua URL, không đổi ký tự `#` thành `-` trong domain model.

```

#### Combat Tools (Cần auth + quota check):

```
POST /api/v1/tools/elo-predictor
     header: Idempotency-Key (UUIDv4, bắt buộc)
     body: {current_rank, current_lp, target_rank, recent_placements[]}
     quota: basic=5/week, premium=unlimited (fair-use)

POST /api/v1/tools/post-game-analysis
     header: Idempotency-Key (UUIDv4, bắt buộc)
     body: {match_id} hoặc {riot_id} (lấy match mới nhất)
     quota: basic=2/week, premium=3/day

POST /api/v1/tools/matchup-coach
     header: Idempotency-Key (UUIDv4, bắt buộc)
     body: {enemy_comp_id}
     quota: basic=BLOCKED, premium=unlimited

Idempotency contract: TTL key 24 giờ; cùng key + cùng payload trả kết quả cũ; cùng key + khác payload trả 409.

```

#### Guides / Creator Hub (Cần auth):

```
GET    /api/v1/guides              → danh sách guide của user hiện tại
POST   /api/v1/guides              body: {title, description, comp_data}
GET    /api/v1/guides/:guideId     → chi tiết 1 guide
PUT    /api/v1/guides/:guideId     body: partial update
DELETE /api/v1/guides/:guideId
POST   /api/v1/guides/:guideId/duplicate

```

#### Subscription (Cần auth):

```
POST /api/v1/subscription/create-payment-link  → tạo checkoutUrl PayOS cho premium_monthly
GET  /api/v1/subscription/status               → {tier, expires_at, usage_this_period}
GET  /api/v1/subscription/transactions         → lịch sử thanh toán của user

```

#### Webhooks (System callback):

```
POST /api/v1/webhooks/payos                    → nhận callback thanh toán từ PayOS

```

---

### 5.5. Plan Entitlement Matrix & Quota Enforcement (Server-Side)

> **Quan trọng:** Entitlement/quota PHẢI validate ở server. Đây là nguồn sự thật duy nhất cho toàn bộ plan.

#### 5.5.1 Plan Entitlement Matrix (Single Source of Truth)

| Feature | Guest | Basic | Premium |
| --- | --- | --- | --- |
| Meta library (comps/champions/traits/items/roll-odds/patch notes) | ✅ | ✅ | ✅ |
| Player stats (`/player/*`) | ❌ | ✅ | ✅ |
| Creator Hub (guide cá nhân) | ❌ | ✅ | ✅ |
| Elo Predictor | ❌ | 5/tuần | Unlimited (fair-use soft-limit) |
| Post-Game Analysis | ❌ | 2/tuần | 3/ngày (hard cap) |
| Matchup Coach | ❌ | ❌ | Unlimited (fair-use soft-limit) |
| AI queue priority | ❌ | Standard | Priority |

#### 5.5.2 Quota Rules & Middleware

**Middleware `checkQuota(feature, period)`** chạy trước mọi endpoint có giới hạn:

```
1. Verify Firebase token, lấy user_id từ DB theo firebase_uid
2. Check entitlement: nếu tier='premium' nhưng tier_expires_at < NOW() thì reject premium feature ngay
3. Xác định limit theo matrix:
   - post_game_analysis: basic=2/week, premium=3/day
   - elo_predictor:      basic=5/week, premium=unlimited (fair-use)
   - matchup_coach:      basic=0, premium=unlimited
4. Tính period_start (đầu tuần ISO UTC hoặc ngày UTC)
5. Chạy Redis atomic script: check current count + increment trong một thao tác
6. Nếu vượt limit → trả về 429 { error: "QUOTA_EXCEEDED", reset_at: ... }
7. Nếu giữ slot thành công → cho request xử lý
8. Sau khi request thành công → upsert usage_quotas để persist
9. Nếu request fail do lỗi hệ thống sau khi đã giữ slot quota → ghi compensation record và rollback quota theo idempotency key
10. Mọi request có retry phải có idempotency key để tránh trừ quota lặp khi mạng lỗi/timeout
```

**Reset logic:** Period `weekly` tính từ thứ Hai đầu tuần theo UTC (ISO week). Không reset lúc nửa đêm theo giờ địa phương để tránh timezone bug.

**Hiển thị UI:** Frontend hiển thị `reset_at` theo local timezone của user nhưng phải ghi rõ nhãn “quota tính theo UTC” để tránh hiểu nhầm.

**Fair-use cho Premium (AI tools):**
- Elo Predictor: soft-limit 120 requests/ngày/user.
- Matchup Coach: soft-limit 60 requests/ngày/user.
- Có anti-automation + rate-limit theo IP/user; vượt soft-limit trả 429 và reset theo UTC 00:00.

---

### 5.6. Logic AI Cho Từng Tính Năng

**Nguyên tắc thiết kế:** Tối thiểu hóa LLM call. Chỉ dùng LLM để sinh ngôn ngữ tự nhiên (lời khuyên, giải thích). Mọi tính toán số (điểm, rank, counter) đều dùng rule/heuristic thuần. Cache kết quả LLM theo input pattern để giảm chi phí.

#### Elo Predictor — Thuần heuristic, không cần LLM:

```
Input: current_rank, current_lp, target_rank, recent_placements[]

1. Tính MMR estimate:
   base_mmr = rank_to_mmr_table[current_rank] + current_lp * 0.8
   performance_delta = avg(placements) so sánh với expected avg (4.5)
   estimated_mmr = base_mmr + performance_delta * 15

2. Tính LP gain/loss trung bình:
   avg_placement = mean(recent_placements)
   lp_per_game = placement_to_lp_table[round(avg_placement)]
   -- Top1=+35, Top2=+25, Top3=+15, Top4=+5, Bot4 âm dần

3. Tính số game cần thiết:
   lp_needed = mmr_to_lp_table[target_rank] - estimated_mmr
   games_needed = ceil(lp_needed / lp_per_game)

4. Sinh lời khuyên dựa trên rule:
   if avg_placement > 5.0 → "Cần cải thiện early game, tránh để máu xuống thấp trước Stage 3"
   if avg_placement between 4.0 and 5.0 → "Đang ở ngưỡng hòa vốn, cần push top3 nhiều hơn"
   if avg_placement < 4.0 → "Đang có phong độ tốt, duy trì consistency"
   -- Không gọi LLM, lời khuyên là template cố định

```

#### Matchup Coach — Rule-based + optional LLM cho text:

```
Input: enemy_comp_id

1. Query DB: lấy meta_snapshot của enemy_comp
   → traits[], core_units[], positioning

2. Lookup counter_table (được build thủ công + cập nhật theo patch):
   counter_table[comp_id] = {
     hard_counters: [comp_id_A, comp_id_B],   -- bài thắng >60% vs enemy
     soft_counters: [comp_id_C],
     loses_to: [comp_id_D, comp_id_E]
   }

3. Tìm điểm yếu cốt lõi dựa trên traits:
   weakness_rules = {
     "high_cost_dependent": "Bài cần tướng 5g → dễ bị thiếu tướng nếu có người cùng bài",
     "front_heavy": "Cần damage burst để xuyên qua lượt đầu",
     "low_range": "Kéo dài trận → đặt tướng xa để giảm sát thương nhận",
     ...
   }

4. (Tùy chọn) Gọi LLM với prompt ngắn nếu cần lời khuyên chi tiết hơn:
   prompt = "TFT patch {version}. Enemy runs {comp_name} với core {units}.
             Đây là điểm yếu đã phân tích: {weakness}.
             Viết 2–3 câu lời khuyên ngắn gọn bằng tiếng Việt cho người chơi."
   → Cache response theo key: matchup:{enemy_comp_id}:{patch_version}
   → TTL cache: đến hết patch (reset khi patch mới)

```

#### Post-Game Analysis — Scoring algorithm + LLM cho giải thích:

```
Input: match_id

1. Fetch match data từ match_cache hoặc Riot API
2. Extract player's data trong match (lọc theo PUUID)

3. Tính điểm từng category (thang điểm A–F):

   ECONOMY SCORE:
   - Round 4-2: nếu gold > 50 và hp < 40 → trừ điểm (giữ vàng không cần thiết)
   - Streak bonus: nhận đúng streak bonus ở các mốc hay không
   - Interest gold: có maximize interest (0/10/20/30/40/50g) không

   ITEMIZATION SCORE:
   - Core items đúng với comp đang chơi (lookup item_priority[comp][unit])
   - Có giữ component quá lâu không (còn component ở Stage 4 → trừ điểm)
   - Completed items sai tướng (trang bị AP trên carry AD) → trừ điểm nặng

   AUGMENT SCORE:
   - Augment chọn có win_rate > median của comp đó không
   - Tính từ best_augments trong meta_snapshots

   PLACEMENT SCORE:
   - Top1=A+, Top2=A, Top3=B+, Top4=B, Top5=C+, Top6=C, Bot=D

4. Gọi LLM để sinh giải thích cụ thể:
   prompt = "Match data: {parsed_match_json}.
             Scores: Economy={score}, Items={score}, Augments={score}.
             Tìm 2–3 quyết định cụ thể trong match này dẫn đến điểm thấp.
             Viết ngắn gọn, actionable, bằng tiếng Việt."
   → Cache KHÔNG được dùng ở đây (mỗi match là unique)
   → Gọi LLM mỗi lần user request → đây là lý do feature bị giới hạn quota

```

---

### 5.6.1. Kiến Trúc Dữ Liệu Polyglot (PostgreSQL + Redis + OpenSearch)

**Mục tiêu:** Giữ tính đúng đắn dữ liệu bằng PostgreSQL, giảm tải query nặng bằng OpenSearch (phase rollout), và tối ưu hot path bằng Redis.

**Phân vai dữ liệu:**

- **PostgreSQL (source of truth):** users, payment_transactions, entitlement_ledger, usage_quotas, guides, meta_snapshots, champion_stats, comp_counters.
- **Redis (hot cache/counter):** quota counters, session revoke markers, Riot short cache, LLM cache.
- **OpenSearch (read model):** dữ liệu phục vụ search/filter/sort nặng cho web.

**Index OpenSearch đề xuất:**

1. `meta_comps_v1`
   - Trường chính: `patch_version`, `comp_id`, `comp_name`, `tier`, `traits`, `win_rate`, `pick_rate`, `avg_placement`, `sample_size`
   - Use case: filter theo patch/tier/traits, sort theo win_rate/pick_rate.

2. `champion_stats_v1`
   - Trường chính: `patch_version`, `champion_id`, `champion_name`, `win_rate`, `pick_rate`, `avg_placement`, `best_items`
   - Use case: bảng champion stats sort/filter tốc độ cao.

3. `patch_notes_v1`
   - Trường chính: `version`, `title`, `content`, `highlights`, `publishedAt`
   - Use case: full-text search patch notes.

4. `public_guides_v1` (optional)
   - Trường chính: `guide_id`, `title`, `description`, `traits`, `units`, `created_at`
   - Use case: tìm guide public nhanh theo từ khóa/tộc hệ.

**Luồng đồng bộ PostgreSQL → OpenSearch:**

- Mọi thay đổi dữ liệu liên quan search tạo event sync (`upsert`/`delete`) qua queue (BullMQ).
- Worker sync đọc event và ghi OpenSearch bằng idempotent key (`entity_type:entity_id:version`).
- Lỗi sync áp dụng exponential backoff; quá ngưỡng retry đẩy vào dead-letter queue.
- Có cron `nightly_reindex` để đối soát và rebuild index từ PostgreSQL khi cần.

**Nguyên tắc vận hành:**

- API nghiệp vụ quan trọng (auth, quota, payment) không phụ thuộc OpenSearch.
- Khi OpenSearch lỗi, endpoint search trả degraded response hoặc fallback query nhẹ từ PostgreSQL.
- Mapping index được version hóa (`*_v1`, `*_v2`) để reindex không downtime.

### 5.6.2. OpenSearch Index Mapping Tối Thiểu (v1)

**Quy ước chung:**

- Tên index vật lý có version: `metascope_meta_comps_v1`, `metascope_champion_stats_v1`, `metascope_patch_notes_v1`, `metascope_public_guides_v1`.
- API chỉ query qua alias ổn định: `metascope_meta_comps_current`, `metascope_champion_stats_current`, `metascope_patch_notes_current`, `metascope_public_guides_current`.
- Khi nâng mapping: tạo `*_v2` -> reindex -> swap alias atomically.
- Cấm query trực tiếp physical index trong code ứng dụng production.

**Settings baseline (áp dụng cho mọi index):**

```json
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "refresh_interval": "5s"
  }
}
```

> Với mô hình 1 VPS, mặc định shard=1, replica=0 để tiết kiệm tài nguyên. Khi scale nhiều node mới tăng replicas.

#### A) `meta_comps_v1`

```json
{
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "id": { "type": "keyword" },
      "patch_version": { "type": "keyword" },
      "comp_id": { "type": "keyword" },
      "comp_name": {
        "type": "text",
        "fields": { "keyword": { "type": "keyword" } }
      },
      "tier": { "type": "keyword" },
      "traits": { "type": "keyword" },
      "win_rate": { "type": "float" },
      "pick_rate": { "type": "float" },
      "avg_placement": { "type": "float" },
      "sample_size": { "type": "integer" },
      "updated_at": { "type": "date" }
    }
  }
}
```

Use case: filter theo `patch_version`, `tier`, `traits`; sort theo `win_rate`, `pick_rate`.

#### B) `champion_stats_v1`

```json
{
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "id": { "type": "keyword" },
      "patch_version": { "type": "keyword" },
      "champion_id": { "type": "keyword" },
      "champion_name": {
        "type": "text",
        "fields": { "keyword": { "type": "keyword" } }
      },
      "win_rate": { "type": "float" },
      "pick_rate": { "type": "float" },
      "avg_placement": { "type": "float" },
      "sample_size": { "type": "integer" },
      "best_items": { "type": "keyword" },
      "best_traits": { "type": "keyword" },
      "updated_at": { "type": "date" }
    }
  }
}
```

Use case: data table champion, filter/sort nhanh theo chỉ số.

#### C) `patch_notes_v1`

```json
{
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "id": { "type": "keyword" },
      "version": { "type": "keyword" },
      "title": {
        "type": "text",
        "fields": { "keyword": { "type": "keyword" } }
      },
      "content": { "type": "text" },
      "highlights": { "type": "text" },
      "is_published": { "type": "boolean" },
      "published_at": { "type": "date" }
    }
  }
}
```

Use case: full-text search patch notes theo từ khóa phiên bản/nội dung.

#### D) `public_guides_v1` (optional)

```json
{
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "guide_id": { "type": "keyword" },
      "title": {
        "type": "text",
        "fields": { "keyword": { "type": "keyword" } }
      },
      "description": { "type": "text" },
      "traits": { "type": "keyword" },
      "units": { "type": "keyword" },
      "created_at": { "type": "date" }
    }
  }
}
```

Use case: search guide public theo từ khóa + traits/units.

**Chuẩn truy vấn API (để tránh query nặng):**

- Bắt buộc pagination (`from/size` hoặc `search_after`), `size` tối đa 50.
- Chỉ cho phép sort theo whitelist fields (win_rate, pick_rate, avg_placement, published_at).
- Không dùng wildcard đầu chuỗi trên field text ở production.

### 5.7. Cấu Trúc Thư Mục Backend (Đề Xuất)

```
/backend
  /src
    /config
      database.ts        -- PostgreSQL connection pool
      redis.ts           -- Redis client
      riot-api.ts        -- Axios instance với rate limiter
      constants.ts       -- Quota limits, rank tables, LP tables
    /middleware
      auth.ts            -- JWT verify, gắn user vào request
      checkQuota.ts      -- Quota enforcement middleware
      rateLimiter.ts     -- Global IP-based rate limit (chống abuse)
    /modules
      /auth              -- sync-profile, logout, me controllers
      /meta              -- serve tier list, champion stats từ DB
      /player            -- profile, match history (proxy Riot API + cache)
      /tools
        elo-predictor.ts -- heuristic calculation
        matchup-coach.ts -- rule lookup + LLM call
        post-game.ts     -- scoring algorithm + LLM call
      /guides            -- CRUD cho user guides
      /subscription      -- tier management
    /jobs
      meta-crawler.ts    -- cronjob crawl match data từ top ladder
      meta-aggregator.ts -- tính win rate từ raw match data
      patch-checker.ts   -- detect patch mới, trigger full crawl
    /services
      riot.service.ts    -- wrapper Riot API với retry + cache
      llm.service.ts     -- wrapper LLM API với cache layer
      quota.service.ts   -- đọc/ghi quota (Redis + PostgreSQL)
  /scripts
    seed-meta.ts         -- chạy tay để seed data cho patch mới

```

---

### 5.8. Các Quy Tắc Quan Trọng Cho AI/Developer

> Đây là danh sách các nguyên tắc không được vi phạm khi implement:

1. **Không bao giờ gọi Riot API từ client.** Mọi request phải đi qua BE server để giữ API key bí mật và tập trung rate limit.
2. **Quota enforce ở server, không phải frontend.** Frontend có thể ẩn button, nhưng server phải trả 429 khi vượt quota. Không tin tưởng bất kỳ giá trị nào từ client về tier hay usage count.
3. **Token không lưu quota hay usage.** Firebase token chỉ dùng để xác thực danh tính; entitlement (`tier`, `tier_expires_at`) và quota luôn đọc từ Redis/DB mỗi request.
4. **Tier downgrade phải atomic.** Khi subscription hết hạn (tier_expires_at < NOW()), mọi request premium phải bị reject ngay, không cần cron job chủ động downgrade. Middleware auth check `tier_expires_at` mỗi lần.
5. **Match data luôn cache lại và phải có retention TTL theo Riot ToS.** Sau khi fetch từ Riot API, lưu vào `match_cache`; khi hit cache thì không gọi API lại. TTL/retention được cấu hình bằng biến môi trường để tuân thủ policy hiện hành.
6. **LLM response cache theo pattern, không theo user.** Response của matchup-coach cho cùng 1 enemy_comp trong cùng 1 patch là như nhau cho mọi user. Cache ở server-side Redis, không phải per-user.
7. **Aggregate data phải có patch_version.** Không bao giờ overwrite meta data cũ. Lưu theo snapshot để có thể rollback và so sánh.
8. **OpenSearch chỉ là read model, không phải source of truth.** Dữ liệu nghiệp vụ chuẩn nằm ở PostgreSQL; nếu lệch dữ liệu search thì rebuild index từ PostgreSQL.
9. **Sync PostgreSQL → OpenSearch phải async + idempotent.** Dùng queue job theo event upsert/delete, có retry/backoff và dead-letter queue.
10. **KHÔNG IMPLEMENT Live Tracker.** Tính năng quét sảnh trực tiếp đã bị loại bỏ vì là "sát thủ rate limit". Mỗi lần quét tốn 7 Riot API calls đồng thời. Với giới hạn Rate Limit khắt khe của Riot, điều này sẽ làm cạn kiệt Quota, gây lỗi HTTP 429 và làm sập chéo (bottleneck) các tính năng cốt lõi quan trọng khác. Việc gỡ bỏ giúp tối ưu tài nguyên và đảm bảo High Availability.

---

