FROM node:20-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/worker/package.json ./apps/worker/package.json
RUN pnpm install --frozen-lockfile
COPY tsconfig.base.json ./tsconfig.base.json
COPY apps/worker ./apps/worker
RUN pnpm --filter @metascope/worker run build
CMD ["pnpm", "--filter", "@metascope/worker", "run", "start:prod"]
