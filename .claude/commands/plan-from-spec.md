---
description: Build an implementation-ready plan from one spec file or section using specialist planning agents.
argument-hint: <spec-path> [section/filter]
allowed-tools:
  - Read
  - Glob
  - Grep
  - Agent
---

Use this command when the goal is to go from spec text to actionable implementation planning without writing code.

Input handling:
- Primary input is a spec file path (typically under `specs/`).
- Optional second argument narrows to section/filter.
- If the path is missing or invalid, ask for a valid path.

Workflow:
1. Run `spec-clarifier` on the target scope.
2. Run `task-breakdown-planner` on the same scope.
3. Run `dependency-risk-mapper` on the same scope.
4. Run `implementation-slice-planner` on the same scope.
5. Synthesize a short unified plan.

Required synthesis structure:
- Scope reviewed
- Confirmed facts
- Assumptions
- Open questions (P0/P1/P2)
- Task breakdown summary
- Dependency/risk summary
- Recommended implementation slices (MVP -> hardening -> edge cases)
- Immediate next actions before coding

Rules:
- Do not write implementation code.
- Keep output concise and action-oriented.
