# Design-task input packet — Slice 1/2

## Objective

Produce architecture/design brief for Slice 1/2 focused on:

1. Auth boundary (canonical Firebase UID identity enforcement).
2. Payment webhook trust chain (signature verification, idempotent + atomic entitlement mutation boundary).

No business logic implementation in this task.

## Locked scope (from approved decisions)

- Decision 1B: Freeze API path + auth boundary + core response fields.
- Decision 2A: Quota exceed semantics fixed to `429` + `retry_after` across all exceed scenarios.
- Decision 3A: `notes.html` deprecated as active source; use PRD + `docs/decisions/*`.

## Source references

- `specs/README.md`
- `specs/01_Auth_and_Plans.md`
- `specs/03_Backend_and_Data.md`
- `specs/06_Payment_Security_Testing.md`
- `docs/decisions/DEC-20260521-slice1-freeze-quota-source-of-truth.md`

## Expected output sections (from /design-task contract)

- Objective
- Constraints
- Files to touch
- Architectural decisions
- Function/method inventory
- Risks and open questions
- Go/No-go for scaffolding

## Explicit constraints

- MUST keep backend as source of truth for auth/entitlement/quota/billing state.
- MUST preserve Firebase UID as canonical auth identity.
- MUST enforce no entitlement grant from client callback/return URL.
- MUST include webhook signature verification boundary before entitlement updates.
- MUST model payment update flow as idempotent + atomic.
- MUST keep Live Tracker out of scope.

## Deliverable quality bar

- Design must be implementable by `senior-scaffolder` without contract ambiguity.
- Any public API contract drift from frozen scope must be flagged as blocker (do not proceed silently).
