# MetaScope - Tài Liệu Đặc Tả Yêu Cầu Dự Án (PRD)

MetaScope là giải pháp tiện ích toàn diện dành cho trải nghiệm Đấu Trường Chân Lý (TFT). Hệ thống cung cấp kho dữ liệu meta realtime, các công cụ phân tích mạnh mẽ bằng AI và hệ thống huấn luyện độc quyền nhằm giúp người chơi leo rank một cách hiệu quả và tối ưu nhất.

Dưới đây là chi tiết toàn bộ cách thức hoạt động của các tính năng, luồng người dùng (user flow) và chính sách phân quyền gói cước (user plans).

---

## 1. Hệ Thống Xác Thực & Tài Khoản (Authentication Flow)

Hệ thống yêu cầu người dùng phải đăng ký/đăng nhập để truy cập vào các tính năng cá nhân hóa và các công cụ AI. Authentication source of truth là Firebase UID; email/ingame_name chỉ là thuộc tính hồ sơ.

### Luồng Đăng Nhập / Đăng Ký:
- **Truy cập:** Người dùng chưa đăng nhập nhấn vào "Trang cá nhân" hoặc truy cập các route bị khóa (vd: AI Coach, Predictor) sẽ bị điều hướng về màn hình Đăng kí/Đăng nhập (`/auth`).
- **Giao diện:** Form điền thông tin (Email, Mật khẩu, Tên Ingame) với thiết kế hiện đại, có toggle chuyển đổi giữa Đăng Nhập và Đăng Ký.
- **Xử lý:** Sau khi xác thực thành công, hệ thống lưu trạng thái đăng nhập (được cấp một bậc `userTier` mặc định là `basic`) và điều hướng người dùng quay lại trang chủ hoặc trang họ đang muốn truy cập.
- **Đăng xuất:** Nút đăng xuất nằm trong màn hình Quản lý Tài Khoản (`/user/profile`), xóa phiên đăng nhập và đưa người dùng về trạng thái Khách.

### Quản Lý Tài Khoản (User Profile):
- Hiển thị thông tin cá nhân cơ bản, hạng gói cước hiện tại (Basic / Premium).
- Nút quản lý thanh toán hoặc đường dẫn tắt nâng cấp lên Premium.

---

## 2. Phân Chi Nhánh Gói Cước (User Plans)

Hệ thống được chia làm 3 tầng trải nghiệm. Các tính năng chuyên sâu bị chặn bằng router bảo vệ (`ProtectedRoute`) dựa trên thuộc tính `userTier` của tài khoản.

### 2.1. Gói Khách Vãng Lai (Guest / Unauthenticated)
Dành cho người chưa đăng nhập.
- **Được truy cập:** Trang chủ, Thư Viện Meta (Tier List & Chi tiết đội hình), Champion/Traits/Items, Tỉ lệ Roll, Patch Notes.
- **Bị chặn:** Player stats, Creator Hub, toàn bộ AI tools.

### 2.2. Gói Tuyển Thủ (Basic - Miễn phí khi có tài khoản)
Dành cho người dùng đã đăng ký tài khoản nhưng chưa nâng cấp thanh toán.
- **Bao gồm:** Tất cả quyền hạn của Guest.
- **Công cụ cá nhân:** Được phép tạo/sửa/xóa guide cá nhân trong Creator Hub.
- **Player Stats:** Được truy cập đầy đủ các endpoint `/player/*`.
- **Công cụ AI (giới hạn):**
  - **Phân Tích AI Hậu Kỳ:** 2 lần/tuần.
  - **Dự Đoán Elo (MMR Predictor):** 5 lần/tuần.
- **Bị chặn hoàn toàn:** Matchup Coach.

### 2.3. Gói Tinh Anh (Premium / Pro)
Dành cho người dùng trả phí hàng tháng.
- **Bao gồm:** Tất cả quyền hạn của Basic.
- **Giá:** 99,000 VNĐ/tháng.
- **Đặc quyền Mở khóa:**
  - **Huấn Luyện AI (Matchup Coach):** Mở khóa đầy đủ.
  - **Dự Đoán Elo & MMR:** Không giới hạn (fair-use).
  - **Phân Tích AI Hậu Kỳ:** 3 lần/ngày.
  - **Ưu tiên xử lý AI queue:** Ưu tiên request Premium so với Basic.

> Nguồn sự thật entitlement/quota duy nhất nằm tại Section 5.5 (Plan Entitlement Matrix + Quota Rules).

---

## 3. Chi Tiết Luồng Hoạt Động Của Từng Tính Năng

### 3.1. Nhóm Thư Viện ĐTCL (Meta Data & DB)
Không yêu cầu đăng nhập đối với tính năng đọc.
* **Thư Viện Meta (Tier List & Guide Details):**
    * **Hoạt động:** Hiển thị danh sách các đội hình mạnh nhất hiện tại, lọc theo Tier S, A, B.
    * **Luồng:** Người dùng click vào 1 đội hình -> Chuyển sang màn chi tiết (Guide Details) -> Hiển thị sơ đồ lưới lục giác định vị tướng, thứ tự ưu tiên nâng cấp trang bị, lõi công nghệ cần bốc, và cách xoay bài qua các vòng (Stage 2, 3, 4).
* **Chỉ Số Tướng & Tộc Hệ (Champions / Traits):**
    * **Hoạt động:** Bảng dữ liệu (data table) cho phép sort/filter theo tỉ lệ thắng, pick rate. Bấm vào một tướng sẽ hiện Top 3 trang bị hoàn hảo nhất dành cho tướng đó.
* **Tỷ Lệ Roll & Trang Bị (Roll Odds / Items):**
    * **Hoạt động:** Công cụ Reference tĩnh. Người dùng có danh sách bảng tỷ lệ rơi khung tướng theo Level, và một thư viện Matrix chéo kết hợp các mảnh trang bị cơ bản thành trang bị hoàn chỉnh.

