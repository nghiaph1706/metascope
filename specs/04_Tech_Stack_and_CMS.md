# Tech Stack and CMS

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

