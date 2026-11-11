// Alleen voor de Cloudflare-build (zie webpack in next.config.ts). undici compileert bij het
// laden WebAssembly en dat mag niet in een Worker. Wat de app en haar pakketten eruit halen:
//
// - fetch (Payload): de ingebouwde fetch van de Worker doet hetzelfde.
// - Agent (Payload safeFetch, de SSRF-filter voor upload-via-URL): een Worker kan geen
//   privé-adressen bereiken (compatibility flag global_fetch_strictly_public), dus de
//   dispatcher is overbodig. Payload controleert letterlijke IP-adressen zelf nog steeds.

export class Agent {
  constructor(_options?: unknown) {}
}

export const fetch = (input: RequestInfo | URL, init?: RequestInit & { dispatcher?: unknown }) => {
  if (init && 'dispatcher' in init) {
    const { dispatcher: _dispatcher, ...rest } = init
    return globalThis.fetch(input, rest)
  }
  return globalThis.fetch(input, init)
}