### 3.2. Nhóm Công Cụ Chiến Thuật & AI (Combat Tools)
Yêu cầu đăng nhập. Bị kiểm soát bởi hệ thống Quota của gói User Plan.

* **Công Cụ Dự Đoán Elo / MMR (Elo Predictor):**
    * **Mục đích:** Tính toán "sức khỏe" tài khoản (MMR) và hành trình đạt rank mong muốn.
    * **Flow:**
        1. Người dùng chọn Rank hiện tại và LP hiện tại.
        2. Chọn Rank mục tiêu.
        3. Điền kết quả top đạt được trong 5 trận đấu gần nhất (từ 1 đến 8).
        4. Bấm "Run Prediction Simulation".
    * **Kết quả:** Hệ thống chạy thuật toán (heuristic) xuất ra báo cáo: Quỹ đạo leo rank (Tốt/Xấu), Điểm LP trung bình nhận/trừ (+50/-65), Số game ước tính cần chơi để đạt mục tiêu, và Lời khuyên định hướng (Ví dụ: "Cần cải thiện def máu đầu game").

* **Huấn Luyện Viên Khắc Chế AI (Matchup Coach):** *(Premium Only)*
    * **Mục đích:** Tìm đường thắng khi gặp đội hình cụ thể của địch.
    * **Flow:**
        1. Truy cập màn hình Coach. Panel bên trái hiển thị toàn bộ meta comps đang thịnh hành.
        2. Người dùng chọn 1 Comp mà đối thủ đang chơi (vd: Mythic Bard).
        3. Bấm phân tích AI.
    * **Kết quả:**AI xử lý và trả về:
        - Điểm yếu cốt lõi của bài địch.
        - Đội hình nào của mình sẽ "Counter cứng" bài đó (Hard Counters).
        - Đội hình nào sẽ là con mồi ngon (Easy Matchups) của nó.
        - Lời khuyên xếp bài chuẩn: "Né lốc", "Né đối đầu trực tiếp với chủ lực".

* **Phân Tích Ván Đấu Có Trợ Giúp AI (Post-Game AI Analysis):**
    * **Mục đích:** Nhìn nhận sai lầm và rút kinh nghiệm trực tiếp từ trận vừa chơi.
    * **Flow:**
        1. Nhập Riot ID hoặc tự tải lịch sử trận ấn định lên.
        2. Phân tích tự động 1 trận đấu (Top 6).
    * **Kết quả:** Cung cấp Thẻ Điểm (Report Card) gồm các điểm số như: Kinh tế (B+), Flex trang bị (C-), Tối ưu Lõi (A). Ghi chú rõ lý do: "Bạn đã giữ quá nhiều tiền ở round 4-2, dẫn đến mất máu oan", "Lõi X không phù hợp với carry Y".

* **Tra Cứu Lịch Sử Đấu (Player Stats):**
    * **Flow:** Nhập Riot ID chuẩn `gameName#tagLine` + chọn `region` -> Chuyển đến trang Profile tổng quan. Hiển thị Biểu đồ leo rank dạng Spline Chart tiến trình lịch sử, liệt kê 20 match gần nhất, chi tiết đơn vị và thứ hạng.

> ### **[UPDATE] Quyết định Kiến trúc: Loại Bỏ Tính Năng "Live Tracker"**
> 
> **Lý do kỹ thuật & Thiết kế hệ thống:**
> Live Tracker (quét sảnh trực tiếp) tiềm ẩn rủi ro lớn và được xem là một "Sát thủ Rate Limit". 
> 
> * **Tiêu tốn Quota quá mức:** Mỗi lần một user kích hoạt tính năng này, backend phải thực hiện ngay lập tức ít nhất 7 requests độc lập lên Riot API để quét thông tin toàn bộ người chơi còn lại trong sảnh.
> * **Rủi ro sập chéo (Bottleneck & Domino Effect):** Với giới hạn Rate Limit cực kỳ khắt khe từ phía Riot Games (đặc biệt trong giai đoạn dùng Development Key giới hạn ở mức 20 req/s), một lượng rất nhỏ người dùng truy cập đồng thời cũng đủ để làm cạn kiệt Quota tức thời (hệ thống sẽ văng lỗi HTTP 429 Too Many Requests).
> * **Bảo vệ Core Features:** Sự cạn kiệt Quota này sẽ làm tê liệt hoàn toàn các luồng xử lý quan trọng và mang lại giá trị cốt lõi cao hơn cho dự án như *Post-Game Analysis* hay *Matchup Coach*.
> 
> Do đó, việc loại bỏ tính năng Live Tracker là một quyết định trade-off bắt buộc về mặt kiến trúc. Động thái này giúp giải phóng tài nguyên server, triệt tiêu nguy cơ nghẽn cổ chai và đảm bảo tính ổn định (High Availability) cho toàn bộ hệ thống MetaScope.

### 3.3. Nhóm Góc Sáng Tạo Của Người Chơi (Creator & Guides)
Tính năng Web App giữ chân người dùng (Retention). Yêu cầu đăng nhập.

* **Tạo Giáo Án Cá Nhân (Create Guide):**
    * **Hoạt động:** Cung cấp Canvas/Bord để người dùng tự do thêm Tướng lên bàn cờ, nhét trang bị, chọn Lõi.
    * **Flow:** Điền Tên Giáo án -> Thêm mô tả chiến thuật -> Xếp tướng -> Ấn Lưu Nháp (Save Draft).
* **Creator Hub:**
    * **Hoạt động:** Nơi chứa các giáo án đã tạo. Có chức năng Edit, Xóa, Nhân Bản. Trực quan hóa dưới dạng các thẻ (Card). Sau này có thể tích hợp chức năng tính tiền cho Creator nếu giáo án được mua (Tùy chọn tương lai).

