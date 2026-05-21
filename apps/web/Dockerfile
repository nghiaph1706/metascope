FROM node:20-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/package.json
RUN pnpm install --frozen-lockfile
COPY tsconfig.base.json ./tsconfig.base.json
COPY apps/web ./apps/web
RUN pnpm --filter @metascope/web run build
EXPOSE 3000
CMD ["pnpm", "--filter", "@metascope/web", "run", "start:prod"]
