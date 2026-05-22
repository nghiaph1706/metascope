# /goal-be — Execute Backend Goal

## Objective

Hoàn thành backend goal cho `apps/api` và `apps/worker` theo `specs/goals/GOAL_BE.md` đến trạng thái COMPLETED.

## Inputs

- Goal source: `specs/goals/GOAL_BE.md`
- PRD liên quan: `specs/01_Auth_and_Plans.md`, `specs/02_Features_and_Routing.md`, `specs/03_Backend_and_Data.md`, `specs/06_Payment_Security_Testing.md`
- Progress file: `docs/progress/be-goal-progress.md`
- Decision log: `docs/decisions/DEC-YYYYMMDD-be-<slug>.md`

## Execution Flow

1. Chạy `/work-status`, rà trạng thái hiện tại của `apps/api` + `apps/worker`, cập nhật progress file.
2. Thực thi chuỗi bắt buộc:
   - `senior-architect` → chốt boundaries/contracts
   - `senior-scaffolder` → scaffold theo contracts
   - `junior-implementer` → implement theo dependency order trong goal file
   - `integration-checker` → kiểm wiring, guards, side effects
   - `junior-test-writer` → bổ sung/chỉnh test cần thiết
   - `senior-reviewer` → quality gate cuối
3. Trong suốt quá trình: lỗi build/test thì fix và tiếp tục, không dừng giữa chừng.
4. Mọi clarification/override so với spec phải ghi decision log.

## Done Criteria

Chỉ đánh dấu COMPLETED khi tất cả điều kiện trong `specs/goals/GOAL_BE.md` đều pass, gồm tối thiểu:

- Mục tiêu backend trong goal file được tick đầy đủ.
- `pnpm run check` pass clean.
- Bộ test liên quan auth/quota/payment/entitlement pass.
- Docker verification pass theo tiêu chí goal file.
- `docs/progress/be-goal-progress.md` cập nhật COMPLETED.

## Escalation / Blocker Rule

- Nếu stalled (không có file change >5 phút): đọc progress file, xác định phase đang dở, re-trigger phase đó.
- Nếu conflict giữa command và spec: ưu tiên `specs/goals/GOAL_BE.md` và PRD `specs/*`.
- Nếu blocker cần quyết định quan trọng: chọn phương án bám guardrails, ghi DEC, rồi tiếp tục.
