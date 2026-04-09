FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/essence-spec/package.json ./packages/essence-spec/package.json
COPY packages/registry/package.json ./packages/registry/package.json
COPY packages/core/package.json ./packages/core/package.json
COPY packages/verifier/package.json ./packages/verifier/package.json

RUN pnpm install --frozen-lockfile --filter ./apps/api...

COPY apps/api/ ./apps/api/
COPY packages/essence-spec/ ./packages/essence-spec/
COPY packages/registry/ ./packages/registry/
COPY packages/core/ ./packages/core/
COPY packages/verifier/ ./packages/verifier/

RUN pnpm --filter @decantr/essence-spec --filter @decantr/registry --filter @decantr/core --filter @decantr/verifier --filter ./apps/api build
RUN pnpm --filter ./apps/api --prod deploy --legacy /prod/api

FROM node:24-slim
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN groupadd -r appuser && useradd -r -g appuser -d /app appuser

COPY --from=builder --chown=appuser:appuser /prod/api/dist/ ./dist/
COPY --from=builder --chown=appuser:appuser /prod/api/node_modules/ ./node_modules/
COPY --from=builder --chown=appuser:appuser /prod/api/package.json ./package.json

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:3000/health', r => { if (r.statusCode !== 200) process.exit(1); }).on('error', () => process.exit(1));"

CMD ["node", "dist/index.js"]