### 3.4. Nhóm Phụ Trợ (System & Misc)
* **Patch Notes:** Liệt kê các version thay đổi Meta liên tục. Không tương tác, chủ yếu là hiển thị markdown từ CSDL.
* **Nâng Cấp Premium (Pricing / Subscription):** Màn hình hiển thị bảng so sánh tính năng giữa các gói (Basic vs Premium) theo dạng Checklist rõ ràng. Có nút Call-to-action cực mạnh để Up tier (giả lập thanh toán và chuyển trạng thái).

---

## 4. Giao Diện & Điều Hướng (UI/UX Routing)

- **Layout Toàn Cục:** Thiết kế Modern Dark Theme kết hợp hiệu ứng kính (Glassmorphism), màu sắc chủ đạo là Xanh Tím thẫm (Indigo/Slate).
- **Navigation (Thanh điều hướng):** - Giao diện Desktop hiển thị Sidebar cố định bên trái, chia phân nhánh rõ ràng các cụm tính năng.
  - Giao diện Mobile sử dụng Hamburger Menu có slide từ trái qua.
- **Bảo Vệ Đường Dẫn (Router Protection):**
  Hệ thống sử dụng component `<ProtectedRoute>` bọc ngoài các tính năng cấp cao. Nếu URL truy xuất không hợp lệ với quyền hiện tại, sẽ tự động bật cảnh báo (Toast) và Redirect thẳng về màn `/pricing` (Nâng cấp) hoặc màn Login.

---

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

## 6. Công Nghệ Sử Dụng (Tech Stack)

> Toàn bộ project dùng **TypeScript** cho cả FE lẫn BE để share type definitions, giảm mismatch data shape giữa các tầng. Monorepo quản lý bằng Turborepo.

---

### 6.1. Tổng Quan Stack

| Layer | Công nghệ | Lý do |
| --- | --- | --- |
| Frontend | React 18 + TypeScript + Vite | Ecosystem mạnh cho data-heavy UI, build nhanh |
| Styling | Tailwind CSS + Shadcn/ui | Tốc độ build UI, dark theme glassmorphism dễ implement |
| Server state | TanStack Query | Cache, refetch tự động, tách biệt server/client state |
| Client state | Zustand | Nhẹ, đủ dùng cho auth state + UI state |
| Routing (FE) | TanStack Router | Type-safe params, tích hợp tốt với TanStack Query |
| Backend | NestJS + TypeScript | Structure rõ ràng (module/controller/service/guard), built-in DI |
| Authentication | Firebase Auth | Setup nhanh, hỗ trợ Google login, JWT verify qua Firebase Admin SDK (sync-profile phải xử lý trường hợp provider không trả email bằng fallback UID-based profile) |
| Database (Source of Truth) | Supabase (PostgreSQL) | ACID cho dữ liệu nghiệp vụ/transaction, tự generate TypeScript types |
| Cache + Queue | Upstash Redis + BullMQ | Managed Redis, quota tracking, hot cache, job queue cho crawler/sync |
| Search / Read-heavy queries | OpenSearch | Phục vụ truy vấn/filter/search nặng cho meta data, không dùng làm transactional DB. Code chỉ query alias `metascope_*_current`. |
| Monorepo | Turborepo | Share types giữa FE/BE, build cache tự động |
| CMS content | Payload CMS | TypeScript native, self-hosted trên Supabase, admin UI tự generate |
| Admin panel | React Admin | Build admin UI nhanh, connect thẳng Supabase REST |

---

### 6.2. Frontend Chi Tiết

```
React 18 + TypeScript
Vite                    ← build tool
TanStack Router         ← routing với type-safe route params
TanStack Query          ← server state, cache, background refetch
Zustand                 ← client state (auth, UI toggles)
Tailwind CSS            ← utility-first styling
Shadcn/ui               ← component base (copy vào project, không lock-in)
Recharts                ← LP history chart, win rate visualization
Firebase SDK (client)   ← Auth (login, register, Google OAuth)
NestJS API client       ← mọi dữ liệu nghiệp vụ/public đều đi qua /api/v1 để thống nhất auth, cache, observability

```

**Nguyên tắc data fetching:**

* Public data (tier list, champion stats, patch notes) → gọi qua NestJS API `/api/v1/meta/*` để thống nhất cache/versioning/monitoring
* Protected data + quota-sensitive (tools AI, player stats) → bắt buộc qua NestJS API để enforce auth, entitlement và quota

---

### 6.3. Backend Chi Tiết

```
Node.js 20 LTS + TypeScript
NestJS                  ← framework chính
  Guards                ← Firebase JWT verify + role check
  Interceptors          ← logging, response transform
  Pipes                 ← Zod validation cho request body
Supabase JS / pg        ← query PostgreSQL
Firebase Admin SDK      ← verify Firebase JWT, set custom claims (role)
BullMQ                  ← job queue cho meta crawler
Axios + bottleneck      ← Riot API client với rate limiter (tránh 429)
Upstash Redis           ← quota counter, LLM cache, session cache
node-cron               ← schedule crawl job (chạy sau patch mới)
Zod                     ← validate và type-safe toàn bộ request/response

```

**Guards trong NestJS cho MetaScope:**

```typescript
// 3 guards xếp chồng theo thứ tự:
@UseGuards(FirebaseAuthGuard)    // 1. Verify Firebase JWT → gắn user vào request
@UseGuards(TierGuard('premium')) // 2. Check userTier trong DB
@UseGuards(QuotaGuard('post_game_analysis', 'weekly', 1)) // 3. Check + increment quota
async postGameAnalysis(@Body() dto: AnalysisDto) { ... }

```

---

### 6.4. Database & Infrastructure

