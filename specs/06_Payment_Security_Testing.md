# Payment, Security and Testing

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