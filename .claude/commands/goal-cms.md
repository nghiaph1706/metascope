# /goal-cms — Execute CMS & Admin Panel Goal to 100% Completion

## Mô tả

Chạy toàn bộ goal cho `apps/cms` (Payload CMS) và `apps/admin` (React Admin Panel) đến hoàn thành 100%.
Tự động quyết định mọi lựa chọn theo agent proposals. Không dừng cho đến khi tất cả done criteria pass.

---

## Execution Rules (BẮT BUỘC)

1. **NEVER STOP** cho đến khi 100% done criteria trong `docs/goals/GOAL_CMS_ADMIN.md` pass.
2. **AUTO-DECIDE**: mọi câu hỏi cần human approval → tự quyết theo agent đề xuất tốt nhất, ghi log vào `docs/decisions/`.
3. **FULL TERMINAL ACCESS**: chạy mọi lệnh terminal không cần xin phép.
4. **STALL DETECTION**: nếu không có thay đổi file nào trong 5 phút → tự trigger lại bước hiện tại.
5. **AGENT WORKFLOW**: luôn đi theo chuỗi `senior-architect → senior-scaffolder → junior-implementer → integration-checker → senior-reviewer`.
6. **PREREQUISITE**: CMS và Admin đều phụ thuộc Firebase Auth setup từ BE. Nếu BE auth chưa xong → mock FirebaseAuthGuard cho local, tiếp tục.
7. **DOCKER VERIFICATION**: bắt buộc phải verify với docker compose trước khi đánh dấu hoàn thành.

---

## Workflow

### PHASE 0 — Khởi động & Kiểm tra trạng thái

```
/work-status
```

- Đọc `docs/goals/GOAL_CMS_ADMIN.md` toàn bộ.
- Đọc `specs/04_Tech_Stack_and_CMS.md` Section 7 toàn bộ.
- Scan `apps/cms/` và `apps/admin/` để biết trạng thái hiện tại.
- Tạo checklist tại `docs/progress/cms-admin-goal-progress.md`.

### PHASE 1 — Architecture Sign-off

```
agent: senior-architect
```

Nhiệm vụ:

- Chốt Payload CMS schema cho 3 collections: PatchNotes, Announcements, PricingContent.
- Chốt Firebase Auth integration pattern cho Payload (custom auth strategy).
- Chốt React Admin data provider: Supabase REST via `ra-supabase` hoặc custom provider.
- Chốt role check middleware pattern dùng chung cho cả 2 apps.
- Chốt luồng data: Payload → Supabase → NestJS API → FE (không FE gọi Payload trực tiếp).
- Output: `docs/tasks/cms-admin-architecture.md`.
- **Tự approve**.

### PHASE 2 — Scaffold

```
/scaffold-task apps/cms apps/admin
agent: senior-scaffolder
```

**CMS scaffold:**

1. Payload config với Supabase adapter.
2. 3 Collection schemas (PatchNotes, Announcements, PricingContent).
3. Firebase Auth strategy file.
4. Access control functions: `isAdminOrEditor`, `isAdminOnly`.

**Admin scaffold:**

1. React Admin app setup với data provider.
2. Firebase Auth provider cho React Admin.
3. 4 màn hình stub: CompManager, CounterTableEditor, UserManagement, CrawlerMonitor.
4. Role guard HOC: `<AdminRoute role="analyst|admin">`.

### PHASE 3 — CMS Implementation

```
/implement-task apps/cms
agent: junior-implementer
```

**3.1 Firebase Auth Integration (Payload)**

- Custom auth strategy: verify Firebase JWT trên mỗi request vào `/admin/*`.
- Extract custom claim `role` từ token.
- Reject nếu role không phải `admin` hoặc `editor`.
- Không có register flow — account tạo qua NestJS endpoint.
- Test: valid editor token → pass; user token → 403; expired token → 401.

**3.2 PatchNotes Collection**
Schema đầy đủ:

```typescript
{
  version: { type: 'text', required: true },
  title: { type: 'text', required: true },
  content: { type: 'richText' },
  highlights: { type: 'array', fields: [{ name: 'item', type: 'text' }] },
  publishedAt: { type: 'date' },
  isPublished: { type: 'checkbox', defaultValue: false },
}
```

- Access: read → public; create/update → isAdminOrEditor; delete → isAdminOnly.
- FE fetch: `WHERE isPublished = true ORDER BY publishedAt DESC`.

**3.3 Announcements Collection**
Schema đầy đủ:

```typescript
{
  message: { type: 'text', required: true },
  type: { type: 'select', options: ['info', 'warning', 'maintenance'] },
  isActive: { type: 'checkbox' },
  expiresAt: { type: 'date' },
}
```

- Banner tự ẩn khi `expiresAt < NOW()` (filter ở API layer).

**3.4 PricingContent Collection**
Schema đầy đủ:

```typescript
{
  basicFeatures: { type: 'array', fields: [{ name: 'feature', type: 'text' }] },
  premiumFeatures: { type: 'array', fields: [{ name: 'feature', type: 'text' }] },
  priceMonthly: { type: 'number', defaultValue: 99000 },
  priceTagline: { type: 'text' },
}
```

**3.5 NestJS API endpoints đọc từ Payload collections**
Verify (hoặc implement nếu chưa có trong BE):