```
Supabase (PostgreSQL)
  ├── Tất cả bảng nghiệp vụ (xem schema Section 5.3)
  ├── Row Level Security (RLS) bật cho bảng users, guides, usage_quotas
  └── Supabase tự generate TypeScript types → import dùng ngay

Firebase
  ├── Authentication (email/password + Google OAuth)
  └── Custom Claims: { role: 'admin' | 'analyst' | 'editor' | 'user' }

Redis (TCP-compatible với BullMQ; ưu tiên Redis service chạy cùng VPS hoặc managed TCP)
  ├── Quota counters (daily + weekly)
  ├── LLM response cache (matchup coach theo patch)
  ├── Riot API response cache (summoner lookup, 1h TTL)
  └── BullMQ job queue backend

OpenSearch
  ├── index `meta_comps` (tier list/query theo patch, tier, traits, comp)
  ├── index `champion_stats` (search/sort/filter theo win_rate, pick_rate)
  ├── index `patch_notes` (full-text search)
  └── (optional) index `public_guides` cho guide public

Cloudflare R2 (hoặc Firebase Storage)
  └── Static game assets: icon tướng, splash art, icon tộc hệ từ CommunityDragon

```

---

### 6.5. Cấu Trúc Monorepo (Turborepo)

```
/metascope
  /apps
    /web              ← React FE (user facing, port 3000)
    /api              ← NestJS backend (port 4000)
    /worker           ← crawler + aggregator jobs (chạy độc lập)
    /cms              ← Payload CMS (content tĩnh, port 3001)
    /admin            ← React Admin panel (game data, port 3002)
  /packages
    /types            ← shared TypeScript types dùng chung toàn monorepo
    /utils            ← shared helpers (rank calc, LP table, riot api types)
    /eslint-config    ← ESLint config chung
    /tsconfig         ← TypeScript config base
  turbo.json          ← Turborepo pipeline config
  package.json        ← workspace root

```

**Package `/packages/types` export những gì:**

```typescript
// Riot API types (match object, summoner, rank entry)
export type RiotMatchDto = { ... }
export type RiotSummonerDto = { ... }

// DB types (auto-generated từ Supabase + extend thêm)
export type MetaSnapshot = Database['public']['Tables']['meta_snapshots']['Row']
export type Guide = Database['public']['Tables']['guides']['Row']

// Shared enums
export type UserTier = 'guest' | 'basic' | 'premium'
export type CompTier = 'S' | 'A' | 'B' | 'C'
export type QuotaFeature = 'post_game_analysis' | 'elo_predictor' | 'matchup_coach'

```

**Turborepo pipeline (`turbo.json`):**

```json
{
  "pipeline": {
    "dev": { "cache": false, "persistent": true },
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "type-check": { "dependsOn": ["^build"] }
  }
}

```

Chạy toàn bộ hệ thống: `turbo dev` → khởi động web, api, cms, admin cùng lúc.

---

## 7. Hệ Thống CMS & Admin Panel

> MetaScope cần 2 tool quản lý nội bộ riêng biệt vì có 2 loại data với nhu cầu khác nhau. Cả 2 đều dùng chung Firebase Auth và phân quyền qua Custom Claims.

---

### 7.1. Phân Loại Nội Dung Cần Quản Lý

| Loại | Ví dụ | Tool phù hợp |
| --- | --- | --- |
| Content tĩnh, người không kỹ thuật edit | Patch notes, announcements, mô tả gói cước | Payload CMS |
| Game data, thay đổi theo patch | Tier list, hex grid, counter table | React Admin Panel |

---

### 7.2. Payload CMS — Quản Lý Content Tĩnh

**Vị trí:** `/apps/cms` — chạy tại `localhost:3001/admin` (production: `cms.metascope.gg/admin`)

**Lý do chọn Payload thay vì Strapi / Sanity / Contentful:**

* TypeScript native — cùng ngôn ngữ toàn project, schema định nghĩa bằng code, version control được
* Self-hosted, data nằm trong Supabase PostgreSQL — không vendor lock-in, không tốn thêm tiền DB
* Admin UI tự generate từ schema — không cần build UI quản lý
* Không phải SaaS — không có bill theo usage như Contentful

**Collections được quản lý trong Payload:**

```typescript
// 1. Patch Notes
PatchNotes: {
  version: string          // '14.10'
  title: string            // 'Patch 14.10 — Cân bằng hệ Mythic'
  content: richText        // Block editor (bold, image, list...)
  highlights: array        // Mảng string: tóm tắt thay đổi lớn
  publishedAt: date
  isPublished: boolean     // Draft / Published
}

// 2. Announcements (banner thông báo trên web)
Announcements: {
  message: string
  type: 'info' | 'warning' | 'maintenance'
  isActive: boolean
  expiresAt: date          // Tự ẩn sau ngày này
}

// 3. Pricing Content (text mô tả gói cước, thay đổi không cần deploy)
PricingContent: {
  basicFeatures: array     // Danh sách tính năng Basic để hiển thị
  premiumFeatures: array   // Danh sách tính năng Premium
  priceMonthly: number
  priceTagline: string     // 'Giá tốt nhất cho leo rank'
}

```

**Phân quyền Payload:**

```typescript
// Chỉ user có Firebase custom claim role='admin' hoặc role='editor' mới vào được
access: {
  read: () => true,              // Public read (FE fetch patch notes)
  create: isAdminOrEditor,
  update: isAdminOrEditor,
  delete: isAdminOnly,
}

```

**Luồng data từ Payload đến FE:**

```
Editor viết Patch Note trong Payload CMS
  → Payload lưu vào Supabase (bảng patch_notes)
  → FE gọi NestJS API: GET /api/v1/meta/patch-notes
  → API đọc DB + cache rồi trả về cho FE

```

---

