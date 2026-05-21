---
description: Run final senior review on task changes and classify issues by severity.
argument-hint: <task-description-or-changed-files>
allowed-tools:
  - Read
  - Glob
  - Grep
  - Agent
---

Use this command for final engineering review after implementation/integration.

Workflow:
1. Scope input (task summary or changed file list).
2. Run `senior-reviewer`.
3. Return structured review with fix priorities.

Required output:
- Must-fix
- Should-fix
- Nice-to-have
- Requested revisions
- Final verdict: ready / not-ready

Rules:
- Reject if must-fix exists.
- Keep review concrete and file-specific.
