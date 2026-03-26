FROM node:22-slim
WORKDIR /app

# Copy package files
COPY apps/api/package.json apps/api/package-lock.json* ./apps/api/
COPY content/ ./content/
COPY packages/essence-spec/schema/ ./packages/essence-spec/schema/

# Install deps
WORKDIR /app/apps/api
RUN npm install --production

# Copy source
COPY apps/api/src/ ./src/

EXPOSE 3000
CMD ["node", "src/index.js"]
