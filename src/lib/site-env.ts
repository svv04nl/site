// The environment the site runs in, from SITE_ENV in wrangler.jsonc: "production" on the live
// Worker, "preview" on a PR's Worker Preview, unset locally (next dev, wrangler dev, tests).
// This replaces Vercel's VERCEL_ENV, which does not exist on Cloudflare.

export type SiteEnv = 'production' | 'preview' | 'development'

export function siteEnv(): SiteEnv {
  const value = process.env.SITE_ENV
  return value === 'production' || value === 'preview' ? value : 'development'
}

/** True only on the live site. Use it to keep test switches and fake data off production. */
export const isProduction = () => siteEnv() === 'production'
