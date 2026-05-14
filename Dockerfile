# =========================================
# Builder Stage
# =========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./

RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# =========================================
# Production Stage
# =========================================
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled app
COPY --from=builder /app/dist ./dist

# Optional:
# Copy additional assets if needed
# COPY --from=builder /app/public ./public

# Create non-root user
RUN addgroup -S nodejs && adduser -S appuser -G nodejs

USER appuser

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Start app
CMD ["node", "dist/server.js"]