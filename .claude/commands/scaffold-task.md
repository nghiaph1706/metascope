---
description: Design and scaffold a task into concrete code skeletons and contracts.
argument-hint: <task-description-or-file>
allowed-tools:
  - Read
  - Glob
  - Grep
  - Agent
---

Use this command when you want real skeleton code in the repo before junior implementation.

Workflow:
1. Run `senior-architect` to produce architecture brief.
2. If Go for scaffolding, run `senior-scaffolder` using that brief.
3. Create/modify skeleton files with signatures, short contract comments, and TODO placeholders.

Required output:
- Architecture brief summary
- Files created/modified
- Contracts scaffolded (public API/signatures)
- TODO map for junior-implementer
- Blockers/open questions

Rules:
- Scaffold only; do not fully implement business logic.
- Keep structure aligned with existing module conventions.
