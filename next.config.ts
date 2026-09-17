import { withPayload } from '@payloadcms/next/withPayload'
import { withBotId } from 'botid/next/config'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const isDev = process.env.NODE_ENV === 'development'

// Parse the specific Vercel Blob store hostname from the token rather than using a wildcard.
const blobToken = process.env.BLOB_READ_WRITE_TOKEN || ''
const blobStoreId = blobToken.match(/^vercel_blob_rw_([a-z\d]+)_/i)?.[1]?.toLowerCase() ?? ''
const blobHost = blobStoreId ? `https://${blobStoreId}.public.blob.vercel-storage.com` : ''

// Build the Content-Security-Policy header value.
// Directives are joined into a single line — newlines are not allowed in header values.
const csp = [
  `default-src 'self'`,

  // Next.js requires 'unsafe-inline' for hydration scripts.
  // 'unsafe-eval' is only needed for webpack hot-reload in development.
  // maps.googleapis.com loads the Google Maps JavaScript API (AddressBlock).
  `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://maps.googleapis.com${isDev ? " 'unsafe-eval'" : ''}`,

  // Inline styles are used by Next.js and various components.
  `style-src 'self' 'unsafe-inline'`,

  // next/font serves fonts from the same origin — no external font host needed.
  `font-src 'self'`,

  // Media is served directly from Vercel Blob (disablePayloadAccessControl: true).
  // Team logos are loaded from logoapi.voetbal.nl.
  // Google Maps tiles/icons are served from maps.gstatic.com and maps.googleapis.com.
  `img-src 'self' data: blob:${blobHost ? ` ${blobHost}` : ''} https://logoapi.voetbal.nl https://maps.gstatic.com https://maps.googleapis.com`,

  // Client-side TanStack Query hooks fetch live sports data directly from Sportlink.
  // Vercel Analytics and Speed Insights send beacons to vitals.vercel-insights.com.
  // Google Maps JS API (geocoding, tile requests) calls maps.googleapis.com.
  `connect-src 'self' https://data.sportlink.com https://vitals.vercel-insights.com https://maps.googleapis.com${isDev ? ' ws://localhost:*' : ''}`,

  `frame-src 'none'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
].join('; ')

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  // Allows the dev server (HMR, RSC requests) to be reached through a
  // Cloudflare quick tunnel for testing on a phone/other device. The
  // subdomain is random per tunnel run, hence the wildcard.
  allowedDevOrigins: isDev ? ['*.trycloudflare.com'] : undefined,
  async redirects() {
    return [
      { source: '/senioren', destination: '/teams', permanent: true },
      { source: '/jeugd', destination: '/teams', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [{ key: 'Content-Security-Policy', value: csp }],
      },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withBotId(withPayload(nextConfig, { devBundleServerPackages: false }))
