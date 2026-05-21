---
description: Record concise progress/checkpoint notes and blocker escalations for asynchronous project tracking.
argument-hint: <update-summary> [scope/path]
allowed-tools:
  - Read
  - Glob
  - Grep
  - Agent
---

Use this command to create/update short progress checkpoints during long-running workflows.

Input handling:
- First argument is required: short update summary.
- Optional second argument narrows scope for evidence.
- If no tracking artifact exists, propose minimal structure before logging:
  - `progress.md` (or `progress/`)
  - `docs/decisions/`
  - `docs/notes.md`

Workflow:
1. Collect recent facts from relevant scope (changes, task context, decisions, blockers).
2. Run `work-manager` to normalize the checkpoint note.
3. Produce one concise log payload using one of:
   - Completion summary (Format C) when milestone finished, or
   - Blocker summary (Format D) when blocked.
4. For blockers, include explicit escalation mapping:
   - spec ambiguity -> `spec-reviewer-orchestrator` or `/spec-review-full`
   - architecture conflict -> `senior-architect` or `/design-task`
   - test/build/CI failures -> `ci-helper`
   - integration breakage -> `integration-checker`
   - documentation/decision recording gaps -> `docs-librarian` or `ops-notes-keeper`
5. Keep logs compact and non-spammy; log only material state changes.

Required output formats:
C) Completion summary
- Completed
- Files touched
- Remaining risks
- Review required
- Recommended next action

D) Blocker summary
- Blocker type
- What is blocked
- Missing info or failed dependency
- Recommended escalation path

Rules:
- Prefer confirmed facts; label assumptions clearly.
- Mark unknown root cause/info as `unknown`.
- Keep output brief and operational for mobile review.
- Do not perform specialist coding/review tasks inside this command.
