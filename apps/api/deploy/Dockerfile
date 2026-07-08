# =============================================================================
# CampusOS API — Docker Image (Deploy Artifact)
# =============================================================================
# Build context: project root (.)
#   docker build -f apps/api/deploy/Dockerfile -t campusos-api .
#
# The deploy/ subdirectory contains pre-built JS + node_modules emitted by
# `turbo build`.  This Dockerfile copies just what the runtime needs:
#   • dist/          — compiled NestJS output
#   • node_modules/  — vendored dependencies (including @prisma/client)
#   • start.cjs      — entry point (resolves @campusos/shared alias)
# =============================================================================

# ---- Stage 1: Install + Prisma Generate ------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy deploy package manifest
COPY apps/api/deploy/package*.json ./

# Install production deps (prisma client is already in node_modules from build,
# but we install cleanly for the container to ensure reproducibility)
RUN npm ci --omit=dev

# Copy Prisma schema from the API source tree and regenerate client
# (ensures the correct @prisma/client binary for the container's platform)
COPY apps/api/prisma/ ./prisma/
RUN npx prisma generate

# ---- Stage 2: Runtime ------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nestjs

# Copy node_modules (with freshly generated prisma client) and schema
COPY --from=builder /app/node_modules    ./node_modules
COPY --from=builder /app/prisma/         ./prisma/

# Copy deploy artifacts
COPY apps/api/deploy/dist/     ./dist/
COPY apps/api/deploy/start.cjs ./

# Copy package manifest (for metadata, not install)
COPY apps/api/deploy/package*.json ./

# Drop privileges
USER nestjs

EXPOSE 4000
ENV NODE_ENV=production

# Run database migrations on startup, then start the API
CMD npx prisma migrate deploy && node start.cjs
