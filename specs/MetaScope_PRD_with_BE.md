# MetaScope - Tài Liệu Đặc Tả Yêu Cầu Dự Án (PRD)

MetaScope là giải pháp tiện ích toàn diện dành cho trải nghiệm Đấu Trường Chân Lý (TFT). Hệ thống cung cấp kho dữ liệu meta realtime, các công cụ phân tích mạnh mẽ bằng AI và hệ thống huấn luyện độc quyền nhằm giúp người chơi leo rank một cách hiệu quả và tối ưu nhất.

Dưới đây là chi tiết toàn bộ cách thức hoạt động của các tính năng, luồng người dùng (user flow) và chính sách phân quyền gói cước (user plans).

---

## 1. Hệ Thống Xác Thực & Tài Khoản (Authentication Flow)

Hệ thống yêu cầu người dùng phải đăng ký/đăng nhập để truy cập vào các tính năng cá nhân hóa và các công cụ AI.

### Luồng Đăng Nhập / Đăng Ký:
- **Truy cập:** Người dùng chưa đăng nhập nhấn vào "Trang cá nhân" hoặc truy cập các route bị khóa (vd: AI Coach, Predictor) sẽ bị điều hướng về màn hình Đăng kí/Đăng nhập (`/auth_view`).
- **Giao diện:** Form điền thông tin (Email, Mật khẩu, Tên Ingame) với thiết kế hiện đại, có toggle chuyển đổi giữa Đăng Nhập và Đăng Ký.
- **Xử lý:** Sau khi xác thực thành công, hệ thống lưu trạng thái đăng nhập (được cấp một bậc `userTier` mặc định là `basic`) và điều hướng người dùng quay lại trang chủ hoặc trang họ đang muốn truy cập.
- **Đăng xuất:** Nút đăng xuất nằm trong màn hình Quản lý Tài Khoản (`/user_profile`), xóa phiên đăng nhập và đưa người dùng về trạng thái Khách.

### Quản Lý Tài Khoản (User Profile):
- Hiển thị thông tin cá nhân cơ bản, hạng gói cước hiện tại (Basic / Premium).
- Nút quản lý thanh toán hoặc đường dẫn tắt nâng cấp lên Premium.

---

## 2. Phân Chi Nhánh Gói Cước (User Plans)

Hệ thống được chia làm 3 tầng trải nghiệm. Các tính năng chuyên sâu bị chặn bằng router bảo vệ (`ProtectedRoute`) dựa trên thuộc tính `userTier` của tài khoản.

### 2.1. Gói Khách Vãng Lai (Guest / Unauthenticated)
Dành cho người chưa đăng nhập.
- **Được truy cập:** Trang chủ, Thư Viện Meta (Tier List & Chi tiết đội hình), Tham khảo Tỉ Lệ Roll, Cách ghép trang bị, Xem bảng xếp hạng, Xem Patch Notes.
- **Bị chặn:** Mọi tính năng tra cứu lịch sử đấu cá nhân, phân tích AI, công cụ xây dựng đội hình.

### 2.2. Gói Tuyển Thủ (Basic - Miễn phí khi có tài khoản)
Dành cho người dùng đã đăng ký tài khoản nhưng chưa nâng cấp thanh toán.
- **Bao gồm:** Tất cả quyền hạn của Guest.
- **Công cụ cá nhân:** Được phép tạo giáo án riêng (Create Guide) và lưu tại Creator Hub. Xem lịch sử đấu của bản thân và đối thủ ở mức cơ bản.
- **Công cụ nâng cao (Bị giới hạn):**
  - **Phân Tích AI Hậu Kỳ:** Chỉ 1 lần/tuần.
  - **Dự Đoán Elo (MMR Predictor):** Chỉ dùng thử 3 lần/tuần.
- **Bị chặn hoàn toàn:** Huấn luyện viên AI chuyên sâu (Matchup Coach).

