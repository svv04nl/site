import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const isDev = process.env.NODE_ENV === 'development'

// Maakt de Cloudflare-bindings (Images, R2, ...) ook onder `next dev` beschikbaar via
// getCloudflareContext(). De database blijft lokaal gewoon DATABASE_URL.
if (isDev) {
  initOpenNextCloudflareForDev()
}

// Build the Content-Security-Policy header value.
// Directives are joined into a single line — newlines are not allowed in header values.
const csp = [
  `default-src 'self'`,

  // Next.js requires 'unsafe-inline' for hydration scripts.
  // 'unsafe-eval' is only needed for webpack hot-reload in development.
  // maps.googleapis.com loads the Google Maps JavaScript API (AddressBlock).
  // challenges.cloudflare.com is Turnstile (bot check), static.cloudflareinsights.com is
  // Cloudflare Web Analytics.
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://maps.googleapis.com${isDev ? " 'unsafe-eval'" : ''}`,

  // Inline styles are used by Next.js and various components.
  `style-src 'self' 'unsafe-inline'`,

  // next/font serves fonts from the same origin — no external font host needed.
  `font-src 'self'`,

  // Media comes from our own /media route (R2). Team logos are loaded from logoapi.voetbal.nl.
  // Google Maps tiles/icons are served from maps.gstatic.com and maps.googleapis.com.
  `img-src 'self' data: blob: https://logoapi.voetbal.nl https://maps.gstatic.com https://maps.googleapis.com`,

  // Client-side TanStack Query hooks fetch live sports data directly from Sportlink.
  // Cloudflare Web Analytics sends beacons to cloudflareinsights.com.
  // Google Maps JS API (geocoding, tile requests) calls maps.googleapis.com.
  `connect-src 'self' https://data.sportlink.com https://cloudflareinsights.com https://maps.googleapis.com${isDev ? ' ws://localhost:*' : ''}`,

  // Turnstile renders its check in an iframe.
  `frame-src https://challenges.cloudflare.com`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
].join('; ')

const nextConfig: NextConfig = {
  // Packages with Cloudflare Workers (workerd) specific code.
  // See https://opennext.js.org/cloudflare/howtos/workerd
  serverExternalPackages: ['jose', 'pg', 'pg-cloudflare'],
  productionBrowserSourceMaps: true,
  // Allows the dev server (HMR, RSC requests) to be reached through a
  // Cloudflare quick tunnel for testing on a phone/other device. The
  // subdomain is random per tunnel run, hence the wildcard.
  allowedDevOrigins: isDev ? ['*.trycloudflare.com'] : undefined,
  async redirects() {
    return [
      { source: '/senioren', destination: '/teams', permanent: true },
      { source: '/jeugd', destination: '/teams', permanent: true },
      // The sponsor options moved to the "Voor jou" page for sponsors.
      { source: '/vereniging/sponsoring', destination: '/sponsoring', permanent: true },
      // The committee pages are gone; the trust person now lives under Vereniging.
      {
        source: '/commissies/vertrouwenspersoon',
        destination: '/vereniging/vertrouwenspersoon',
        permanent: true,
      },
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
  // Webpack is only used for the Cloudflare build (see open-next.config.ts); next dev and the
  // Vercel build use Turbopack.
  webpack: (webpackConfig, { isServer }) => {
    if (isServer) {
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        // Payload's safeFetch imports undici, which compiles WebAssembly on load.
        undici$: path.resolve(dirname, 'src/lib/shims/undici.ts'),
      }
    }
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
