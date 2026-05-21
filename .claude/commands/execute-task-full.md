---
description: Run full senior/junior/review execution workflow from task input to final readiness verdict.
argument-hint: <task-description-or-file>
allowed-tools:
  - Read
  - Glob
  - Grep
  - Agent
---

Use this command for end-to-end execution with final senior gate.

Workflow:
1. Run `senior-architect`.
2. Run `senior-scaffolder`.
3. Run `junior-implementer`.
4. Optionally run `junior-test-writer` if test patterns exist and coverage is needed.
5. Run `integration-checker`.
6. Run `senior-reviewer` as final gate.

Required output:
- Architecture decisions
- Scaffolded contracts
- Implemented scope
- Integration status
- Senior review (must-fix / should-fix / nice-to-have)
- Open issues
- Final decision: ready / not-ready

Rules:
- Do not skip stages unless explicitly instructed.
- If blockers appear at any stage, stop and escalate with concrete questions.
