# CMS App

## Role

`apps/cms` is the content management application for MetaScope editorial workflows.

Primary responsibilities:

- Create/update/publish content entities (guides, patch notes, meta snapshots).
- Emit publish events to backend integration endpoints.
- Provide authoring/admin UX only.

## Guardrails

- Backend API is the source of truth for identity, entitlement, and quota.
- Firebase UID is canonical at API layer; CMS must not redefine identity authority.
- Entitlement/quota decisions are authoritative in backend services, not in CMS/client UI.
- Live Tracker is out of scope and must not be implemented.

## Expected integration direction

- Outbound: publish event webhooks to API `cms-integration` module.
- Inbound: content/status responses from backend APIs.

## TODO

- TODO: Define CMS runtime stack and build tooling.
- TODO: Add route/module skeleton under `apps/cms/src`.
- TODO: Add API client contract wiring to shared package contracts.
