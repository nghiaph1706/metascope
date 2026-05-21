---
description: Create an implementation design brief from a task/spec before coding.
argument-hint: <task-description-or-file>
allowed-tools:
  - Read
  - Glob
  - Grep
  - Agent
---

Use this command to lock design decisions before any scaffolding or implementation.

Workflow:
1. Parse input as either:
   - inline task description, or
   - file path under specs/docs/tasks.
2. Run `senior-architect` on the scoped input.
3. Return the architecture brief as-is, preserving required sections.

Required output:
- Objective
- Constraints
- Files to touch
- Architectural decisions
- Function/method inventory
- Risks and open questions
- Go/No-go for scaffolding

Rules:
- Do not implement code.
- If architecture blockers exist, stop and request decisions.
