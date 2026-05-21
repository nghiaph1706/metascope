---
description: Compress current project execution state into a concise async status update for long-running workflows.
argument-hint: [scope/path] [optional focus]
allowed-tools:
  - Read
  - Glob
  - Grep
  - Agent
---

Use this command when you need a short, mobile-friendly status summary (including Telegram/Channels async review).

Input handling:
- Optional first argument narrows scope (file, folder, spec section, task area).
- Optional second argument adds focus (e.g., blockers, CI, implementation phase).
- If no arguments are provided, summarize the most relevant active workflow context.

Workflow:
1. Read the requested scope and nearby execution context (specs, progress logs, decision notes, relevant changed files if provided).
2. Run `work-manager` to compress the state into a concise operational snapshot.
3. If blockers are detected, classify each blocker and map escalation path explicitly:
   - spec ambiguity / missing requirement -> `spec-reviewer-orchestrator` or `/spec-review-full`
   - architecture conflict -> `senior-architect` or `/design-task`
   - implementation quality/final readiness concerns -> `senior-reviewer` or `/review-task`
   - integration wiring/test impact -> `integration-checker`
   - CI/test/build pipeline issue -> `ci-helper`
   - documentation drift -> `docs-librarian`
   - incident/ops note requirement -> `ops-notes-keeper`
4. Return exactly one status payload in the required format.

Required output format (A: Status update):
- Current task
- Done
- In progress
- Blockers
- Next step

Rules:
- Keep the summary concise and operational (phone-readable).
- Distinguish confirmed facts vs assumptions inside bullets when needed.
- Do not invent progress; mark missing information explicitly.
- Do not execute specialist implementation/review work in this command; route to the right specialist instead.