### 7.3. React Admin Panel — Quản Lý Game Data

**Vị trí:** `/apps/admin` — chạy tại `localhost:3002` (production: `admin.metascope.gg`)

**Lý do dùng React Admin (marmelab):** Framework build admin UI nhanh, có sẵn DataGrid, Form, Filter — connect thẳng vào Supabase REST API qua Data Provider. Không cần build từ đầu.

**Màn hình 1 — Comp Manager (quan trọng nhất):**

Workflow sau mỗi patch:

1. Crawler chạy xong, các comp được classify tự động nhưng chưa hiển thị (status = `draft`)
2. Analyst vào Comp Manager, xem aggregate stats (avg placement, pick rate, sample size)
3. Gán Tier S/A/B/C cho từng comp
4. Chỉnh positioning: kéo thả icon tướng lên hex grid 4×7 (custom React component trong admin)
5. Bấm Approve → status = `live` → comp xuất hiện trên web

```
┌─────────────────────────────────────────────────────────────┐
│ Comp Manager — Patch 14.10          [Filter: Draft | Live]  │
├────────────┬──────────────┬──────────┬────────┬────────────┤
│ Comp       │ Avg Place    │ Sample   │ Tier   │ Status     │
├────────────┼──────────────┼──────────┼────────┼────────────┤
│ Mythic Bard│ 3.2  ████░░ │ 1,240    │ [S ▾] │ ✓ Live     │
├────────────┼──────────────┼──────────┼────────┼────────────┤
│ Dragon Soul│ 4.1  ███░░░ │ 890      │ [A ▾] │ ○ Draft    │
├────────────┼──────────────┼──────────┼────────┼────────────┤
│ Bruiser    │ 4.8  ██░░░░ │ 340      │ [B ▾] │ ○ Draft    │
│ Frontline  │              │ ⚠ Low   │       │            │
└────────────┴──────────────┴──────────┴────────┴────────────┘
[Edit Positioning]  [Approve Selected]  [Publish All Approved]

```

> Comp có sample size < 200 hiển thị cảnh báo ⚠ Low — analyst cần thận trọng khi set tier.

**Màn hình 2 — Counter Table Editor:**

Grid N×N các comp. Analyst click vào ô để set quan hệ. Data này feed trực tiếp vào Matchup Coach.

```
           │ Mythic │ Dragon │ Bruiser│ ...
───────────┼────────┼────────┼────────┤
Mythic Bard│   —    │  WIN   │  LOSE  │
Dragon Soul│  LOSE  │   —    │  WIN   │
Bruiser    │  WIN   │  LOSE  │   —    │

```

Lưu vào bảng `comp_counters (comp_id, enemy_comp_id, result: 'win'|'lose'|'neutral', notes)`.

**Màn hình 3 — User Management:**

Query thẳng Supabase bảng `users`. Cho phép admin:

* Tìm kiếm user theo email / ingame name
* Xem tier hiện tại + usage quota trong kỳ
* Đổi tier thủ công (hỗ trợ khách hàng)
* Ban/unban tài khoản (set `is_banned = true`)

**Màn hình 4 — Crawler Monitor:**

Xem trạng thái các job BullMQ:

* Job đang chạy / queue / failed
* Số match đã crawl trong session hiện tại
* Log lỗi nếu Riot API trả về 429 hoặc timeout
* Nút trigger crawl thủ công (dùng khi patch mới ra mà chưa đến schedule)

---

### 7.4. Phân Quyền Toàn Hệ Thống (Role Matrix)

Dùng Firebase Custom Claims để phân quyền. Set khi tạo tài khoản internal:

```typescript
// NestJS endpoint — chỉ superadmin mới gọi được
await firebaseAdmin.auth().setCustomUserClaims(uid, { role: 'analyst' })

```

| Role | Web App | Payload CMS | React Admin |
| --- | --- | --- | --- |
| `user` | ✅ Đầy đủ theo tier | ❌ | ❌ |
| `editor` | ✅ | ✅ Viết/sửa content | ❌ |
| `analyst` | ✅ | ❌ | ✅ Comp Manager + Counter Table |
| `admin` | ✅ | ✅ Toàn quyền | ✅ Toàn quyền |

---

### 7.5. Quy Tắc Cho CMS & Admin

1. **Không có record nào xuất hiện trên web nếu chưa được approve.** Mọi comp sau crawl đều có `status = 'draft'` mặc định. Web FE chỉ query `WHERE status = 'live' AND approved = true`.
2. **Admin panel không tự tính win rate.** Win rate là output của pipeline aggregate (Section 5.2). Admin chỉ được phép gán Tier và approve — không sửa số liệu thô.
3. **Payload CMS và React Admin dùng chung Firebase Auth.** Không có hệ thống login riêng. Mọi truy cập đều verify Firebase JWT và check custom claim `role`.
4. **Counter table do người set, không do AI.** Matchup Coach dùng data từ bảng `comp_counters` — bảng này do analyst nhập tay trong React Admin, không auto-generate. Đây là lý do cần analyst cập nhật sau mỗi patch lớn.
5. **Crawler Monitor chỉ xem, không sửa.** Màn hình monitor trong React Admin chỉ có quyền đọc job status và trigger run — không được phép xóa job hoặc sửa data trong queue.

---

## 8. Route Map

> Bảng đầy đủ toàn bộ URL của hệ thống. Mọi route không có trong bảng này đều không được implement. Developer không được tự đặt URL ngoài danh sách này mà không cập nhật tài liệu.

### 8.1. Web App (`web` — user facing)

