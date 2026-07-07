#!/bin/bash
# Railway deployment script
# Builds the API and creates a standalone deployment in apps/api/deploy/

set -e

echo "=== Installing dependencies ==="
pnpm install --frozen-lockfile

echo "=== Building API ==="
pnpm build --filter=@campusos/api

echo "=== Creating standalone deployment ==="
DEPLOY_DIR="apps/api/deploy"
mkdir -p "$DEPLOY_DIR"

# Copy the built dist
cp -r apps/api/dist "$DEPLOY_DIR/dist"

# Create minimal package.json
cat > "$DEPLOY_DIR/package.json" << 'EOF'
{
  "name": "@campusos/api-deploy",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "start": "node dist/main"
  },
  "dependencies": {
    "express": "^4.21.0",
    "compression": "^1.7.4",
    "helmet": "^8.0.0",
    "@nestjs/core": "^10.4.15",
    "@nestjs/common": "^10.4.15",
    "@nestjs/platform-express": "^10.4.15",
    "@nestjs/config": "^3.3.0",
    "@nestjs/swagger": "^8.1.0",
    "@nestjs/jwt": "^11.0.2",
    "@nestjs/passport": "^11.0.5",
    "@prisma/client": "^6.1.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "bcryptjs": "^3.0.3",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "uuid": "^11.0.0",
    "swagger-ui-express": "^5.0.0",
    "zod": "^3.24.0"
  }
}
EOF

# Install production dependencies
cd "$DEPLOY_DIR"
npm install --production --omit=dev
cd ../../..

echo "=== Deployment package ready ==="
