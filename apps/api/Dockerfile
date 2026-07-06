# ---- Build Stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy package files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/ui/package.json ./packages/ui/package.json

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/api ./apps/api
COPY packages ./packages
COPY tsconfig.json turbo.json ./

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build
RUN pnpm build --filter=@campusos/api

# ---- Production Stage ----
FROM node:22-alpine
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Copy built output and node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma client from monorepo
COPY --from=builder /app/node_modules/.pnpm/@prisma+client*/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 4000

# Run migrations on startup, then start server
CMD npx prisma migrate deploy && node dist/main
