# MetaScope

MetaScope là nền tảng hỗ trợ người chơi TFT theo định hướng backend-focused monorepo.

## Current bootstrap scope

Repository hiện được bootstrap runtime tối thiểu cho 4 app:

- `apps/api`: backend API skeleton (source of truth cho backend flows)
- `apps/web`: web runtime skeleton
- `apps/cms`: CMS runtime skeleton
- `apps/worker`: background worker skeleton

Ngoài ra có:

- `packages/shared`: shared contracts/types
- `infra/`: docker assets theo môi trường
- `docs/`: thư mục docs chuẩn hóa

## Tech stack (bootstrap)

- Node.js 22+ (CI dùng Node 22)
- TypeScript
- pnpm workspaces
- ESLint + Prettier
- Husky + lint-staged + commitlint
- Docker Compose cho dev/staging/prod

## Monorepo structure

```txt
apps/
  api/
  web/
  cms/
  worker/
packages/
  shared/
infra/
  docker/
  compose/
docs/
```

## Prerequisites

- Node.js 22+
- pnpm 10+
- Docker + Docker Compose

## Install

```bash
pnpm install
```

## Run locally (without Docker)

Chạy tất cả app ở mode development:

```bash
pnpm run dev
```

## Run with Docker

Development:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Staging:

```bash
docker compose -f docker-compose.staging.yml up --build
```

Production:

```bash
docker compose -f docker-compose.prod.yml up --build
```

## Health endpoints (bootstrap)

- API: `GET http://localhost:4000/health`
- Web: `GET http://localhost:3000/health`
- CMS: `GET http://localhost:3001/health`

## Quality checks

```bash
pnpm run format:check
pnpm run lint
pnpm run typecheck
pnpm run check
```

## Git workflow guards

Đã enforce qua Husky hooks:

- Không được push trực tiếp branch `main` (pre-push sẽ block)
- Commit message phải theo Conventional Commits (commit-msg)

Xem thêm quy trình đóng góp tại [CONTRIBUTING.md](./CONTRIBUTING.md).

## Guardrails

Theo `CLAUDE.md`:

- Firebase UID là canonical identity ở API/backend layer.
- Entitlement/quota authoritative ở backend; frontend/CMS không là authority.
- Không implement Live Tracker.
