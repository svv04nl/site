import { withPayload } from '@payloadcms/next/withPayload'
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
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,

  // Inline styles are used by Next.js and various components.
  `style-src 'self' 'unsafe-inline'`,

  // next/font serves fonts from the same origin — no external font host needed.
  `font-src 'self'`,

  // Media is served directly from Vercel Blob (disablePayloadAccessControl: true).
  // Team logos are loaded from logoapi.voetbal.nl.
  `img-src 'self' data: blob:${blobHost ? ` ${blobHost}` : ''} https://logoapi.voetbal.nl`,

  // Client-side TanStack Query hooks fetch live sports data directly from Sportlink.
  // Vercel Analytics and Speed Insights send beacons to vitals.vercel-insights.com.
  `connect-src 'self' https://data.sportlink.com https://vitals.vercel-insights.com${isDev ? ' ws://localhost:*' : ''}`,

  `frame-src 'none'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
].join('; ')

const nextConfig: NextConfig = {
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

export default withPayload(nextConfig, { devBundleServerPackages: false })
