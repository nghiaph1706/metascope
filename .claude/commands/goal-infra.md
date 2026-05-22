# /goal-infra — Execute Infrastructure Goal

## Objective

Hoàn thành infrastructure goal theo `specs/goals/GOAL_INFRA.md` đến trạng thái COMPLETED.

## Inputs

- Goal source: `specs/goals/GOAL_INFRA.md`
- PRD liên quan: `specs/05_Environment_and_Deployment.md`
- Progress file: `docs/progress/infra-goal-progress.md`
- Decision log: `docs/decisions/DEC-YYYYMMDD-infra-<slug>.md`

## Execution Flow

1. Chạy `/work-status`, rà trạng thái Docker/CI/CD/runtime ops hiện tại, cập nhật progress file.
2. Thực thi theo các nhóm hạng mục trong goal file:
   - architecture sign-off
   - local docker/runtime config
   - CI/CD workflows
   - reverse proxy/process management
   - monitoring/ops/runbook
   - backup/restore verification
3. Dùng agent phù hợp theo từng nhóm (`senior-architect`, `ci-helper`, `ops-notes-keeper`, `senior-reviewer`).
4. Mọi quyết định vượt ngoài spec phải ghi decision log.

## Done Criteria

Chỉ COMPLETED khi mọi criteria trong `specs/goals/GOAL_INFRA.md` pass, gồm tối thiểu:

- Docker stack/health checks đạt yêu cầu.
- CI quality gate và deploy flow đạt yêu cầu goal file.
- Ops checklist/runbook tối thiểu được cập nhật theo goal file.
- `pnpm run check` pass clean (khi áp dụng).
- `docs/progress/infra-goal-progress.md` cập nhật COMPLETED.

## Escalation / Blocker Rule

- Nếu stalled >5 phút: đọc progress file, re-trigger phase đang dở.
- Nếu thiếu credentials/secrets: dùng placeholder an toàn, ghi DEC và tiếp tục phần không-blocking.
- Nếu mâu thuẫn tài liệu: ưu tiên `specs/goals/GOAL_INFRA.md` + PRD liên quan.
