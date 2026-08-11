#!/usr/bin/env bash
#
# Vercel database migrations + build.
#
# Migrations run FIRST, then the Next.js build. This order is required because
# the build statically prerenders routes (e.g. /sitemap.xml) that query the
# database — those tables must already exist when the build runs.
#
# Migrations target the database that belongs to THIS deployment's environment:
#   - Production deploys  -> the production Neon branch
#   - Preview deploys      -> the per-preview Neon branch created by the
#                            Neon-Vercel integration (isolated copy of prod)
#
# Migrations use the UNPOOLED connection (required for DDL). We deliberately
# fail fast if no unpooled URL is present, rather than silently skipping
# migrations or falling back to another environment's database.
set -euo pipefail

if [ -z "${DATABASE_URL_UNPOOLED:-}" ]; then
  echo "✗ DATABASE_URL_UNPOOLED is not set for this environment." >&2
  echo "  Preview deploys need the Neon-Vercel integration to provision a" >&2
  echo "  branch and inject its connection string. Aborting before migrate." >&2
  exit 1
fi

echo "▸ Running migrations against this environment's Neon branch (VERCEL_ENV=${VERCEL_ENV:-unknown})…"
DATABASE_URL="$DATABASE_URL_UNPOOLED" pnpm migrate

echo "▸ Building…"
NODE_ENV=production pnpm build

echo "✓ Migrations + build complete."
