# /goal-all — Execute All Goals

## Objective

Điều phối toàn bộ goals đến 100% theo dependency chính thức: `INFRA → BE → CMS → FE`.

## Inputs

- Goal index: `specs/goals/README.md`
- Goal files:
  - `specs/goals/GOAL_INFRA.md`
  - `specs/goals/GOAL_BE.md`
  - `specs/goals/GOAL_CMS_ADMIN.md`
  - `specs/goals/GOAL_FE.md`
- Master progress file: `docs/progress/all-goals-status.md`
- Decision log: `docs/decisions/DEC-YYYYMMDD-<slug>.md`

## Execution Flow

1. Chạy `/work-status`, khởi tạo/cập nhật `docs/progress/all-goals-status.md`.
2. Chạy tuần tự theo dependency:
   - `/goal-infra`
   - `/goal-be`
   - `/goal-cms`
   - `/goal-fe`
3. Chỉ chuyển bước khi goal trước đạt COMPLETED theo progress file tương ứng.
4. Nếu phù hợp dependency nội bộ, có thể cho BE/CMS song song ở các phần không chặn nhau, nhưng không phá thứ tự authority.
5. Sau mỗi bước: cập nhật master progress + blocker list + decision notes.

## Done Criteria

Chỉ COMPLETED khi cả 4 goals đều COMPLETED và xác minh cuối pass:

- `pnpm run check` toàn monorepo pass clean.
- Docker verification pass.
- Các checklist vận hành quan trọng trong docs/progress/ops được tick theo goal files.
- Xuất trạng thái launch-ready trong progress docs.

## Escalation / Blocker Rule

- Nếu stalled >5 phút: xác định goal đang chạy từ master progress, re-trigger đúng goal đó.
- Nếu goal đang blocked bởi dependency chưa xong: chuyển xử lý blocker trước.
- Nếu mâu thuẫn tài liệu: ưu tiên `specs/goals/*` và `specs/*`; mọi override phải ghi DEC.
