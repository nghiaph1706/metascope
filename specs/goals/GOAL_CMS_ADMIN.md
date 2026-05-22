# GOAL: CMS & Admin Panel (`apps/cms` + `apps/admin`)

## Tổng quan vai trò

Hai tool quản lý nội bộ tách biệt phục vụ 2 loại data khác nhau. Cả hai dùng chung Firebase Auth, phân quyền qua Custom Claims — **không có hệ thống login riêng**.

| Tool              | Mục đích                                                      | Audience       |
| ----------------- | ------------------------------------------------------------- | -------------- |
| Payload CMS       | Content tĩnh: patch notes, announcements, pricing text        | Editor, Admin  |
| React Admin Panel | Game data: tier list, counter table, user management, crawler | Analyst, Admin |

---

## Phần A — Payload CMS (`apps/cms`)

### Mục tiêu

Cho phép editor viết và quản lý content tĩnh mà không cần deploy lại code.

### 1. Firebase Auth Integration

- **Goal:** Chặn mọi truy cập CMS với user không có Firebase custom claim phù hợp.
- Verify Firebase JWT mỗi request vào `/admin/*`.
- Chỉ cho phép: `role='admin'` hoặc `role='editor'`.
- Không có form đăng ký riêng — account do admin tạo và set custom claim qua NestJS endpoint.

**Done criteria:**

- [ ] User `role='user'` truy cập CMS → bị chặn 403.
- [ ] Token expired → redirect login.

---

### 2. Collections

#### 2a. Patch Notes

Schema:

```
version: string           // '14.10'
title: string             // 'Patch 14.10 — Cân bằng hệ Mythic'
content: richText         // block editor (bold, image, list)
highlights: string[]      // tóm tắt thay đổi lớn
publishedAt: date
isPublished: boolean      // Draft / Published
```

- Editor viết xong → toggle `isPublished = true` → xuất hiện trên web.
- Web FE chỉ fetch `WHERE isPublished = true`.

#### 2b. Announcements

Schema:

```
message: string
type: 'info' | 'warning' | 'maintenance'
isActive: boolean
expiresAt: date           // tự ẩn sau ngày này
```

- Hiển thị dạng banner trên web; tự ẩn khi quá `expiresAt`.

#### 2c. Pricing Content

Schema:

```
basicFeatures: string[]   // danh sách tính năng Basic
premiumFeatures: string[] // danh sách tính năng Premium
priceMonthly: number      // 99000
priceTagline: string      // 'Giá tốt nhất cho leo rank'
```

- Cho phép thay đổi copy trang `/pricing` không cần deploy.

**Done criteria:**

- [ ] Ba collections render admin UI từ schema tự động (Payload native).
- [ ] Data lưu vào Supabase PostgreSQL (không vendor lock-in).
- [ ] FE fetch `GET /api/v1/meta/patch-notes` trả đúng content đã publish.

---

### 3. Access Control

```typescript
access: {
  read: () => true,              // Public read cho FE
  create: isAdminOrEditor,
  update: isAdminOrEditor,
  delete: isAdminOnly,
}
```

**Done criteria:**

- [ ] Editor tạo/sửa được, nhưng không xóa được.
- [ ] Admin toàn quyền.

---

### 4. Data Flow

```
Editor viết Patch Note → Payload lưu vào Supabase
→ FE gọi NestJS GET /api/v1/meta/patch-notes
→ NestJS đọc DB + cache → trả về FE
```

- FE không gọi Payload trực tiếp — luôn qua NestJS API.

---

## Phần B — React Admin Panel (`apps/admin`)

### Mục tiêu

Cho analyst/admin quản lý game data sau mỗi patch và vận hành hệ thống.

### 1. Firebase Auth Integration (dùng chung với CMS)

- Chỉ cho phép: `role='analyst'` hoặc `role='admin'`.
- Verify Firebase JWT; check custom claim trước khi render bất kỳ màn hình nào.

---

### 2. Màn hình 1 — Comp Manager (Critical)

**Goal:** Workflow chuẩn để analyst review và approve comp sau mỗi patch crawl.

Luồng:

1. Crawler chạy xong → comp có `status='draft'`.
2. Analyst vào Comp Manager, thấy danh sách comps với aggregate stats.
3. Gán Tier S/A/B/C cho từng comp.
4. Kéo thả icon tướng lên hex grid 4×7 để set positioning (custom React component).
5. Bấm Approve → `status='live'` → comp xuất hiện trên web.