### 2.3. Gói Tinh Anh (Premium / Pro)
Dành cho người dùng trả phí hàng tháng. Mở khóa toàn bộ khả năng tính toán của server.
- **Bao gồm:** Tất cả quyền hạn của Basic.
- **Đặc quyền Mở khóa:**
  - **Huấn Luyện AI (Matchup Coach):** Sử dụng không giới hạn thuật toán chỉ ra điểm yếu và cách xếp bài khắc chế đối thủ.
  - **Dự Đoán Elo & MMR:** Mở khóa không giới hạn. Xem được ma trận phân tích LP chi tiết.
  - **Phân Tích AI Hậu Kỳ:** Chỉ tiêu 2 trận / ngày hoặc không giới hạn nhánh phân tích sâu.
  - **Chỉ số nâng cao:** Truy cập vào dữ liệu lõi đặc quyền của các tướng/tộc hệ tỷ lệ thắng cao nhất.

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
    * **Flow:** Nhập ID summoner -> Chuyển đến trang Profile tổng quan. Hiển thị Biểu đồ leo rank dạng Spline Chart tiến trình lịch sử, liệt kê 20 match gần nhất, chi tiết đơn vị và thứ hạng.

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
    * **Flow:** Điền Tên Giáo án -> Thêm mô tả chiến thuật -> Xếp tướng -> Ấn Lưu Váp (Save Draft).
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
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  ingame_name VARCHAR,
  tier VARCHAR DEFAULT 'basic',         -- 'basic' | 'premium'
  tier_expires_at TIMESTAMP,            -- NULL nếu basic (không hết hạn)
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

```

#### Redis keys:

```
quota:{user_id}:{feature}:{YYYY-WW}     → integer (weekly count), TTL 8 ngày
quota:{user_id}:{feature}:{YYYY-MM-DD}  → integer (daily count), TTL 2 ngày
session:{session_token}                 → user_id, TTL = session duration
riot_summoner:{region}:{summonerName}   → PUUID JSON, TTL 1 giờ
meta:current_patch                      → patch_version string, TTL 1 giờ

```

---

### 5.4. API Endpoints (Backend REST)

Tất cả endpoint đều có prefix `/api/v1`. Auth dùng JWT Bearer token trong header.

#### Auth:

```
POST /api/v1/auth/register      body: {email, password, ingame_name}
POST /api/v1/auth/login         body: {email, password} → {token, user}
POST /api/v1/auth/logout        header: Bearer token
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

```

#### Player (Cần auth — Basic trở lên):

```
GET  /api/v1/player/:riotId/profile             → rank, LP, tier hiện tại
GET  /api/v1/player/:riotId/matches?page=1      → 20 match gần nhất, có pagination
GET  /api/v1/player/:riotId/matches/:matchId    → chi tiết 1 trận
GET  /api/v1/player/:riotId/lp-history          → lịch sử LP dạng time-series cho chart

```

#### Combat Tools (Cần auth + quota check):

```
POST /api/v1/tools/elo-predictor
     body: {current_rank, current_lp, target_rank, recent_placements[]}
     quota: basic=3/week, premium=unlimited

POST /api/v1/tools/post-game-analysis
     body: {match_id} hoặc {riot_id} (lấy match mới nhất)
     quota: basic=1/week, premium=2/day

POST /api/v1/tools/matchup-coach
     body: {enemy_comp_id}
     quota: basic=BLOCKED, premium=unlimited

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
POST /api/v1/subscription/upgrade    → (hiện tại giả lập) set tier=premium
POST /api/v1/subscription/downgrade  → set tier=basic
GET  /api/v1/subscription/status     → {tier, expires_at, usage_this_period}

```

---

### 5.5. Hệ Thống Quota (Server-Side Enforcement)

> **Quan trọng:** Quota PHẢI được validate ở server, không phải chỉ ẩn/hiện ở frontend. Client không được tin tưởng.

**Middleware `checkQuota(feature, period)**` chạy trước mọi endpoint có giới hạn:

```
1. Đọc userTier từ JWT
2. Nếu premium → skip quota check, cho qua
3. Nếu basic:
   a. Tính period_start (đầu tuần ISO hoặc ngày hiện tại theo UTC)
   b. Query usage_quotas: SELECT count WHERE user_id AND feature AND period_start
   c. So sánh với limit config:
      - post_game_analysis / weekly: limit = 1
      - elo_predictor / weekly:      limit = 3
      - matchup_coach:               limit = 0 (block hoàn toàn)
   d. Nếu count >= limit → trả về 429 { error: "QUOTA_EXCEEDED", reset_at: ... }
   e. Nếu còn quota → tăng count, cho request đi tiếp
4. Sau khi request thành công → INCREMENT count trong Redis (atomic)
   Đồng thời upsert vào bảng usage_quotas để persist

