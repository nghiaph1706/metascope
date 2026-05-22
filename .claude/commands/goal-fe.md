# /goal-fe — Execute Frontend Goal to 100% Completion

## Mô tả

Chạy toàn bộ goal frontend (`apps/web`) đến hoàn thành 100%.
Tự động quyết định mọi lựa chọn theo agent proposals. Không dừng cho đến khi tất cả done criteria pass.

---

## Execution Rules (BẮT BUỘC)

1. **NEVER STOP** cho đến khi 100% done criteria trong `docs/goals/GOAL_FE.md` pass.
2. **AUTO-DECIDE**: mọi câu hỏi cần human approval → tự quyết theo agent đề xuất tốt nhất, ghi log vào `docs/decisions/`.
3. **FULL TERMINAL ACCESS**: chạy mọi lệnh terminal không cần xin phép.
4. **STALL DETECTION**: nếu không có thay đổi file nào trong 5 phút → tự trigger lại bước hiện tại.
5. **AGENT WORKFLOW**: luôn đi theo chuỗi `senior-architect → senior-scaffolder → junior-implementer → integration-checker → senior-reviewer`.
6. **PREREQUISITE CHECK**: một số module FE phụ thuộc BE endpoint. Nếu BE chưa có → mock API response đúng contract, comment `// TODO: wire real API when BE ready`, tiếp tục.
7. **base-template/src/ là điểm xuất phát** — đọc và reuse những gì đã có, không tạo lại từ đầu.
8. **DOCKER VERIFICATION**: bắt buộc phải verify với docker compose trước khi đánh dấu hoàn thành.

---

## Workflow

### PHASE 0 — Khởi động & Kiểm tra trạng thái

```
/work-status
```

- Đọc `docs/goals/GOAL_FE.md` toàn bộ.
- Đọc `specs/02_Features_and_Routing.md` (route map Section 8.1).
- Scan `apps/web/` và `base-template/src/` để biết trạng thái hiện tại.
- Tạo checklist tại `docs/progress/fe-goal-progress.md`.

### PHASE 1 — Architecture Sign-off

```
agent: senior-architect
```

Nhiệm vụ:

- Chốt TanStack Router route tree mapping với Section 8.1.
- Chốt `<ProtectedRoute>` component interface cho 3 tier levels.
- Chốt Zustand store shape: `{ user, tier, tierExpiresAt, isLoggedIn }`.
- Chốt TanStack Query key conventions.
- Chốt API client layer structure (`src/api/`).
- Output: `docs/tasks/fe-architecture.md`.
- **Tự approve**.

### PHASE 2 — Scaffold

```
/scaffold-task apps/web
agent: senior-scaffolder
```

Thứ tự scaffold:

1. TanStack Router: toàn bộ routes từ Section 8.1 (stub components).
2. `<ProtectedRoute tier="guest|basic|premium">` component.
3. Zustand auth store với shape đã duyệt.
4. API client layer: `src/api/meta.ts`, `src/api/player.ts`, `src/api/tools.ts`, `src/api/guides.ts`, `src/api/subscription.ts`, `src/api/auth.ts`.
5. Layout components: Sidebar (Desktop), HamburgerMenu (Mobile).
6. Shared UI components từ Shadcn/ui + custom.

### PHASE 3 — Implementation (theo thứ tự)

```
/implement-task <scope>
agent: junior-implementer
```

**3.1 Auth Flow**

- `/auth` route: toggle Login/Register form.
- Firebase SDK: `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`.
- Sau auth: gọi `POST /api/v1/auth/sync-profile` → seed Zustand từ response.
- `GET /api/v1/auth/me` → refresh auth state.
- Logout: Firebase signOut + clear Zustand + redirect `/`.
- Redirect logic: unauthenticated → `/auth?returnTo=<path>`, đã login truy cập `/auth` → `/`.
- `<ProtectedRoute>` redirect với toast cảnh báo.

**3.2 Layout & Navigation**

- Global layout: sidebar cố định Desktop, hamburger Mobile.
- Dark theme glassmorphism, màu Indigo/Slate theo spec.
- Active route highlight trong sidebar.
- 404 page: redirect về `/` sau 3 giây (countdown hiển thị).

**3.3 Meta Library (Guest)**

- `/meta/comps`: tier list với filter S/A/B, dùng TanStack Query `GET /api/v1/meta/comps`.
- `/meta/comps/:compId`: hex grid 4×7, items, augments, Stage guide.
- `/meta/champions`: data table sort/filter theo win_rate, pick_rate.
- `/meta/champions/:championId`: stats + Top 3 best items.
- `/meta/items`: item matrix component.
- `/meta/roll-odds`: static table theo level.
- `/patch-notes`: danh sách; `/patch-notes/:version`: rich text render.
- Tất cả public — không cần auth.

**3.4 Player Stats (Basic)**

- `/player/:riotId`: input Riot ID `gameName#tagLine` + region selector → profile.
- LP history: Recharts SplineChart.
- `/player/:riotId/matches`: 20 match list.
- `/player/:riotId/matches/:matchId`: board state, items, placement, damage timeline.
- ProtectedRoute tier="basic".

