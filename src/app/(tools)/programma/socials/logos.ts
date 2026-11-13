import { getCloudflareContext } from '@opennextjs/cloudflare'

// De logo's staan in public/. In de Worker is dat geen map op schijf maar de ASSETS-binding;
// lokaal (next dev) lezen we ze gewoon van schijf.
async function loadPng(filename: string): Promise<ArrayBuffer> {
  const context = await getCloudflareContext({ async: true }).catch(() => undefined)
  const assets = (
    context?.env as { ASSETS?: { fetch(url: string): Promise<Response> } } | undefined
  )?.ASSETS
  if (assets) {
    const response = await assets.fetch(`https://assets.local/${filename}`)
    if (response.ok) {
      return response.arrayBuffer()
    }
  }

  const [{ readFile }, path] = await Promise.all([import('node:fs/promises'), import('node:path')])
  const buffer = await readFile(path.join(process.cwd(), 'public', filename))
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer
}

const cache = new Map<string, Promise<string>>()

function loadDataUri(filename: string): Promise<string> {
  let uri = cache.get(filename)
  if (!uri) {
    uri = loadPng(filename).then(
      (data) => `data:image/png;base64,${Buffer.from(data).toString('base64')}`,
    )
    // Een mislukte poging niet onthouden.
    uri.catch(() => cache.delete(filename))
    cache.set(filename, uri)
  }
  return uri
}

export function getClubLogoDataUri(): Promise<string> {
  return loadDataUri('svv04-logo.png')
}

export function get7x7LogoDataUri(): Promise<string> {
  return loadDataUri('knvb-7x7-voetbal-logo.png')
}
