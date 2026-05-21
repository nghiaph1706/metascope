---
description: Generate a detailed markdown execution checklist from spec content via task decomposition.
argument-hint: <spec-path> [section/filter]
allowed-tools:
  - Read
  - Glob
  - Grep
  - Agent
---

Use this command when you want a concrete implementation checklist with markdown checkboxes.

Input handling:
- Primary input is a spec file path (typically under `specs/`).
- Optional second argument narrows to section/filter.
- If missing path, ask user for it.

Workflow:
1. Run `task-breakdown-planner` on the target scope.
2. Run `checklist-generator` using the generated task breakdown and scope.
3. Return a concise but detailed checklist with `[ ]` items.

Required output structure:
- Scope reviewed
- Confirmed facts
- Assumptions
- Open questions
- Detailed checklist by phase/subtask
- Verification/Test checklist
- Exit criteria

Rules:
- Checklist items must be concrete and executable.
- Do not write implementation code.