```

**Reset logic:** Period `weekly` tính từ thứ Hai đầu tuần theo UTC (ISO week). Không reset lúc nửa đêm theo giờ địa phương để tránh timezone bug.

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
      /auth              -- register, login, logout controllers
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
3. **JWT không lưu quota hay usage.** JWT chỉ chứa `{user_id, tier, exp}`. Quota luôn được query từ Redis/DB mỗi request.
4. **Tier downgrade phải atomic.** Khi subscription hết hạn (tier_expires_at < NOW()), mọi request premium phải bị reject ngay, không cần cron job chủ động downgrade. Middleware auth check `tier_expires_at` mỗi lần.
5. **Match data luôn cache lại.** Sau khi fetch từ Riot API, lưu vào `match_cache`. Nếu đã có trong cache, không gọi API lại. TTL không cần thiết vì match data không thay đổi sau khi game kết thúc.
6. **LLM response cache theo pattern, không theo user.** Response của matchup-coach cho cùng 1 enemy_comp trong cùng 1 patch là như nhau cho mọi user. Cache ở server-side Redis, không phải per-user.
7. **Aggregate data phải có patch_version.** Không bao giờ overwrite meta data cũ. Lưu theo snapshot để có thể rollback và so sánh.
8. **KHÔNG IMPLEMENT Live Tracker.** Tính năng quét sảnh trực tiếp đã bị loại bỏ vì là "sát thủ rate limit". Mỗi lần quét tốn 7 Riot API calls đồng thời. Với giới hạn Rate Limit khắt khe của Riot, điều này sẽ làm cạn kiệt Quota, gây lỗi HTTP 429 và làm sập chéo (bottleneck) các tính năng cốt lõi quan trọng khác. Việc gỡ bỏ giúp tối ưu tài nguyên và đảm bảo High Availability.

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
| Authentication | Firebase Auth | Setup nhanh, hỗ trợ Google login, JWT verify qua Firebase Admin SDK |
| Database | Supabase (PostgreSQL) | SQL đầy đủ cho aggregate query, tự generate TypeScript types |
| Cache + Queue | Upstash Redis + BullMQ | Managed Redis, quota tracking, job queue cho crawler |
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
Supabase JS client      ← query DB trực tiếp cho public data (tier list, patch notes)

```

**Nguyên tắc data fetching:**

* Public data (tier list, champion stats, patch notes) → Supabase JS client gọi thẳng từ FE, không cần qua NestJS API (giảm latency)
* Protected data + quota-sensitive (tools AI, player stats) → bắt buộc qua NestJS API để enforce auth và quota

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

Upstash Redis (managed, serverless)
  ├── Quota counters (daily + weekly)
  ├── LLM response cache (matchup coach theo patch)
  ├── Riot API response cache (summoner lookup, 1h TTL)
  └── BullMQ job queue backend

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
  → FE gọi Supabase JS client trực tiếp: supabase.from('patch_notes').select()
  → Hiển thị trang Patch Notes (không cần qua NestJS API)

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
| `/player/:riotId` | Hồ sơ người chơi | Basic | Profile + LP chart |
| `/player/:riotId/matches` | Lịch sử đấu | Basic | 20 match gần nhất |
| `/player/:riotId/matches/:matchId` | Chi tiết trận | Basic | [placeholder] |
| `/tools/elo-predictor` | Dự đoán Elo | Basic | Form + kết quả |
| `/tools/post-game` | Phân tích hậu kỳ | Basic | Nhập match ID |
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

> Placeholder — chi tiết sẽ được quyết định sau. Developer không được hardcode bất kỳ giá trị nào thuộc danh sách này vào source code.

### 9.1. Biến Môi Trường (Environment Variables)

Tất cả env vars phải được lưu trong secret manager (không commit lên git). Mỗi app trong monorepo có file `.env.local` riêng.

#### `/apps/api` (NestJS)

