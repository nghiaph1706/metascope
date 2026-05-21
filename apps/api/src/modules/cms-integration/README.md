# CMS Integration Module (API)

## Purpose

Handle inbound publish webhooks from CMS and route them into backend processing pipeline.

## Contract expectations

- Inbound route accepts `CmsPublishEvent` payload from `@shared/contracts`.
- Verify request authenticity before accepting event (signature/HMAC or equivalent).
- Enforce idempotency by `idempotencyKey` to prevent duplicate processing.
- Persist accepted event atomically before async fan-out (queue/job dispatch).

## Guardrails

- Firebase UID remains canonical identity in API layer when actor identity is present.
- Entitlement/quota authority belongs to backend API; CMS payload is never authoritative.
- Live Tracker remains out of scope.

## TODO skeleton

- TODO: Define route path and method in API router module.
- TODO: Add verifier interface (headers/body/signature contract).
- TODO: Add idempotency repository/service interface.
- TODO: Add enqueue handoff to worker `cms-sync` job.
