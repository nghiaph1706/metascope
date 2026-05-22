# CLAUDE.md — MetaScope Operating Manual

## 1) Project Overview

MetaScope là nền tảng hỗ trợ người chơi TFT, triển khai theo hướng **backend-focused TypeScript monorepo**.

Phạm vi sản phẩm chính:

- Meta library: comps/champions/traits/items/roll odds/patch notes.
- Player stats (yêu cầu auth).
- AI tools: Elo Predictor, Post-Game Analysis, Matchup Coach (Premium).
- Creator Hub / guides.
- Subscription flow (PayOS).
- Entitlement/quota enforcement server-side.

Mô hình vận hành:

- Frontend là trải nghiệm người dùng.
- Backend là source of truth cho identity, entitlement, quota, billing state.

**Out of scope tuyệt đối:**

- MUST NOT implement Live Tracker (đã loại do rate-limit/bottleneck risk).

---

## 2) Sources of Truth

Nguồn sự thật chức năng:

- Primary PRD: `specs/README.md` (đã được chia nhỏ thành các file).
- Quyết định/chỉnh sửa bổ sung hiện hành: `docs/decisions/*.md`.
- `notes.html` chỉ là legacy reference, không phải nguồn authority mới.

Nguồn sự thật vận hành nội bộ:

- Agents: `.claude/agents/`.
- Commands: `.claude/commands/`.

Tài liệu nên chuẩn hóa dần sang markdown:

- Khuyến nghị đặt tại `docs/` (xem mục 9).

Quy tắc ra quyết định:

- Khi thiếu thông tin, MUST ưu tiên PRD + decision notes.
- MUST NOT tự suy đoán business rules nếu chưa có nguồn xác nhận.

---

## 3) Architecture Guardrails

### MUST

- MUST dùng **Firebase UID** làm auth identity canonical.
- MUST enforce entitlement/quota ở backend theo PRD (section 5.5).
- MUST treat frontend tier/quota chỉ là hiển thị, không phải authority.
- MUST hỗ trợ idempotency key cho AI tool endpoints khi PRD yêu cầu.
- MUST verify chữ ký webhook payment (PayOS) trước khi đổi entitlement.
- MUST xử lý payment update theo hướng idempotent + atomic.
- MUST kiểm tra tier expiry tại request-time cho premium-gated features.
- MUST tuân thủ Riot ToS và policy liên quan dữ liệu/mức truy cập.

### MUST NOT

- MUST NOT cấp premium/quota từ client state.
- MUST NOT cấp entitlement dựa trên payment returnUrl/client callback.
- MUST NOT đề xuất workaround vi phạm Riot ToS.
- MUST NOT implement Live Tracker.

### Data/backend orientation

- PostgreSQL: transactional source of truth.
- Redis: quota counters, fast state, atomic scripts.
- OpenSearch: search/read model phased rollout.

---

## 4) Repo Structure

Thư mục quan trọng:

- `.claude/agents/`: định nghĩa specialist agents.
- `.claude/commands/`: command workflows để điều phối agents.
- `.claude/agent-memory/`: dữ liệu hỗ trợ ngữ cảnh cho agent workflows.
- `.claude/worktrees/`: vùng làm việc tách biệt khi chạy agent/worktree.
- `specs/`: product specifications (PRD chính).
- `base-template/src/`: UI seed/foundation cho frontend.
- `notes.html`: legacy notes, chỉ dùng tham chiếu lịch sử khi chưa migrate.

Vai trò `base-template/src/`:

- Foundation cho views/components/routes ban đầu.
- Chứa mock/static data để bootstrap UI.
- Là điểm xuất phát để wire API thật theo PRD.

Khuyến nghị vị trí tài liệu chuẩn hóa:

- `docs/decisions/`
- `docs/progress/`
- `docs/tasks/`
- package-level `README.md` cho từng package quan trọng.

---

## 5) UI / Frontend Implementation Notes

- `base-template/src/` là UI foundation, không phải source of truth nghiệp vụ.
- Ưu tiên thay mock data bằng API contracts bám PRD.
- Route mapping/auth gates/tier gates/quota UX states MUST nhất quán PRD.
- Frontend MUST hiển thị đúng trạng thái quota/tier từ backend response.
- Frontend MUST NOT tự tính entitlement/quota như quyết định cuối cùng.

Phase khuyến nghị:

1. Scaffold views + route skeleton.
2. Wire API layer theo contract.
3. Gắn auth và tier gates.
4. Bổ sung quota/limit UX states.

---

## 6) Agent Workflow

### A. Spec / analysis / planning

- `spec-clarifier`
- `spec-consistency-checker`
- `acceptance-criteria-converter`
- `business-logic-challenger`
- `technical-feasibility-auditor`
- `task-breakdown-planner`
- `dependency-risk-mapper`
- `implementation-slice-planner`
- `checklist-generator`

Dùng khi: scope mơ hồ, cần làm rõ logic, chuyển spec thành task/AC/checklist.

### B. Orchestration

- `spec-reviewer-orchestrator`
- `spec-workflow-orchestrator`

Dùng khi: cần review spec end-to-end hoặc chạy full spec-to-planning workflow.

### C. Implementation / review

- `senior-architect`
- `senior-scaffolder`
- `junior-implementer`
- `junior-test-writer`
- `integration-checker`
- `senior-reviewer`

Dùng khi: bắt đầu coding, scaffold, implement, kiểm integration, quality gate cuối.

### D. Docs / CI / Ops / Async

- `docs-librarian`
- `ci-helper`
- `ops-notes-keeper`
- `work-manager`

Dùng khi: chống docs drift, sửa CI/CD, ghi incident/decision notes, nén trạng thái & xin quyết định async.