| Route | Tên màn hình | Auth yêu cầu | Ghi chú |
| --- | --- | --- | --- |
| `/` | Trang chủ | Guest | Landing page, giới thiệu tính năng |
| `/auth` | Đăng nhập / Đăng ký | Guest only | Redirect về `/` nếu đã login |
| `/meta/comps` | Thư viện Tier List | Guest | Danh sách comp, filter S/A/B |
| `/meta/comps/:compId` | Chi tiết đội hình | Guest | Hex grid, items, augments |
| `/meta/champions` | Chỉ số Tướng | Guest | Bảng sort/filter |
| `/meta/champions/:championId` | Chi tiết Tướng | Guest | Stats + best items |
| `/meta/traits` | Tộc hệ | Guest | [placeholder — cần xác nhận] |
| `/meta/items` | Trang bị & Recipe | Guest | Item matrix |
| `/meta/roll-odds` | Tỉ lệ Roll | Guest | Bảng static theo level |
| `/patch-notes` | Patch Notes | Guest | Danh sách |
| `/patch-notes/:version` | Chi tiết Patch | Guest | Rich text từ CMS |
| `/pricing` | Nâng cấp Premium | Guest | Bảng so sánh + CTA |
| `/payment/success` | Thanh toán thành công | Basic | Hiển thị trạng thái chờ webhook xác nhận |
| `/payment/cancel` | Thanh toán bị hủy | Guest/Basic | Cho phép tạo link thanh toán lại |
| `/player/:riotId` | Hồ sơ người chơi | Basic | Profile + LP chart |
| `/player/:riotId/matches` | Lịch sử đấu | Basic | 20 match gần nhất |
| `/player/:riotId/matches/:matchId` | Chi tiết trận | Basic | Trả về board state theo round, items, augments, placement, damage timeline |
| `/tools/elo-predictor` | Dự đoán Elo | Basic | Form + kết quả |
| `/tools/post-game-analysis` | Phân tích hậu kỳ | Basic | Nhập match ID hoặc Riot ID |
| `/tools/matchup-coach` | Matchup Coach | Premium | Bị chặn với Basic |
| `/guides` | Creator Hub | Basic | Danh sách guide của user |
| `/guides/create` | Tạo giáo án | Basic | Canvas editor |
| `/guides/:guideId/edit` | Sửa giáo án | Basic | Chỉ owner |
| `/user/profile` | Trang cá nhân | Basic | Thông tin + tier |
| `/user/subscription` | Quản lý gói cước | Basic | Lịch sử thanh toán |
| `*` | 404 Not Found | - | Redirect về `/` sau 3s |

### 8.2. Admin Panel (`admin`)

| Route | Màn hình | Role yêu cầu |
| --- | --- | --- |
| `/` | Dashboard tổng quan | analyst, admin |
| `/comps` | Comp Manager | analyst, admin |
| `/comps/:compId` | Edit comp + hex grid | analyst, admin |
| `/counters` | Counter Table Editor | analyst, admin |
| `/users` | User Management | admin |
| `/crawler` | Crawler Monitor | admin |

### 8.3. CMS (`cms` — Payload)

Payload tự generate routes tại `/admin/*`. Không cần định nghĩa thêm.

---

## 9. Môi Trường & Deployment

> Các giá trị môi trường dưới đây là chuẩn triển khai production hiện tại. Developer không được hardcode các giá trị bí mật vào source code.

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

## 10. Thanh Toán (PayOS Integration)

> MetaScope dùng **PayOS** làm cổng thanh toán — hỗ trợ chuyển khoản ngân hàng Napas 24/7 qua VietQR, phù hợp thị trường Việt Nam. Docs chính thức: https://payos.vn/docs/

### 10.1. Thông Tin Gói Cước

| Thông tin | Giá trị |
| --- | --- |
| Tên gói | Premium / Tinh Anh |
| Giá tháng | 99,000 VNĐ/tháng |
| Chu kỳ billing | Hàng tháng |
| Trial period | Không áp dụng |
| Hoàn tiền | Hoàn tiền trong 24 giờ nếu giao dịch thành công nhưng entitlement Premium không được cấp đúng do lỗi hệ thống |

### 10.2. Luồng Thanh Toán (Payment Flow)

PayOS hoạt động theo mô hình tạo link thanh toán một lần — không phải recurring billing tự động. Subscription hàng tháng cần user chủ động gia hạn hoặc có flow nhắc nhở.

```
1. User click "Nâng cấp Premium" trên /pricing

2. FE gọi POST /api/v1/subscription/create-payment-link
   body: { planType: 'premium_monthly' }
   (user_id được suy ra từ Bearer token đã verify ở backend)

3. NestJS tạo payment link qua PayOS API:
   POST [https://api-merchant.payos.vn/v2/payment-requests](https://api-merchant.payos.vn/v2/payment-requests)
   {
     orderCode: <unique_number>,         ← timestamp-based, phải là số nguyên
     amount: <price_in_vnd>,
     description: "MetaScope Premium",   ← tối đa 25 ký tự
     returnUrl: "[https://metascope.gg/payment/success](https://metascope.gg/payment/success)",
     cancelUrl: "[https://metascope.gg/payment/cancel](https://metascope.gg/payment/cancel)",
     expiredAt: <unix_timestamp + 15min> ← link hết hạn sau 15 phút
   }

4. NestJS lưu pending transaction vào DB:
   INSERT INTO payment_transactions (order_code, user_id, amount, status='pending')

5. NestJS trả về { checkoutUrl } cho FE

6. FE redirect user đến checkoutUrl (trang PayOS hosted)

7. User quét VietQR bằng app ngân hàng

8. PayOS gửi webhook đến POST /api/v1/webhooks/payos
   (xử lý bên dưới — Section 10.3)

9. PayOS redirect user về returnUrl hoặc cancelUrl
   FE hiển thị màn hình thành công / thất bại

```

### 10.3. Xử Lý Webhook PayOS

> Webhook là nguồn sự thật duy nhất để cập nhật trạng thái thanh toán. Không dựa vào returnUrl để cấp quyền Premium.