UI cần có:

- DataGrid với cột: Comp name, Avg Placement, Sample Size, Tier (dropdown), Status.
- Cảnh báo ⚠ khi `sample_size < 200` — analyst cần cẩn thận khi set tier.
- Filter: Draft / Live.
- Action: Approve Selected, Publish All Approved.
- Hex grid editor (kéo thả tướng vào vị trí).

**Quy tắc quan trọng:**

- Admin panel **không tự tính win rate** — chỉ hiển thị số liệu từ pipeline aggregate.
- Chỉ analyst/admin mới được approve; không có auto-approve.
- Web FE chỉ query `WHERE status = 'live' AND approved = true`.

**Done criteria:**

- [ ] Comp `draft` không xuất hiện trên web FE dù API được gọi đúng.
- [ ] Sample size warning hiển thị đúng khi `< 200`.
- [ ] Approve action update đúng `status='live'` và `approved=true`.

---

### 3. Màn hình 2 — Counter Table Editor

**Goal:** Analyst nhập tay quan hệ counter giữa các comp để feed Matchup Coach.

UI:

- Grid N×N các comp.
- Click ô → set `win | lose | neutral` + optional notes.
- Lưu vào `comp_counters(patch_version, comp_id, enemy_comp_id, result, notes)`.

**Quy tắc quan trọng:**

- Counter table do **người set, không do AI**. Matchup Coach đọc từ bảng này.
- Analyst phải cập nhật sau mỗi patch lớn có thay đổi meta.

**Done criteria:**

- [ ] Mọi ô trong grid có thể edit và lưu.
- [ ] Data được lưu đúng `patch_version` hiện tại.
- [ ] Matchup Coach trả kết quả phản ánh đúng data vừa nhập.

---

### 4. Màn hình 3 — User Management

**Goal:** Admin hỗ trợ tìm kiếm, xem và can thiệp tài khoản người dùng.

Chức năng:

- Tìm kiếm user theo email / ingame name.
- Xem: tier hiện tại, `tier_expires_at`, quota usage trong kỳ.
- Đổi tier thủ công (hỗ trợ khách hàng) — ghi vào `entitlement_ledger` với `source='admin_manual'`.
- Ban/unban tài khoản (`is_banned = true/false`).

**Done criteria:**

- [ ] Đổi tier thủ công ghi đúng `entitlement_ledger`.
- [ ] Ban user → user không thể login hoặc gọi API.

---

### 5. Màn hình 4 — Crawler Monitor

**Goal:** Visibility vào trạng thái crawler jobs.

Hiển thị (read-only):

- Job đang chạy / queue / failed (từ BullMQ).
- Số match đã crawl trong session hiện tại.
- Log lỗi khi Riot API trả 429 hoặc timeout.

Actions:

- Trigger crawl thủ công (dùng khi patch mới chưa đến schedule).
- **Không** được xóa job hoặc sửa data trong queue.

**Done criteria:**

- [ ] Dashboard live cập nhật trạng thái jobs.
- [ ] Trigger thủ công thêm job vào BullMQ queue đúng cách.
- [ ] Không có action nào cho phép sửa/xóa queue data.

---

## Role Matrix

| Role      | Payload CMS         | React Admin                     |
| --------- | ------------------- | ------------------------------- |
| `user`    | ❌                  | ❌                              |
| `editor`  | ✅ Viết/sửa content | ❌                              |
| `analyst` | ❌                  | ✅ Comp Manager + Counter Table |
| `admin`   | ✅ Toàn quyền       | ✅ Toàn quyền                   |

Set custom claim (chỉ superadmin gọi được):

```typescript
await firebaseAdmin.auth().setCustomUserClaims(uid, { role: "analyst" });
```

---

## Guardrails bắt buộc

| Rule                                 | Mô tả                                                      |
| ------------------------------------ | ---------------------------------------------------------- |
| No record xuất hiện khi chưa approve | `status='draft'` mặc định sau crawl; phải approve mới live |
| Admin không sửa số liệu thô          | Chỉ gán Tier và approve — win rate là output của pipeline  |
| Firebase Auth dùng chung             | Không có login system riêng cho CMS hay Admin              |
| Counter table manual                 | Không auto-generate — analyst nhập tay sau mỗi patch       |
| Crawler Monitor read-only            | Monitor chỉ xem + trigger, không xóa/sửa queue             |
