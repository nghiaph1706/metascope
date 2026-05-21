# CMS Sync Job (Worker)

## Purpose

Consume accepted CMS publish events and synchronize content into backend read/write models.

## Input

- Event envelope from API integration layer containing `CmsPublishEvent`.
- Idempotency context and delivery metadata from queue broker.

## Processing expectations (skeleton)

- Validate event schema version and entity type.
- Execute idempotent upsert/update flow by entity id + version/timestamp.
- Emit structured logs/metrics for success, dedupe, and failure paths.
- Support retry policy without creating duplicated state transitions.

## Guardrails

- Backend remains authoritative for entitlement/quota decisions.
- Firebase UID (if present) is treated as canonical actor identifier.
- Live Tracker is out of scope.

## TODO

- TODO: Define worker job handler signature.
- TODO: Define per-entity mapper interfaces (guide/patch-note/meta-snapshot).
- TODO: Define dead-letter strategy for irrecoverable payload errors.
