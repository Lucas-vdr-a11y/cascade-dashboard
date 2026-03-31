#!/bin/sh
# Sync database schema
npx prisma db push --skip-generate --accept-data-loss || echo "Warning: Prisma db push failed, continuing..."
node server.js