**3.5 Elo Predictor (`/tools/elo-predictor`)**

- Form: rank + LP hiện tại, rank mục tiêu, 5 placement dropdowns (1–8).
- Submit → `POST /api/v1/tools/elo-predictor`.
- Result card: quỹ đạo, LP avg, số game ước tính, lời khuyên.
- Quota remaining display từ response headers/body.
- Locked state khi hết quota: disable form + "Resets <date>".
- ProtectedRoute tier="basic".

**3.6 Post-Game AI Analysis (`/tools/post-game-analysis`)**

- Input: Riot ID hoặc match ID text field.
- Submit → `POST /api/v1/tools/post-game-analysis`.
- Loading skeleton khi chờ AI.
- Report Card: điểm A/B/C/D với màu sắc + ghi chú lý do.
- Quota display + locked state.
- ProtectedRoute tier="basic".

**3.7 Matchup Coach (`/tools/matchup-coach`) — Premium**

- Panel trái: danh sách meta comps hiện tại (từ `/api/v1/meta/comps`).
- Select comp địch → "Phân Tích" button → `POST /api/v1/tools/matchup-coach`.
- Result: điểm yếu địch, hard counters list, easy matchups list, xếp bài advice.
- Loading state khi AI xử lý.
- Basic user: ProtectedRoute redirect `/pricing` với premium upsell message.

**3.8 Creator Hub & Guides**

- `/guides`: danh sách guide dạng Card (title, comp preview, Edit/Xóa/Nhân bản actions).
- `/guides/create`: hex board editor, tướng drag-drop, item/augment selectors, Save Draft.
- `/guides/:guideId/edit`: load existing guide, same editor, Save.
- Ownership enforce: nếu response 403 → redirect `/guides`.
- ProtectedRoute tier="basic".

**3.9 Pricing & Subscription**

- `/pricing`: feature checklist Basic vs Premium, nút "Nâng cấp Premium" CTA (99,000 VNĐ/tháng).
- Nút upgrade → `POST /api/v1/subscription/create-payment-link` → redirect `checkoutUrl`.
- `/payment/success`: "Đang xác nhận thanh toán..." → poll `/api/v1/auth/me` mỗi 3s tối đa 30s → refresh tier.
- `/payment/cancel`: thông báo + nút tạo lại link.
- `/user/subscription`: tier hiện tại, `expires_at`, lịch sử payment, nút gia hạn.
- Banner nhắc gia hạn: hiển thị khi `tierExpiresAt - now < 3 days`.
- **KHÔNG tự nâng tier từ returnUrl** — chỉ từ polling `/me`.

**3.10 User Profile (`/user/profile`)**

- Thông tin cá nhân, tier badge, `tier_expires_at`.
- Link tắt đến `/user/subscription` và `/pricing`.
- Nút đăng xuất.

### PHASE 4 — Integration Check

```
agent: integration-checker
```

- Verify mọi API call đi qua `src/api/` layer, không call Supabase/Riot trực tiếp từ FE.
- Verify Zustand tier KHÔNG được dùng để tính entitlement cuối cùng — chỉ cho display.
- Verify `/payment/success` không nâng tier tức thì.
- Verify quota remaining lấy từ backend response.
- Verify tất cả routes trong Section 8.1 tồn tại và accessible đúng tier.
- Chạy `pnpm type-check` và fix tất cả errors.

### PHASE 5 — Test

```
agent: junior-test-writer
```

Tests bắt buộc:

- ProtectedRoute: guest → redirect auth, basic truy cập premium → redirect pricing.
- Auth flow: login success → Zustand populated; logout → state cleared.
- Payment success page: không nâng tier trước khi `/me` confirm.
- Quota locked state: khi API trả `quota_exceeded: true` → form disabled.
- Chạy `pnpm test` — fix cho đến khi pass.

### PHASE 6 — Final Quality Gate

```
/review-task apps/web
agent: senior-reviewer
```

- Review toàn bộ theo guardrails trong `GOAL_FE.md`.
- Kiểm tra: không có Riot API call từ FE, không có Supabase direct call, tier từ Zustand chỉ display.
- Chạy `pnpm run check` (format + lint + typecheck + test).

### PHASE 7 — Done Criteria Verification

```
/log-progress
agent: work-manager
```

- Tick từng done criteria trong `GOAL_FE.md`.
- Cập nhật `docs/progress/fe-goal-progress.md` → COMPLETED.
- **Nếu bất kỳ criteria nào chưa pass → quay lại phase tương ứng.**

---

## Stall Recovery

Nếu không có thay đổi file trong 5 phút:

1. Đọc lại `docs/progress/fe-goal-progress.md`.
2. Xác định section đang implement dở.
3. Chạy lại `/implement-task <section>` với `agent: junior-implementer`.
4. Nếu blocker do BE chưa có → mock API đúng contract, tiếp tục.

## Auto-Decision Log Format

```markdown
# DEC-YYYYMMDD-fe-<slug>

**Context:** <mô tả>
**Options:** A) ... B) ...
**Decision:** <chosen>
**Rationale:** <lý do>
```
