---
description: Package a focused async decision request with clear options and recommendation for human approval.
argument-hint: <decision-topic> [scope/path]
allowed-tools:
  - Read
  - Glob
  - Grep
  - Agent
---

Use this command when a long-running workflow needs a quick human decision (optimized for async replies via Telegram/Channels).

Input handling:
- First argument is required: the decision topic.
- Optional second argument narrows evidence scope (file/folder/spec section).
- If topic is missing, ask for a short decision topic before proceeding.

Workflow:
1. Gather only decision-relevant facts from the given scope.
2. Run `work-manager` to package the decision request.
3. Force narrow decision framing:
   - yes/no, or
   - choose A/B/C (max 4 options), or
   - approve/reject, or
   - continue/pause.
4. If deep analysis is still missing, route before decision packaging:
   - unclear spec contract -> `spec-workflow-orchestrator` or `/plan-from-spec`
   - architecture/design trade-off unresolved -> `senior-architect` or `/design-task`
   - pre-merge quality gate unresolved -> `senior-reviewer` or `/review-task`
5. Return one decision packet in required format.

Required output format (B: Decision request):
- Context
- Decision needed
- Options
- Recommended choice
- Impact if delayed

Rules:
- Avoid broad open-ended questions.
- Keep context short; include only information needed to decide.
- State unknowns explicitly instead of guessing.
- If recommendation is given, make the default action unambiguous.
