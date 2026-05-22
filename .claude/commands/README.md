# MetaScope — Claude Code Commands

## Cách cài đặt

Các command đã được đặt sẵn trong `.claude/commands/` của repo này.

Nếu cần đồng bộ sang repo khác, copy trực tiếp từ thư mục hiện tại:

```bash
cp .claude/commands/goal-*.md <target-repo>/.claude/commands/
```

---

## Cách dùng trong Claude Code

### Chạy từng goal riêng lẻ

```
/goal-infra   ← Infra: Docker, CI/CD, Nginx, Monitoring
/goal-be      ← Backend: API + Worker
/goal-cms     ← CMS + Admin Panel
/goal-fe      ← Frontend Web App
```

### Chạy tất cả theo thứ tự đúng

```
/goal-all
```

---

## Thứ tự dependency

```
INFRA → BE → CMS → FE
              ↑
         (parallel với BE sau khi BE auth done)
```

---

## Tóm tắt behavior của mỗi command

| Behavior          | Mô tả                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| Auto-decision     | Tự quyết mọi lựa chọn theo agent đề xuất, không hỏi human                 |
| Never stop        | Không dừng cho đến khi 100% done criteria pass                            |
| Full terminal     | Chạy mọi lệnh terminal không xin phép                                     |
| Stall detection   | Không có file change trong 5 phút → tự trigger lại                        |
| Agent workflow    | Luôn theo chuỗi architect → scaffolder → implementer → checker → reviewer |
| Decision log      | Mọi auto-decision ghi vào `docs/decisions/DEC-YYYYMMDD-*.md`              |
| Progress tracking | Mỗi goal có file `docs/progress/<goal>-goal-progress.md`                  |

---

## Goal files tham chiếu

Mỗi command đọc goal file tương ứng trong `specs/goals/`:

| Command       | Goal file                       | Progress file                              |
| ------------- | ------------------------------- | ------------------------------------------ |
| `/goal-be`    | `specs/goals/GOAL_BE.md`        | `docs/progress/be-goal-progress.md`        |
| `/goal-fe`    | `specs/goals/GOAL_FE.md`        | `docs/progress/fe-goal-progress.md`        |
| `/goal-cms`   | `specs/goals/GOAL_CMS_ADMIN.md` | `docs/progress/cms-admin-goal-progress.md` |
| `/goal-infra` | `specs/goals/GOAL_INFRA.md`     | `docs/progress/infra-goal-progress.md`     |
| `/goal-all`   | Tất cả                          | `docs/progress/all-goals-status.md`        |
