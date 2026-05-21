# Base Structure Bootstrap

## Scope

- Create backend-focused monorepo foundation for `apps/api`, `apps/web`, `apps/worker`.
- Add shared package area for contracts/utilities.
- Add infra folders for Dockerfiles and compose manifests per environment.
- Add docs folders aligned with project operating manual.

## Done Criteria

- Base folders exist for apps, packages, infra, docs, scripts.
- Dockerfile exists for dev/staging/prod.
- Compose manifest exists for dev/staging/prod.
- Package-level README exists for key modules.

## Blockers/Risks

- Current repository does not yet contain root package manager setup (`package.json`, workspace config).
- Docker commands reference scripts (`dev`, `build`, `start:staging`, `start:prod`) that must be implemented in root/app package scripts.

## Next Action

- Add root workspace package manager configuration and per-app startup/build scripts.
- Wire PostgreSQL/Redis services into compose files once runtime architecture is finalized.