```env
# Riot Games
RIOT_API_KEY=                        # Production key từ Riot Developer Portal
RIOT_API_REGION=                     # vd: sea, na1, euw1

# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=           # Server-side only, không expose ra client

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# LLM
LLM_API_KEY=                         # [placeholder — provider TBD]
LLM_MODEL=                           # vd: claude-sonnet-4-6

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

> [Placeholder — quyết định sau khi có budget và team size]

| App | Hosting đề xuất | Ghi chú |
| --- | --- | --- |
| `web` | [TBD] | Vercel hoặc Cloudflare Pages |
| `api` | [TBD] | Railway, Render, hoặc VPS |
| `worker` | [TBD] | Cần persistent process, không dùng serverless |
| `cms` | [TBD] | Cùng host với `api` hoặc riêng |
| `admin` | [TBD] | Có thể deploy tĩnh trên Vercel |

### 9.3. CI/CD Pipeline

> [Placeholder — chi tiết TBD]

* Nhánh `main` → auto deploy production
* Nhánh `develop` → auto deploy staging
* PR phải pass type-check + lint trước khi merge
* Tool: [TBD — GitHub Actions hoặc tương đương]

### 9.4. Monitoring & Alerting

> [Placeholder — chi tiết TBD]

| Mục | Tool đề xuất | Ghi chú |
| --- | --- | --- |
| Error tracking | [TBD] | Sentry hoặc tương đương |
| Uptime monitoring | [TBD] | — |
| Performance | [TBD] | — |
| Log aggregation | [TBD] | — |
| Crawler alert | [TBD] | Notify khi job fail liên tiếp |

### 9.5. Backup & Disaster Recovery

> [Placeholder — chi tiết TBD]

* Supabase auto-backup: [TBD — tần suất, retention]
* RTO (Recovery Time Objective): [TBD]
* RPO (Recovery Point Objective): [TBD]
* Quy trình restore nếu aggregate data bị corrupt: [TBD]

---

## 10. Thanh Toán (PayOS Integration)

> MetaScope dùng **PayOS** làm cổng thanh toán — hỗ trợ chuyển khoản ngân hàng Napas 24/7 qua VietQR, phù hợp thị trường Việt Nam. Docs chính thức: https://payos.vn/docs/

### 10.1. Thông Tin Gói Cước

> [Placeholder — giá và điều kiện cụ thể TBD]

| Thông tin | Giá trị |
| --- | --- |
| Tên gói | Premium / Tinh Anh |
| Giá tháng | [TBD] VNĐ/tháng |
| Chu kỳ billing | Hàng tháng |
| Trial period | [TBD — có hay không] |
| Hoàn tiền | [TBD] |

### 10.2. Luồng Thanh Toán (Payment Flow)

PayOS hoạt động theo mô hình tạo link thanh toán một lần — không phải recurring billing tự động. Subscription hàng tháng cần user chủ động gia hạn hoặc có flow nhắc nhở.

```
1. User click "Nâng cấp Premium" trên /pricing

2. FE gọi POST /api/v1/subscription/create-payment-link
   body: { userId, planType: 'premium_monthly' }

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
  if (tx.status === 'completed') return { code: '00', desc: 'already processed' }

  // Bước 5: Cập nhật transaction + nâng cấp user tier (atomic)
  await db.transaction(async (trx) => {
    await trx.payment_transactions.update(
      { order_code: body.data.orderCode },
      { status: 'completed', paid_at: body.data.transactionDateTime }
    )
    await trx.users.update(
      { id: tx.user_id },
      {
        tier: 'premium',
        tier_expires_at: addMonths(new Date(), 1)
      }
    )
  })

  // Bước 6: [TBD] Gửi email xác nhận thanh toán

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

> [Placeholder — flow chi tiết TBD]

* **Gia hạn:** User phải chủ động vào `/user/subscription` và tạo link thanh toán mới. Không có auto-recurring.
* **Nhắc gia hạn:** [TBD — email 3 ngày trước khi hết hạn, hoặc banner trong app]
* **Downgrade khi hết hạn:** Middleware check `tier_expires_at < NOW()` mỗi request — tự động reject Premium features, không cần cron job.
* **Hoàn tiền:** [TBD — policy cụ thể]

### 10.6. Quy Tắc PayOS

1. `orderCode` phải là số nguyên dương, unique toàn hệ thống. Dùng `Date.now()` hoặc sequence DB.
2. `description` tối đa 25 ký tự — nếu quá sẽ bị PayOS từ chối.
3. Webhook endpoint phải trả HTTP 200 trong mọi trường hợp (kể cả lỗi) — chỉ thay đổi `code` trong body. PayOS sẽ retry nếu không nhận được 200.
4. Verify signature TRƯỚC KHI xử lý bất kỳ logic nào. Không verify = có thể bị giả mạo webhook.
5. Không cấp Premium dựa trên `returnUrl` — chỉ dựa vào webhook đã verify.

---

## 11. Bảo Mật (Security)

> [Placeholder — chi tiết và giá trị cụ thể TBD. Đây là checklist tối thiểu cần implement trước khi go-live.]

### 11.1. API Security

