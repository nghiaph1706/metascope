# DEC-20260521 — API entitlement/quota runtime dependencies

## Status

Accepted

## Context

`apps/api` đã có middleware chain cho auth boundary, entitlement guard, và quota guard. Để tiến tới runtime gần production:

- Entitlement cần đọc từ PostgreSQL (authoritative state của tier + expiry).
- Quota cần counter atomically qua Redis.

## Decision

1. `apps/api` dùng `DATABASE_URL` để khởi tạo Postgres entitlement reader.
2. `apps/api` dùng `REDIS_URL` để khởi tạo Redis quota store.
3. Runtime non-test fail-fast nếu thiếu một trong hai biến môi trường trên.
4. Test mode (`NODE_ENV=test`) dùng in-memory reader/store để test deterministic, không phụ thuộc external infra.

## Consequences

- Ưu điểm:
  - Bám guardrail backend authority cho entitlement/quota.
  - Quota increment mang tính atomic tốt hơn cho multi-request runtime.
- Đánh đổi:
  - Cần chuẩn hóa provisioning hạ tầng Redis/Postgres ở môi trường deploy.
  - Cần duy trì schema tối thiểu của bảng `users` với các cột entitlement liên quan.

## Required schema (minimum)

Bảng `users` cần có tối thiểu:

- `firebase_uid` (unique, canonical identity)
- `tier` (`basic` | `premium`)
- `tier_expires_at` (nullable timestamp)

## Follow-up

- Bổ sung migration SQL chính thức cho `users(firebase_uid, tier, tier_expires_at)` trong luồng DB migration của dự án.
- Thêm health probe check connectivity cho Redis/Postgres ở API startup readiness.
