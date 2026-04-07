FROM node:24-slim AS builder
WORKDIR /app

# Copy API package manifest — replace workspace dep with local path
COPY apps/api/package.json ./package.json

# Copy pre-built essence-spec as a local package
COPY packages/essence-spec/dist/ ./local-deps/essence-spec/dist/
COPY packages/essence-spec/schema/ ./local-deps/essence-spec/schema/
COPY packages/essence-spec/package.json ./local-deps/essence-spec/package.json

# Rewrite workspace:* to local file path for npm install
RUN sed -i 's|"@decantr/essence-spec": "workspace:\*"|"@decantr/essence-spec": "file:./local-deps/essence-spec"|' package.json
RUN npm install

# Copy build config and source
COPY apps/api/tsconfig.json apps/api/tsup.config.ts ./
COPY apps/api/src/ ./src/

# Build with tsup
RUN npx tsup

# Production
FROM node:24-slim
WORKDIR /app

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser -d /app appuser

COPY --from=builder --chown=appuser:appuser /app/dist/ ./dist/
COPY --from=builder --chown=appuser:appuser /app/node_modules/ ./node_modules/
COPY --from=builder --chown=appuser:appuser /app/package.json ./

# Ensure essence-spec is available with its schema files
COPY --from=builder --chown=appuser:appuser /app/local-deps/essence-spec/ ./node_modules/@decantr/essence-spec/

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); http.get('http://localhost:3000/health', r => { if (r.statusCode !== 200) process.exit(1); }).on('error', () => process.exit(1));"

CMD ["node", "dist/index.js"]
