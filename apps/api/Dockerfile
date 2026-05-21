FROM node:20-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json
RUN pnpm install --frozen-lockfile
COPY tsconfig.base.json ./tsconfig.base.json
COPY apps/api ./apps/api
RUN pnpm --filter @metascope/api run build
EXPOSE 4000
CMD ["pnpm", "--filter", "@metascope/api", "run", "start:prod"]
