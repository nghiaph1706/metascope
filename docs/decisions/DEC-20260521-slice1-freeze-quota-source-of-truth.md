# DEC-20260521: Slice 1 contract freeze, quota exceed semantics, and decision source

## Status

Approved

## Decisions applied

### 1B — Freeze path + auth + core fields

- For Slice 1/2, API path, auth boundary, and core response fields are locked.
- Minor response fields can be tuned during design phase only if they do not alter frozen contract semantics.

### 2A — Quota exceed semantics

- Standard quota exceed behavior is `429 Too Many Requests` for all exceed cases.
- Response must include `retry_after` for client backoff behavior.

### 3A — Source of truth shift

- `notes.html` is deprecated for active decision authority.
- Source of truth for current work is PRD (`specs/README.md` and split files) + markdown decision docs under `docs/decisions/`.

## Scope guardrail impact

- No business logic implementation in this step.
- Any change to public API contract beyond the frozen scope requires explicit decision request.
- Auth/entitlement/quota/payment flows remain backend-authoritative per PRD guardrails.

## Operational follow-up

- Use this DEC as baseline input for `design-task` (Slice 1/2).
- Use this DEC as review gate reference for security-sensitive `review-task` checklist.
