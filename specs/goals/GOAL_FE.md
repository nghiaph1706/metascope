# GOAL: Frontend (`apps/web`)

## Tổng quan vai trò

Frontend là **lớp trải nghiệm người dùng** — không phải authority cho bất kỳ logic nghiệp vụ nào. Tier, quota, và entitlement luôn đến từ backend response. `base-template/src/` là điểm xuất phát UI; ưu tiên replace mock data bằng API calls thật theo PRD.

---

## Mục tiêu chính

### 1. Foundation & Routing

- **Goal:** Setup toàn bộ route map theo Section 8.1 bằng TanStack Router.
- Implement `<ProtectedRoute>` wrapper với 3 cấp: `guest`, `basic`, `premium`.
- Redirect logic:
  - Unauthenticated → `/auth` (kèm `returnTo` param).
  - Basic truy cập premium route → toast cảnh báo + redirect `/pricing`.
  - Đã login truy cập `/auth` → redirect `/`.
  - Route không tồn tại → 404, auto redirect `/` sau 3 giây.
- Layout toàn cục: Sidebar cố định Desktop / Hamburger slide-left Mobile.
- Dark theme glassmorphism, màu chủ đạo Indigo/Slate theo design spec.

**Done criteria:**

- [ ] Toàn bộ route trong bảng Section 8.1 đã được định nghĩa.
- [ ] `<ProtectedRoute>` chặn đúng theo tier; toast + redirect hoạt động.
- [ ] 404 redirect về `/` sau 3 giây.

---

### 2. Auth Flow (`/auth`)

- **Goal:** Implement login/register và quản lý auth state.
- Form toggle giữa Đăng Nhập / Đăng Ký (Email, Mật khẩu, Tên Ingame).
- Sau auth thành công: gọi `POST /api/v1/auth/sync-profile` → lưu Zustand auth state (tier, profile) từ response.
- Lưu trạng thái auth bằng **Zustand**; không tự tính entitlement từ Firebase token.
- Đăng xuất: xóa Zustand state, Firebase signOut, redirect `/`.
- `GET /user/profile` — hiển thị tier hiện tại, nút quản lý subscription / nâng cấp.

**Done criteria:**

- [ ] Login/register flow hoàn chỉnh với error handling.
- [ ] Auth state `tier` lấy từ backend `/me`, không suy từ Firebase token.
- [ ] Đăng xuất xóa sạch state, redirect về guest.

---

### 3. Meta Library — Guest Access

**3a. Tier List & Comp Details (`/meta/comps`, `/meta/comps/:compId`)**

- Danh sách comps với filter Tier S/A/B.
- Chi tiết comp: hex grid 4×7 định vị tướng, items ưu tiên, augments cốt lõi, xoay bài qua Stage 2/3/4.

**3b. Champions & Traits (`/meta/champions`, `/meta/champions/:championId`)**

- Data table với sort/filter theo win_rate, pick_rate.
- Chi tiết tướng: stats + Top 3 best items.

**3c. Items & Roll Odds (`/meta/items`, `/meta/roll-odds`)**

- Item matrix chéo (mảnh cơ bản → trang bị hoàn chỉnh).
- Bảng tỉ lệ roll theo level — static reference.

**3d. Patch Notes (`/patch-notes`, `/patch-notes/:version`)**

- Danh sách patch, render rich text từ CMS.

**Done criteria:**

- [ ] Tất cả meta routes accessible với guest (không cần login).
- [ ] Data fetch qua `GET /api/v1/meta/*` — không gọi Riot API hay Supabase trực tiếp từ FE.
- [ ] TanStack Query cache + background refetch hoạt động đúng.

---

### 4. Player Stats (`/player/:riotId`, `/player/:riotId/matches`)

- **Goal:** Hiển thị profile + lịch sử đấu của người chơi.
- Input: Riot ID dạng `gameName#tagLine` + chọn `region`.
- Profile page: LP history chart (Recharts Spline), rank hiện tại.
- Matches list: 20 match gần nhất với thứ hạng, đơn vị chính.
- Match detail: board state theo round, items, augments, placement, damage timeline.
- Requires Basic auth — `<ProtectedRoute tier="basic">`.

**Done criteria:**

- [ ] LP chart render đúng từ match history data.
- [ ] Unauthenticated user bị redirect về `/auth`.

---

### 5. AI Tools

**5a. Elo Predictor (`/tools/elo-predictor`)**