| Hạng mục | Trạng thái | Ghi chú |
| --- | --- | --- |
| HTTPS bắt buộc toàn bộ | [TBD] | Redirect HTTP → HTTPS |
| CORS policy | [TBD] | Chỉ cho phép origin từ metascope.gg |
| Helmet headers | [TBD] | CSP, X-Frame-Options, HSTS... |
| IP rate limit | [TBD] | [X] req/min per IP — giá trị TBD |
| Request size limit | [TBD] | Giới hạn body size để chặn DoS |
| PayOS webhook IP whitelist | [TBD] | Chỉ nhận từ IP của PayOS |

### 11.2. Database Security (Supabase RLS)

Row Level Security phải được bật cho các bảng sau:

| Bảng | Policy | Ghi chú |
| --- | --- | --- |
| `users` | User chỉ đọc/sửa row của chính mình | Admin bypass qua service role key |
| `guides` | Owner có full quyền; public chỉ đọc guide có `is_public=true` | [TBD] |
| `usage_quotas` | User chỉ đọc quota của mình, không được sửa | Chỉ service role mới ghi |
| `payment_transactions` | User chỉ đọc transaction của mình | [TBD] |
| `meta_snapshots` | Public read; chỉ service role mới write | — |

### 11.3. Input Validation

| Input | Validation | Ghi chú |
| --- | --- | --- |
| Riot ID / Summoner name | Sanitize ký tự đặc biệt, max length | Tránh injection vào Riot API URL |
| Match ID | Format check (REGION_matchId) | — |
| Guide content | Strip HTML/script tags | Nếu sau này cho public guide |
| Email đăng ký | RFC format + lowercase normalize | Firebase Auth đã xử lý phần lớn |

### 11.4. Abuse Prevention

> [Placeholder — giá trị cụ thể TBD]

| Biện pháp | Chi tiết |
| --- | --- |
| Register rate limit | [TBD] lần/IP/giờ |
| Login rate limit | [TBD] lần/IP/phút |
| Captcha khi register | [TBD — có hay không] |
| Account sharing Premium | [TBD — policy xử lý] |
| Suspicious usage alert | [TBD — ngưỡng trigger alert] |

---

## 12. Testing Strategy

> [Placeholder — coverage target và tooling cụ thể TBD. Đây là định hướng tối thiểu.]

### 12.1. Phân Loại Test

| Loại | Tool | Coverage target | Ưu tiên |
| --- | --- | --- | --- |
| Unit test | [TBD] | [TBD]% | Cao — đặc biệt cho heuristic algorithms |
| Integration test | [TBD] | [TBD]% | Cao — Riot API wrapper, quota flow |
| E2E test | [TBD] | Các happy path chính | Trung bình |
| Load test | [TBD] | — | Thấp — sau MVP |

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

> [Placeholder — TBD]

* Cần tài khoản PayOS sandbox để test payment flow
* Riot API dev key cho test environment
* Supabase project riêng cho staging

---

## 13. Pháp Lý & Compliance

> [Placeholder — nội dung cụ thể cần tư vấn pháp lý trước khi go-live.]

### 13.1. Riot Games ToS Compliance

MetaScope sử dụng Riot Games API và phải tuân thủ [Riot Games Developer Policies](https://developer.riotgames.com/policies/general).

**Bắt buộc hiển thị trên web (footer hoặc trang riêng):**

> MetaScope isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.

**Các điều khoản cần tuân thủ:**

* Không cache match data quá [TBD — kiểm tra policy hiện tại] ngày
* Không dùng data để train AI model thương mại
* Hiển thị rõ data source khi trình bày thống kê
* [TBD — review đầy đủ Riot ToS trước launch]

### 13.2. Chính Sách Bảo Mật & Điều Khoản Dịch Vụ

> [Placeholder — cần soạn thảo trước khi thu thập email và xử lý thanh toán]

**Privacy Policy phải đề cập:**

* Dữ liệu nào được thu thập (email, ingame name, match history)
* Dữ liệu được lưu ở đâu (Supabase — Singapore region mặc định)
* Thời gian lưu trữ
* Quyền của người dùng (xóa tài khoản, export data)
* Cookie policy
* [TBD — soạn thảo đầy đủ]

**Terms of Service phải đề cập:**

* Điều kiện sử dụng Premium
* Chính sách hoàn tiền
* Điều khoản chấm dứt tài khoản (ban policy)
* Giới hạn trách nhiệm
* [TBD — soạn thảo đầy đủ]

### 13.3. Tuổi Người Dùng

> [Placeholder — TBD]

* Riot Games yêu cầu người dùng từ [TBD] tuổi trở lên
* MetaScope có cần cổng xác minh tuổi không: [TBD]