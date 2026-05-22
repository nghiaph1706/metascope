# /goal-fe — Execute Frontend Goal

## Objective

Hoàn thành frontend goal cho `apps/web` theo `specs/goals/GOAL_FE.md` đến trạng thái COMPLETED.

## Inputs

- Goal source: `specs/goals/GOAL_FE.md`
- PRD liên quan: `specs/02_Features_and_Routing.md`
- Foundation: `base-template/src/`
- Progress file: `docs/progress/fe-goal-progress.md`
- Decision log: `docs/decisions/DEC-YYYYMMDD-fe-<slug>.md`

## Execution Flow

1. Chạy `/work-status`, rà trạng thái `apps/web` + `base-template/src`, cập nhật progress file.
2. Thực thi chuỗi bắt buộc:
   - `senior-architect`
   - `senior-scaffolder`
   - `junior-implementer`
   - `integration-checker`
   - `junior-test-writer`
   - `senior-reviewer`
3. Route/auth/tier/quota UX phải bám goal file; entitlement/quota authority luôn ở backend.
4. Nếu backend endpoint chưa sẵn: mock theo contract và ghi lại để wire lại sau.

## Done Criteria

Chỉ COMPLETED khi toàn bộ criteria trong `specs/goals/GOAL_FE.md` pass, gồm tối thiểu:

- Route map, protected routes, tool/payment flows đạt yêu cầu goal file.
- Không tự nâng tier từ return URL/callback.
- `pnpm run check` pass clean.
- Docker verification pass theo goal file.
- `docs/progress/fe-goal-progress.md` cập nhật COMPLETED.

## Escalation / Blocker Rule

- Nếu stalled >5 phút: đọc progress file, re-trigger phase đang dở.
- Nếu dependency BE chưa xong: mock đúng contract + ghi DEC/progress.
- Nếu mâu thuẫn tài liệu: ưu tiên `specs/goals/GOAL_FE.md` + PRD liên quan.
