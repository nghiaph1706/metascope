# /goal-all — Execute All Goals to 100% Completion

## Mô tả

Chạy toàn bộ 4 goals (INFRA → BE → CMS → FE) theo đúng thứ tự dependency đến hoàn thành 100%.
Master command điều phối tất cả sub-goals.

---

## Execution Rules (BẮT BUỘC)

1. **NEVER STOP** cho đến khi 100% done criteria của TẤT CẢ 4 goals pass.
2. **AUTO-DECIDE**: tự quyết mọi lựa chọn theo agent đề xuất, ghi log.
3. **FULL TERMINAL ACCESS**: chạy mọi lệnh không cần xin phép.
4. **STALL DETECTION**: không có thay đổi file trong 5 phút → tự trigger lại.
5. **SEQUENTIAL với PARALLEL khi có thể**: INFRA phải xong trước. Sau đó BE + CMS có thể chạy song song. FE chạy sau khi BE module tương ứng done.
6. **DOCKER VERIFICATION**: bắt buộc phải verify với docker compose trước khi đánh dấu hoàn thành.

---

## Thứ tự thực thi

```
STEP 1: /goal-infra          ← Bắt buộc xong trước (Docker local + CI/CD + DB schema)
         ↓
STEP 2: /goal-be             ← API + Worker (song song với CMS nếu có thể)
         ↓ (có thể parallel)
STEP 3: /goal-cms            ← CMS + Admin Panel
         ↓ (sau khi BE auth done)
STEP 4: /goal-fe             ← Frontend (wire real APIs dần dần)
```

### Khi chạy từng step

**STEP 1 — INFRA:**

- Copy `commands/goal-infra.md` thành `.claude/commands/goal-infra.md` nếu chưa có.
- Chạy `/goal-infra`.
- Chờ `docs/progress/infra-goal-progress.md` → status COMPLETED.
- Không tiếp tục STEP 2 cho đến khi INFRA COMPLETED.

**STEP 2 — BE:**

- Copy `commands/goal-be.md` thành `.claude/commands/goal-be.md`.
- Chạy `/goal-be`.
- Track progress tại `docs/progress/be-goal-progress.md`.

**STEP 3 — CMS (parallel với BE nếu BE Phase 1+2 đã xong):**

- Copy `commands/goal-cms.md` thành `.claude/commands/goal-cms.md`.
- Chạy `/goal-cms`.
- Track progress tại `docs/progress/cms-admin-goal-progress.md`.

**STEP 4 — FE (bắt đầu sau khi BE auth + meta endpoints done):**

- Copy `commands/goal-fe.md` thành `.claude/commands/goal-fe.md`.
- Chạy `/goal-fe`.
- Track progress tại `docs/progress/fe-goal-progress.md`.

---

## Master Progress Tracking

Tạo và cập nhật `docs/progress/all-goals-status.md`:

```markdown
# MetaScope — All Goals Status

Last updated: <timestamp>

| Goal  | Status                   | Blocking       |
| ----- | ------------------------ | -------------- |
| INFRA | 🔄 In Progress / ✅ DONE | —              |
| BE    | ⏳ Waiting / 🔄 / ✅     | INFRA          |
| CMS   | ⏳ / 🔄 / ✅             | BE Auth        |
| FE    | ⏳ / 🔄 / ✅             | BE Meta + Auth |

## Current blockers

<none / list>

## Decisions made

- DEC-YYYYMMDD-<slug>: <summary>
```

Cập nhật file này mỗi khi một goal thay đổi status.

---

## Global Stall Recovery

Nếu bất kỳ goal nào không có file changes trong 5 phút:

1. Check `docs/progress/all-goals-status.md`.
2. Xác định goal đang chạy.
3. Re-trigger goal đó: `/goal-<name>`.
4. Nếu goal bị blocked bởi goal khác chưa xong → focus vào blocker trước.

---

## Final Verification

Sau khi tất cả 4 goals COMPLETED:

```
agent: senior-reviewer
```

- Chạy `pnpm run check` toàn monorepo — phải pass clean.
- Chạy `docker compose up` — tất cả services healthy.
- Verify `docs/ops/pre-launch-checklist.md` — tất cả checked.
- Output: `docs/progress/LAUNCH-READY.md` với timestamp và sign-off.
