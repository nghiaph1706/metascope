---
description: Execute design -> scaffolding -> implementation -> integration check for a task, without final senior sign-off.
argument-hint: <task-description-or-file>
allowed-tools:
  - Read
  - Glob
  - Grep
  - Agent
---

Use this command to implement a task through junior execution flow but stop before final review gate.

Workflow:
1. Run `senior-architect`.
2. Run `senior-scaffolder`.
3. Run `junior-implementer` to fill placeholders.
4. If test patterns exist and task needs tests, run `junior-test-writer`.
5. Run `integration-checker`.

Required output:
- Design summary
- Scaffolding summary
- Implementation summary
- Test updates (if any)
- Integration findings
- Remaining blockers/issues
- Pre-review readiness

Rules:
- Junior must not redesign architecture/contracts.
- If contract ambiguity appears, stop and escalate.
