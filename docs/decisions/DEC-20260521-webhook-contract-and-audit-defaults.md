# DEC-20260521 — Webhook contract and audit defaults

## Status

Accepted

## Context

Pre-implementation decisions needed to unblock Slice 1/2 (auth boundary + webhook trust chain).

## Decisions

1. Ack code mapping:
   - `00`: processed/success (including idempotent duplicate already processed)
   - `01`: invalid signature
   - `02`: accepted-but-not-applied-temporarily (transient internal failure; provider may retry)
2. HTTP adapter: Express (aligned with current codebase runtime skeleton).
3. Idempotency unique key for processed webhooks: composite `provider + event_id`.
4. Security/audit sink for `tx-not-found`: persist to internal DB audit table first (plus application log); SIEM integration deferred.

## Why

- Keeps provider-facing behavior explicit and retry-safe.
- Minimizes framework churn/risk in current slice.
- Prevents cross-provider event ID collisions.
- Ensures auditable incident trail in source-of-truth storage before external observability hardening.

## Implementation constraints

- Invalid signature must return HTTP 200 with ack code `01` and no domain mutation.
- Processed marker write and entitlement/payment mutation must occur in the same DB transaction.
- `retry_after` uses seconds consistently.
- `tx-not-found` must emit security/audit event.
