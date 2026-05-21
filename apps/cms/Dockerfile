FROM node:20-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/cms/package.json ./apps/cms/package.json
RUN pnpm install --frozen-lockfile
COPY tsconfig.base.json ./tsconfig.base.json
COPY apps/cms ./apps/cms
RUN pnpm --filter @metascope/cms run build
EXPOSE 3001
CMD ["pnpm", "--filter", "@metascope/cms", "run", "start:prod"]
