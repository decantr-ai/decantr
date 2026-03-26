# Multi-stage Node 22 build for Fly.io

FROM node:22-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM node:22-slim
WORKDIR /app

# better-sqlite3 needs shared libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsqlite3-0 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Data directory for SQLite (mounted as Fly.io volume)
RUN mkdir -p /data

ENV NODE_ENV=production
ENV DB_PATH=/data/registry.db
ENV PORT=8080

EXPOSE 8080

CMD ["node", "src/index.js"]
