import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'

export default {
  ...defineCloudflareConfig({
    incrementalCache: r2IncrementalCache,
  }),
  // Webpack in plaats van Turbopack: Turbopack geeft externe pakketten (zoals drizzle-kit,
  // dat Payload alleen in dev gebruikt) een naam met hash die OpenNext niet kan bundelen.
  buildCommand: 'pnpm build --webpack',
}