Quy tắc chung:

- Specialist agents bổ trợ nhau, không thay thế lẫn nhau.
- Chọn agent theo loại vấn đề, không dùng 1 agent cho mọi việc.

---

## 7) Command Workflow

### Spec workflow commands

- `review-spec`
- `challenge-feature`
- `spec-to-ac`
- `spec-review-full`
- `plan-from-spec`
- `checklist-from-spec`
- `next-implementation-slice`

### Task execution commands

- `design-task`
- `scaffold-task`
- `implement-task`
- `review-task`
- `execute-task-full`

### Async work management commands

- `work-status`
- `request-decision`
- `log-progress`

Recommended flows:

- Spec chưa rõ: `spec-review-full` → `plan-from-spec`.
- Chuẩn bị coding: `design-task` → `scaffold-task`.
- Thực thi E2E: `implement-task` hoặc `execute-task-full`.
- Trước merge: `review-task` + `senior-reviewer` gate.
- Workflow dài/remote: dùng bộ `work-status` / `request-decision` / `log-progress`.

Ví dụ lệnh:

- `/spec-review-full specs/README.md`
- `/plan-from-spec specs/README.md`
- `/design-task <task-scope>`
- `/execute-task-full <approved-scope>`
- `/work-status`
- `/request-decision`
- `/log-progress`

---

## 8) Async

Project hỗ trợ điều phối công việc dài và theo dõi từ xa qua Channels.

Nguyên tắc:

- Claude có thể chạy tác vụ dài, nhưng luôn **human-in-the-loop**.
- Không coi async workflow là fully autonomous không kiểm soát.

Dùng command:

- `work-status`: nén trạng thái hiện tại, blockers, decision points.
- `request-decision`: đóng gói câu hỏi ngắn, dạng yes/no hoặc A/B/C.
- `log-progress`: checkpoint tiến độ, mốc đã hoàn tất, bước kế tiếp.

Khi có blocker:

- Escalate sớm bằng `request-decision` thay vì tự đoán và tiếp tục sai hướng.

---

## 9) Documentation, Decisions, and Progress

Vai trò agents:

- `docs-librarian`: chuẩn hóa/cập nhật docs, giữ docs đồng bộ implementation.
- `ops-notes-keeper`: ghi decision log, incident notes, operational context.
- `work-manager`: nén trạng thái, đề nghị quyết định ngắn gọn khi chạy async.

Khuyến nghị cấu trúc tài liệu:

- `docs/decisions/DEC-YYYYMMDD-<slug>.md`
- `docs/progress/YYYY-MM-DD.md`
- `docs/tasks/<epic-or-scope>.md`
- `<package>/README.md` cho intent, boundaries, entrypoints.

Yêu cầu bảo trì:

- MUST cập nhật docs khi thay đổi kiến trúc, workflow, contract hoặc guardrail.
- MUST migrate dần nội dung hữu ích từ `notes.html` sang markdown có cấu trúc.

---

## 10) Implementation Rules

Chuỗi trách nhiệm:

1. `senior-architect`: chốt architecture/module boundaries/contracts.
2. `senior-scaffolder`: scaffold file/function skeleton theo kiến trúc đã duyệt.
3. `junior-implementer`: implement logic trong khung đã duyệt.
4. `integration-checker`: xác nhận wiring/import/side effects/test impact.
5. `senior-reviewer`: quality gate cuối trước khi kết luận done.

Ràng buộc:

- `junior-implementer` MUST NOT tự đổi contract/public API chưa được duyệt.
- Nếu contract mơ hồ hoặc conflict spec, MUST dừng và escalate làm rõ.
- MUST NOT “đoán” business rule để đi tiếp.

---

## 11) Testing and CI Expectations

Thay đổi liên quan auth/quota/premium/payment/entitlement MUST có test phù hợp.

Tối thiểu cần bao phủ:

- Auth identity mapping với Firebase UID.
- Entitlement checks theo tier + expiry.
- Quota behavior (reset window, limit reached, atomic update).
- Idempotency behavior cho AI endpoints.
- Payment webhook signature verification + idempotent grant.

CI/CD:

- `ci-helper` là agent chính cho pipeline/scripts CI/CD.
- Khi sửa CI, MUST tránh thay business logic nếu không thực sự cần.

---

## 12) Practical Conventions

Ngôn ngữ làm việc:

- Trao đổi với user/team (trong ngữ cảnh nội bộ VN): tiếng Việt.
- Code/comments/technical identifiers: tiếng Anh.

Phong cách output:

- Concise.
- Structured.
- Actionable.

Khi tạo plan/task/checklist, nên luôn có:

- Scope.
- Done criteria.
- Blocker/risk.
- Next action.

---

## 13) Open Gaps / Recommended Next Docs

Các khoảng trống nên ưu tiên bổ sung (nếu chưa có hoặc chưa đầy đủ):

- Package-level README cho modules chính (api, workers, web).
- `docs/decisions/` để thay dần `notes.html`.
- `docs/progress/` cho daily/weekly checkpoints.
- `docs/tasks/` cho implementation slices đã duyệt.
- Migration notes: map mục nào trong `notes.html` đã chuyển sang markdown.

---

## Assumptions

- Assumption: Repo hiện chưa có `CLAUDE.md` ở root nên file này được tạo mới.
- Assumption: Một số quy ước thư mục docs/decisions/progress/tasks được đề xuất vì chưa thấy chuẩn markdown ổn định tương ứng trong root tại thời điểm cập nhật.
- Assumption: Danh sách agents/commands được lấy theo những file hiện có trong `.claude/agents/` và `.claude/commands/` tại thời điểm khảo sát.
