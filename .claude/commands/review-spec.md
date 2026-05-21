---
description: Review one spec file with clarification, business challenge, feasibility, and consistency lenses.
argument-hint: <spec-file-path>
allowed-tools:
  - Read
  - Glob
  - Grep
  - Agent
---
Review the target spec file end-to-end.

Workflow:
1) Run `spec-reviewer-orchestrator` first for end-to-end review.
2) If the user asks to drill down, run specialist agents (`spec-clarifier`, `business-logic-challenger`, `technical-feasibility-auditor`, `spec-consistency-checker`) only for the requested sections.
3) Return a concise merged report:
   - Top contradictions
   - Top unanswered questions
   - Top feasibility risks
   - Suggested rewrite snippets
   - Recommended next decisions
