# Features and Routing

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

