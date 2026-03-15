# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
# Install system dependencies
RUN apk add --no-cache \
    openssl \
    curl \
    libc6-compat
# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Dependencies stage
FROM base AS deps
WORKDIR /app
# Copy dependency files
COPY package.json pnpm-lock.yaml ./
# No cache mount + ignore scripts = attack vector eliminated
RUN pnpm install --frozen-lockfile --ignore-scripts

# Builder stage
FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY --from=deps /app/node_modules ./node_modules
# Copy source code
COPY . .
# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache curl
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs --ingroup nodejs
# Copy built application with proper ownership
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Switch to non-root user
USER nextjs
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1
EXPOSE 3000
CMD ["node", "server.js"]