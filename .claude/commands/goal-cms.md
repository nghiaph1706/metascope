# /goal-cms — Execute CMS & Admin Goal

## Objective

Hoàn thành goal cho `apps/cms` và `apps/admin` theo `specs/goals/GOAL_CMS_ADMIN.md` đến trạng thái COMPLETED.

## Inputs

- Goal source: `specs/goals/GOAL_CMS_ADMIN.md`
- PRD liên quan: `specs/04_Tech_Stack_and_CMS.md`
- Progress file: `docs/progress/cms-admin-goal-progress.md`
- Decision log: `docs/decisions/DEC-YYYYMMDD-cms-<slug>.md`

## Execution Flow

1. Chạy `/work-status`, rà trạng thái `apps/cms` + `apps/admin`, cập nhật progress file.
2. Thực thi chuỗi bắt buộc:
   - `senior-architect`
   - `senior-scaffolder`
   - `junior-implementer`
   - `integration-checker`
   - `junior-test-writer`
   - `senior-reviewer`
3. Bám dependency trong goal file (auth, role guard, publish flow, admin actions, integration với backend).
4. Mọi thay đổi vượt ngoài spec phải ghi decision log trước khi tiếp tục.

## Done Criteria

Chỉ COMPLETED khi tất cả criteria trong `specs/goals/GOAL_CMS_ADMIN.md` pass, gồm tối thiểu:

- CMS/Admin behavior đúng role/access/publish rules theo goal file.
- Không leak draft/unapproved data ra web API.
- `pnpm run check` pass clean.
- Docker verification pass theo goal file.
- `docs/progress/cms-admin-goal-progress.md` cập nhật COMPLETED.

## Escalation / Blocker Rule

- Nếu stalled >5 phút: đọc progress file, re-trigger phase đang dở.
- Nếu BE dependency chưa sẵn: dùng mock đúng contract, ghi rõ trong progress/DEC và tiếp tục.
- Nếu mâu thuẫn tài liệu: ưu tiên `specs/goals/GOAL_CMS_ADMIN.md` + PRD liên quan.