```typescript
// POST /api/v1/webhooks/payos
// Endpoint này KHÔNG cần Firebase Auth (PayOS gọi từ server của họ)
// Phải trả về HTTP 200 để PayOS biết đã nhận thành công

async handlePayOSWebhook(body: PayOSWebhookDto) {
  // Bước 1: Verify signature (BẮT BUỘC — bỏ qua là lỗ hổng bảo mật nghiêm trọng)
  // Thuật toán: HMAC_SHA256, key sắp xếp alphabet, dùng PAYOS_CHECKSUM_KEY
  const isValid = verifyPayOSSignature(body.data, body.signature, PAYOS_CHECKSUM_KEY)
  if (!isValid) return { code: '01', desc: 'Invalid signature' }

  // Bước 2: Kiểm tra code thành công
  if (body.code !== '00' || !body.success) {
    // Ghi log payment thất bại, không làm gì thêm
    return { code: '00', desc: 'acknowledged' }
  }

  // Bước 3: Lookup transaction từ orderCode
  const tx = await db.payment_transactions.findOne({ order_code: body.data.orderCode })
  if (!tx) return { code: '00', desc: 'acknowledged' } // idempotent

  // Bước 4: Idempotency check — tránh xử lý 2 lần nếu webhook gửi lại
  const eventKey = `payos:${body.data.orderCode}`
  const duplicate = await db.processed_webhooks.findOne({ event_key: eventKey })
  if (duplicate || tx.status === 'completed') return { code: '00', desc: 'already processed' }
  await db.processed_webhooks.insert({ provider: 'payos', event_key: eventKey })

  // Bước 5: Cập nhật transaction + nâng cấp user tier (atomic)
  await db.transaction(async (trx) => {
    await trx.payment_transactions.update(
      { order_code: body.data.orderCode },
      { status: 'completed', paid_at: body.data.transactionDateTime }
    )
    const user = await trx.users.findOne({ id: tx.user_id })
    const now = new Date()
    const base = user.tier_expires_at && user.tier_expires_at > now ? user.tier_expires_at : now
    await trx.users.update(
      { id: tx.user_id },
      {
        tier: 'premium',
        tier_expires_at: addMonths(base, 1)
      }
    )
    await trx.entitlement_ledger.insert({
      user_id: tx.user_id,
      source: 'payos_webhook',
      action: user.tier === 'premium' ? 'extend' : 'grant',
      tier_before: user.tier,
      tier_after: 'premium',
      expires_before: user.tier_expires_at,
      expires_after: addMonths(base, 1),
      reference_id: String(body.data.orderCode)
    })
  })

  // Bước 6: Gửi email xác nhận thanh toán thành công cho user

  return { code: '00', desc: 'success' }
}

```

**Webhook payload từ PayOS:**

```json
{
  "code": "00",
  "desc": "success",
  "success": true,
  "data": {
    "orderCode": 123,
    "amount": 3000,
    "description": "MetaScope Premium",
    "accountNumber": "12345678",
    "reference": "TF230204212323",
    "transactionDateTime": "2023-02-04 18:25:00",
    "currency": "VND",
    "paymentLinkId": "124c33293c43417ab7879e14c8d9eb18",
    "code": "00",
    "desc": "Thành công"
  },
  "signature": "<hmac_sha256_signature>"
}

```

### 10.4. Schema Bảng Payment

```sql
payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  order_code BIGINT UNIQUE NOT NULL,   -- số nguyên, PayOS yêu cầu unique
  payment_link_id VARCHAR,             -- từ PayOS response
  amount INTEGER NOT NULL,             -- đơn vị VNĐ
  plan_type VARCHAR NOT NULL,          -- 'premium_monthly'
  status VARCHAR DEFAULT 'pending',    -- 'pending' | 'completed' | 'cancelled' | 'expired'
  paid_at TIMESTAMP,
  expires_at TIMESTAMP,               -- link hết hạn
  created_at TIMESTAMP DEFAULT NOW()
)

```

### 10.5. Gia Hạn & Downgrade

* **Gia hạn:** User phải chủ động vào `/user/subscription` và tạo link thanh toán mới. Không có auto-recurring.
* **Nhắc gia hạn:** Gửi email + in-app banner trước 3 ngày khi hết hạn, nhắc lại vào ngày hết hạn.
* **Downgrade khi hết hạn:** Middleware check `tier_expires_at < NOW()` mỗi request — tự động reject Premium features, không cần cron job.
* **Hoàn tiền:** Chỉ áp dụng khi giao dịch thành công nhưng entitlement không được cấp đúng do lỗi hệ thống; thời hạn yêu cầu hoàn tiền trong 24 giờ.

### 10.6. Quy Tắc PayOS

1. `orderCode` phải là số nguyên dương, unique toàn hệ thống. Dùng `Date.now()` hoặc sequence DB.
2. `description` tối đa 25 ký tự — nếu quá sẽ bị PayOS từ chối.
3. Webhook endpoint trả HTTP 200 cho các trường hợp đã xử lý/đã ghi nhận; với lỗi hạ tầng tạm thời cần retry theo contract PayOS hiện hành (không ACK giả thành công khi chưa ghi nhận được transaction).
4. Verify signature TRƯỚC KHI xử lý bất kỳ logic nào. Không verify = có thể bị giả mạo webhook.
5. Không cấp Premium dựa trên `returnUrl` — chỉ dựa vào webhook đã verify.

---

## 11. Bảo Mật (Security)

### 11.1. API Security

