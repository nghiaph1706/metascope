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

