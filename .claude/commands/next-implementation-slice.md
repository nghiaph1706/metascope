---
description: Recommend the next smallest implementation slice from a spec, with checklist and top risks.
argument-hint: <spec-path>
allowed-tools:
  - Read
  - Glob
  - Grep
  - Agent
---

Use this command when you need the next actionable slice to start implementation safely.

Input handling:
- Input is one spec file path.
- If missing or invalid path, ask user to provide a valid spec file.

Workflow:
1. Run `implementation-slice-planner` on the target spec.
2. Produce:
   - smallest viable next slice
   - concise execution checklist
   - key risks and mitigations

Required output structure:
- Scope reviewed
- Confirmed facts
- Assumptions
- Open questions
- Next smallest viable slice (in/out of scope)
- Checklist for this slice (`[ ]` items)
- Top risks for this slice (with priority and mitigation)
- Go/No-go prerequisites

Rules:
- Focus on immediate next slice, not full roadmap detail.
- Do not write implementation code.