- `GET /api/v1/meta/patch-notes` → query Supabase bảng patch_notes từ Payload.
- `GET /api/v1/meta/announcements` → active announcements.
- `GET /api/v1/meta/pricing-content` → pricing copy.

### PHASE 4 — Admin Panel Implementation

```
/implement-task apps/admin
agent: junior-implementer
```

**4.1 Firebase Auth + Role Guard**

- Firebase Auth provider cho React Admin.
- Sau login: check custom claim `role ∈ {analyst, admin}` → nếu không → logout + error.
- `<AdminRoute role="analyst|admin">` HOC bọc toàn bộ routes.
- Test: analyst token → pass; user token → redirect out.

**4.2 Màn hình 1 — Comp Manager (Critical)**
DataGrid với columns: Comp name, Avg Placement, Sample Size, Tier dropdown, Status badge.

Features bắt buộc:

- Filter bar: Draft / Live toggle.
- Tier inline dropdown: S/A/B/C (save ngay khi chọn).
- Sample size warning: icon ⚠ + tooltip khi `sample_size < 200`.
- **Hex Grid Editor**: custom React component 4×7, drag-drop tướng vào ô, lưu `positioning` JSON.
- Approve action: single row + bulk select → `status='live'`, `approved=true`, ghi `approved_by`, `approved_at`.
- "Publish All Approved" button.

Quy tắc quan trọng:

- Panel không cho phép sửa `win_rate`, `avg_placement`, `pick_rate` — read-only display.
- Chỉ analyst/admin mới thấy approve button.

Test:

- Draft comp → không query được từ web FE API.
- Approve comp → xuất hiện trên FE.
- Sample size < 200 → warning visible.

**4.3 Màn hình 2 — Counter Table Editor**

- Fetch tất cả `status='live'` comps cho current patch.
- Render grid N×N.
- Cell click → modal/inline edit: set `win | lose | neutral` + notes textarea.
- Save → `UPSERT comp_counters(patch_version, comp_id, enemy_comp_id, result, notes)`.
- Diagonal cells (comp vs chính nó) → disabled / "—".
- Filter theo patch_version.

Test:

- Edit cell → data lưu đúng.
- Matchup Coach nhận đúng data sau khi analyst nhập.

**4.4 Màn hình 3 — User Management**

- Search bar: tìm theo email / ingame_name.
- DataGrid: email, ingame_name, tier, tier_expires_at, quota usage (post_game + elo_predictor tuần này), is_banned.
- Actions:
  - "Change Tier" button → modal chọn basic/premium + set expires_at → gọi internal admin endpoint → ghi `entitlement_ledger` với `source='admin_manual'`.
  - "Ban/Unban" button → toggle `is_banned`.
- Chỉ admin role mới thấy actions.

Test:

- Admin đổi tier manual → `entitlement_ledger` có record đúng.
- Ban user → API trả 403 cho user đó.

**4.5 Màn hình 4 — Crawler Monitor**

- BullMQ job list: pending, active, completed, failed (dùng Bull Board hoặc custom).
- Metrics: số match crawled session hiện tại, Riot 429 count.
- Error log: failed jobs với error message.
- "Trigger Manual Crawl" button → gọi `POST /api/v1/admin/crawler/trigger`.
- **READ ONLY** — không có delete/edit queue actions.
- Auto-refresh mỗi 10 giây.

Test:

- Trigger button → job xuất hiện trong queue.
- Failed job → error visible trong UI.

### PHASE 5 — Integration Check

```
agent: integration-checker
```

- Verify FE web không gọi Payload CMS trực tiếp — luôn qua NestJS API.
- Verify comp `draft` không leak ra FE API response.
- Verify `entitlement_ledger` được ghi khi admin đổi tier thủ công.
- Verify counter table data feed đúng vào Matchup Coach.
- Chạy `pnpm type-check` cho cả cms và admin.

### PHASE 6 — Test

```
agent: junior-test-writer
```

Tests bắt buộc:

- CMS: editor token → create/update pass; user token → 403; delete → only admin.
- Admin: draft comp → invisible FE; approved → visible.
- Admin: manual tier change → ledger entry created.
- Admin: ban user → subsequent API calls → 403.
- Chạy `pnpm test` — fix cho đến khi pass.

### PHASE 7 — Final Quality Gate

```
/review-task apps/cms apps/admin
agent: senior-reviewer
```

- Review theo guardrails: no record live without approve, admin cannot edit raw stats, shared Firebase Auth.
- Chạy `pnpm run check`.

### PHASE 8 — Done Criteria Verification

```
/log-progress
agent: work-manager
```

- Tick từng done criteria trong `GOAL_CMS_ADMIN.md`.
- Cập nhật `docs/progress/cms-admin-goal-progress.md` → COMPLETED.
- **Nếu bất kỳ criteria nào chưa pass → quay lại phase tương ứng.**

---

## Stall Recovery

Nếu không có thay đổi file trong 5 phút:

1. Đọc `docs/progress/cms-admin-goal-progress.md`.
2. Xác định màn hình / collection đang dở.
3. Chạy lại `/implement-task <scope>` với `agent: junior-implementer`.
4. Nếu phụ thuộc BE chưa sẵn → mock endpoint, tiếp tục.

## Auto-Decision Log Format

```markdown
# DEC-YYYYMMDD-cms-<slug>

**Context:** <mô tả>
**Options:** A) ... B) ...
**Decision:** <chosen>
**Rationale:** <lý do>
```