| Hạng mục | Trạng thái | Ghi chú |
| --- | --- | --- |
| HTTPS bắt buộc toàn bộ | Bắt buộc | Redirect HTTP → HTTPS |
| CORS policy | Bật | Chỉ cho phép origin từ `https://metascope.gg`, `https://admin.metascope.gg`, `https://cms.metascope.gg` |
| Helmet headers | Bật | CSP, X-Frame-Options, HSTS |
| IP rate limit | Bật | 120 req/phút/IP cho API public; endpoint auth áp dụng ngưỡng riêng |
| Request size limit | Bật | Giới hạn body 1MB cho API mặc định |
| PayOS webhook IP whitelist | Bật khi PayOS cung cấp dải IP chính thức | Luôn verify signature trước khi xử lý |

### 11.2. Database Security (Supabase RLS)

Row Level Security phải được bật cho các bảng sau:

| Bảng | Policy | Ghi chú |
| --- | --- | --- |
| `users` | User chỉ đọc/sửa row của chính mình | Admin bypass qua service role key |
| `guides` | Owner có full quyền; public chỉ đọc guide có `is_public=true` | Update/Delete chỉ owner hoặc admin |
| `usage_quotas` | User chỉ đọc quota của mình, không được sửa | Chỉ service role mới ghi |
| `payment_transactions` | User chỉ đọc transaction của mình | Không cho insert/update/delete từ client |
| `meta_snapshots` | Public read; chỉ service role mới write | — |

### 11.3. Input Validation

| Input | Validation | Ghi chú |
| --- | --- | --- |
| Riot ID / Summoner name | Sanitize ký tự đặc biệt, max length | Tránh injection vào Riot API URL |
| Match ID | Format check (REGION_matchId) | — |
| Guide content | Strip HTML/script tags | Nếu sau này cho public guide |
| Email đăng ký | RFC format + lowercase normalize | Firebase Auth đã xử lý phần lớn |

### 11.4. Abuse Prevention

| Biện pháp | Chi tiết |
| --- | --- |
| Register rate limit | 5 lần/IP/giờ |
| Login rate limit | 10 lần/IP/15 phút |
| Captcha khi register | Bật khi vượt ngưỡng rate limit hoặc phát hiện IP rủi ro |
| Account sharing Premium | Cho phép tối đa 2 thiết bị active/24h; vượt ngưỡng thì yêu cầu xác minh lại |
| Suspicious usage alert | Cảnh báo khi cùng tài khoản đăng nhập từ >3 IP khác nhau trong 1 giờ |

---

## 12. Testing Strategy

### 12.1. Phân Loại Test

| Loại | Tool | Coverage target | Ưu tiên |
| --- | --- | --- | --- |
| Unit test | Vitest | >= 80% statements cho domain services | Cao — đặc biệt cho heuristic algorithms |
| Integration test | Jest + Supertest | >= 70% cho API critical paths | Cao — Riot API wrapper, quota flow |
| E2E test | Playwright | Các happy path chính | Trung bình |
| Load test | k6 | Smoke load test cho API trọng yếu trước mỗi release lớn | Thấp — sau MVP |

### 12.2. Các Case Bắt Buộc Phải Test

**Unit tests bắt buộc:**

* Elo Predictor: kiểm tra output với input biên (placement toàn 1, toàn 8, mixed)
* Quota middleware: basic user vượt quota → 429, premium → pass
* PayOS signature verification: valid signature → true, tampered → false
* Tier downgrade: `tier_expires_at` trong quá khứ → reject premium request

**Integration tests bắt buộc:**

* Riot API wrapper: xử lý 429 → retry đúng cách
* Webhook PayOS: nhận webhook hợp lệ → user được nâng cấp tier
* Webhook PayOS: nhận webhook signature sai → bị reject, user không đổi tier

### 12.3. Test Environment

Môi trường test tách biệt production, dùng sandbox credentials và dữ liệu staging.

* Cần tài khoản PayOS sandbox để test payment flow
* Riot API dev key cho test environment
* Supabase project riêng cho staging

---

## 13. Pháp Lý & Compliance

Các yêu cầu pháp lý dưới đây là checklist bắt buộc hoàn tất trước khi go-live.

### 13.1. Riot Games ToS Compliance

MetaScope sử dụng Riot Games API và phải tuân thủ [Riot Games Developer Policies](https://developer.riotgames.com/policies/general).

**Bắt buộc hiển thị trên web (footer hoặc trang riêng):**

> MetaScope isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.

**Các điều khoản cần tuân thủ:**

* Không cache match data quá `RIOT_MATCH_CACHE_RETENTION_DAYS` (giá trị cấu hình theo Riot policy hiện hành)
* Không dùng data để train AI model thương mại
* Hiển thị rõ data source khi trình bày thống kê
* Hoàn tất legal review Riot ToS trước launch và lưu version policy đã kiểm tra trong runbook vận hành

### 13.2. Chính Sách Bảo Mật & Điều Khoản Dịch Vụ

Privacy Policy và Terms of Service phải được publish công khai trước khi mở đăng ký tài khoản và thanh toán.

**Privacy Policy phải đề cập:**

* Dữ liệu nào được thu thập (email, ingame name, match history)
* Dữ liệu được lưu ở đâu (Supabase — Singapore region mặc định)
* Thời gian lưu trữ
* Quyền của người dùng (xóa tài khoản, export data)
* Cookie policy
* Nội dung chính thức phải được legal review và version hóa theo ngày hiệu lực

**Terms of Service phải đề cập:**

* Điều kiện sử dụng Premium
* Chính sách hoàn tiền
* Điều khoản chấm dứt tài khoản (ban policy)
* Giới hạn trách nhiệm
* Nội dung chính thức phải được legal review và version hóa theo ngày hiệu lực

### 13.3. Tuổi Người Dùng

* MetaScope áp dụng độ tuổi tối thiểu 13+ theo thông lệ nền tảng game online.
* Không bắt buộc cổng xác minh tuổi ở MVP; bổ sung age gate nếu có yêu cầu pháp lý theo thị trường triển khai.