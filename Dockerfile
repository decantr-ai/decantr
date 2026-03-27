FROM node:22-slim AS builder
WORKDIR /app

# Copy package manifest and install deps
COPY package.json ./
RUN npm install

# Copy build config and source
COPY tsconfig.json tsup.config.ts ./
COPY src/ ./src/

# Build with tsup
RUN npx tsup

# Production
FROM node:22-slim
WORKDIR /app

COPY --from=builder /app/dist/ ./dist/
COPY --from=builder /app/node_modules/ ./node_modules/
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["node", "dist/index.js"]
