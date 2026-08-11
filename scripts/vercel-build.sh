#!/usr/bin/env bash
#
# Vercel build + database migrations.
#
# Runs the Next.js build, then applies Payload migrations against the database
# that belongs to THIS deployment's environment:
#   - Production deploys  -> the production Neon branch
#   - Preview deploys      -> the per-preview Neon branch created by the
#                            Neon-Vercel integration (isolated copy of prod)
#
# Migrations use the UNPOOLED connection (required for DDL). We deliberately
# fail fast if no unpooled URL is present, rather than silently skipping
# migrations or falling back to another environment's database.
set -euo pipefail

echo "▸ Building (VERCEL_ENV=${VERCEL_ENV:-unknown})…"
NODE_ENV=production pnpm build

if [ -z "${DATABASE_URL_UNPOOLED:-}" ]; then
  echo "✗ DATABASE_URL_UNPOOLED is not set for this environment." >&2
  echo "  Preview deploys need the Neon-Vercel integration to provision a" >&2
  echo "  branch and inject its connection string. Aborting before migrate." >&2
  exit 1
fi

echo "▸ Running migrations against this environment's Neon branch…"
DATABASE_URL="$DATABASE_URL_UNPOOLED" pnpm migrate

echo "✓ Build + migrations complete."