- Form: rank hiện tại + LP, rank mục tiêu, kết quả 5 trận gần nhất (dropdown 1–8 mỗi trận).
- Nút "Run Prediction Simulation" → gọi `POST /api/v1/tools/elo-predictor`.
- Hiển thị kết quả: quỹ đạo (Tốt/Xấu), LP avg, số game ước tính, lời khuyên.
- Hiển thị quota remaining (từ backend response).
- Requires Basic. Khi hết quota: disable form + thông báo reset time.

**5b. Post-Game AI Analysis (`/tools/post-game-analysis`)**

- Input: Riot ID hoặc match ID.
- Kết quả: Report Card với điểm số (A/B/C/D scale) + ghi chú.
- Loading state khi chờ AI xử lý.
- Requires Basic. Quota display + locked state khi vượt giới hạn.

**5c. Matchup Coach (`/tools/matchup-coach`) — Premium Only**

- Panel trái: danh sách meta comps hiện tại.
- Chọn 1 comp địch → bấm Phân Tích → gọi API.
- Kết quả: điểm yếu địch, hard counters, easy matchups, lời khuyên xếp bài.
- Với Basic user: `<ProtectedRoute tier="premium">` → redirect `/pricing` với premium upsell.

**Done criteria:**

- [ ] Quota state hiển thị đúng từ backend (không tự tính FE).
- [ ] Matchup Coach blocked hoàn toàn với Basic — không chỉ ẩn UI.
- [ ] Loading/error states đầy đủ cho mọi AI tool.

---

### 6. Creator Hub & Guides (`/guides`, `/guides/create`, `/guides/:guideId/edit`)

- **Goal:** Canvas editor cho phép Basic+ user tạo và quản lý guide cá nhân.
- Creator Hub: danh sách guide dạng Card — Edit, Xóa, Nhân Bản.
- Tạo guide: điền tên, mô tả → kéo tướng lên hex grid → chọn items/augments → Save Draft.
- Edit: chỉ owner được truy cập — FE check ownership từ backend response.

**Done criteria:**

- [ ] CRUD guide gọi đúng endpoint `/api/v1/guides/*`.
- [ ] Non-owner cố truy cập edit URL → redirect.

---

### 7. Subscription & Pricing (`/pricing`, `/user/subscription`, `/payment/*`)

- **Goal:** Hiển thị pricing table, handle payment flow, show subscription status.
- `/pricing`: bảng so sánh Basic vs Premium (feature checklist), nút "Nâng cấp Premium" CTA.
- Nút upgrade → gọi `POST /api/v1/subscription/create-payment-link` → redirect đến `checkoutUrl`.
- `/payment/success`: hiển thị trạng thái "đang chờ xác nhận" (không assume premium ngay từ returnUrl).
- `/payment/cancel`: cho phép tạo lại link thanh toán.
- `/user/subscription`: lịch sử thanh toán, tier hiện tại + `expires_at`, nút gia hạn.
- Banner nhắc gia hạn trước 3 ngày hết hạn.

**Done criteria:**

- [ ] FE không tự nâng tier sau returnUrl — chờ Zustand refresh từ `/me`.
- [ ] `/payment/success` hiển thị "đang xử lý" không phải "đã premium".

---

## Nguyên tắc data fetching

| Loại data                                       | Cách fetch                                                      |
| ----------------------------------------------- | --------------------------------------------------------------- |
| Public meta (tier list, champions, patch notes) | `GET /api/v1/meta/*` — qua NestJS, không gọi Supabase trực tiếp |
| Protected + quota-sensitive                     | `GET/POST /api/v1/*` — bắt buộc qua NestJS với Bearer token     |
| Auth state                                      | Zustand store, seed từ `GET /api/v1/auth/me` sau login          |
| Riot data                                       | KHÔNG gọi trực tiếp từ FE                                       |

---

## State management

- **Zustand:** auth state (user, tier, isLoggedIn), UI state (sidebar toggle, modals).
- **TanStack Query:** tất cả server state — cache, refetch, loading/error states.
- **Không lưu tier/quota vào localStorage** — luôn lấy từ backend khi cần.

---

## Phase triển khai khuyến nghị

1. Scaffold toàn bộ routes + `<ProtectedRoute>` skeleton.
2. Wire API layer — replace mock data bằng TanStack Query hooks.
3. Gắn auth state từ Zustand vào guards.
4. Bổ sung quota UX states (locked, remaining count, reset time).
5. Polish UI theo dark glassmorphism design spec.
