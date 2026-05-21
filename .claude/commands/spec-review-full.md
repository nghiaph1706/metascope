---
description: Run a full pre-implementation spec review to surface ambiguities, inconsistencies, dependencies, and key risks.
argument-hint: <spec-path-or-folder>
allowed-tools:
  - Read
  - Glob
  - Grep
  - Agent
---

Use this command to decide what must be clarified before implementation starts.

Input handling:
- Accept a spec file or a specs folder path.
- If folder is provided, prioritize directly related spec files and note selection logic.

Workflow:
1. Run `spec-clarifier` on target scope.
2. Run `spec-consistency-checker` across relevant sections/files.
3. Run `dependency-risk-mapper` on target scope.
4. Merge results into a decision-focused review.

Required output structure:
- Scope reviewed
- Confirmed facts
- Assumptions
- Open questions requiring owner decisions
- Inconsistencies/conflicts to resolve
- Dependency/blocker/risk summary
- Decision list that must be closed pre-implementation (P0/P1/P2)

Rules:
- Keep output short, practical, and implementation-gating.
- Do not write implementation code.
