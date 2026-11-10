// De paar Cloudflare-runtime-types die de app gebruikt. Bewust geen volledige
// @cloudflare/workers-types of `wrangler types`: die vervangen de DOM-types van fetch en
// Response (json() wordt dan unknown) in de hele codebase.

declare global {
  interface CacheStorage {
    /** Alleen in een Cloudflare Worker. */
    readonly default?: Cache
  }

  interface ImageTransform {
    width?: number
    height?: number
    fit?: 'scale-down' | 'contain' | 'pad' | 'squeeze' | 'cover' | 'crop'
    gravity?:
      | 'face'
      | 'left'
      | 'right'
      | 'top'
      | 'bottom'
      | 'center'
      | 'auto'
      | 'entropy'
      | { x?: number; y?: number; mode: 'remainder' | 'box-center' }
  }

  interface ImageTransformer {
    transform(transform: ImageTransform): ImageTransformer
    output(options: {
      format: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' | 'image/avif'
      quality?: number
    }): Promise<{ response(options?: { headers?: HeadersInit }): Response; contentType(): string }>
  }

  interface ImagesBinding {
    input(stream: ReadableStream<Uint8Array>): ImageTransformer
  }

  /** De AI-binding (Workers AI en AI Gateway); alleen doorgegeven aan createAI. */
  interface Ai {
    run(...args: unknown[]): Promise<unknown>
  }

  interface CloudflareEnv {
    /** Connection pool naar Neon; alleen in productie (zie wrangler.jsonc). */
    HYPERDRIVE?: { connectionString: string }
    /** AI Gateway voor de assistent (zie lib/ai/agent.ts). */
    AI?: Ai
  }
}

export {}
