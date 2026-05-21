---
description: Stress-test a feature proposal in the spec and expose hidden business decisions.
argument-hint: <feature-name-or-section>
allowed-tools:
  - Read
  - Glob
  - Grep
  - Agent
---
Challenge the target feature/section with a critical lens.

Workflow:
1) Run `spec-reviewer-orchestrator` first to get a holistic baseline.
2) Then run `business-logic-challenger` focused on the target feature/section for deeper stress test.
3) Use `spec-clarifier` and `technical-feasibility-auditor` only to deepen unresolved points from step 1-2.
4) Produce a short decision brief:
   - What is safe to proceed now
   - What must be clarified first
   - Which decisions have highest risk if delayed
