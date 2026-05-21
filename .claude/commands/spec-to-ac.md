---
description: Convert a spec section into testable acceptance criteria and edge-case scenarios.
argument-hint: <spec-file-or-section>
allowed-tools:
  - Read
  - Glob
  - Grep
  - Agent
---
Transform the given specification text into actionable acceptance criteria.

Workflow:
1) Run `spec-reviewer-orchestrator` first to surface major contradictions and open questions.
2) Use `acceptance-criteria-converter` on the target text.
3) Use `spec-clarifier` to list missing details that block verification.
4) Return:
   - Draft acceptance criteria (clear pass/fail)
   - Negative and edge scenarios
   - Open questions for PM/BA
   - Suggested rewrite to improve testability
