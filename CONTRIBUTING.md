# Contributing Guide

Cảm ơn bạn đã đóng góp cho MetaScope.

## 1) Branching rules

- Không làm việc trực tiếp trên `main`.
- Tạo branch từ `main` trước khi code.
- Đặt tên branch rõ ràng, ví dụ:
  - `feat/<scope>`
  - `fix/<scope>`
  - `chore/<scope>`

Ví dụ:

```bash
git checkout -b feat/cms-bootstrap
```

## 2) Commit message rules (Conventional Commits)

Project enforce commit message qua `commitlint`.

Format:

```txt
<type>: <short description>
```

Types thường dùng:

- `feat`
- `fix`
- `chore`
- `docs`
- `refactor`
- `test`

Ví dụ hợp lệ:

```txt
feat: add cms runtime bootstrap
fix: update pre-push guard for main branch
docs: add contributing guide
```

Ví dụ không hợp lệ:

```txt
update stuff
misc changes
```

## 3) Local quality gate

Trước khi mở PR, chạy:

```bash
pnpm run check
```

Bao gồm:

- `format:check`
- `lint`
- `typecheck`

## 4) Git hooks

Hooks được setup qua Husky:

- `pre-commit`: chạy `lint-staged` trên staged files.
- `commit-msg`: validate commit message bằng commitlint.
- `pre-push`: chặn push `main` và chạy `pnpm run check`.

Nếu hooks chưa hoạt động, chạy lại:

```bash
pnpm install
```

## 5) Pull request

- Mỗi PR nên có scope rõ ràng, nhỏ vừa đủ review.
- Mô tả mục tiêu thay đổi và cách test trong PR description.
- Đảm bảo CI pass trước khi merge.

## 6) Guardrails cần tuân thủ

Theo `CLAUDE.md`:

- Backend API là authority cho entitlement/quota.
- Firebase UID là canonical auth identity ở backend.
- Frontend/CMS không tự quyết entitlement/quota.
- Không implement Live Tracker.
