// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MEDIA_SIZES, canTransform, fitsSize, sizedDimensions } from '@/lib/media-sizes'
import { Media } from '@/collections/Media'
import { TURNSTILE_HEADER, isHuman } from '@/lib/turnstile'

const afterRead = Media.hooks!.afterRead![0] as (args: { doc: any; req: any }) => any

function read(doc: Record<string, unknown>, url = 'https://svv04.nl/api/media') {
  return afterRead({ doc, req: { url } })
}

const photo = {
  id: 12,
  mimeType: 'image/jpeg',
  width: 3000,
  height: 2000,
  updatedAt: '2026-11-10T10:00:00.000Z',
  filename: 'foto 1.jpg',
  prefix: 'media',
  // The stored url column still holds the old Blob URL; the hook replaces it.
  url: 'https://store.public.blob.vercel-storage.com/media/foto%201.jpg',
}

describe('beeldformaten', () => {
  it('maakt alleen formaten die niet groter zijn dan het origineel', () => {
    expect(fitsSize(MEDIA_SIZES.hero, 3000, 2000)).toBe(true)
    expect(fitsSize(MEDIA_SIZES.hero, 900, 900)).toBe(false)
    expect(fitsSize(MEDIA_SIZES.teamCard, 600, 100)).toBe(true)
    expect(fitsSize(MEDIA_SIZES.teamCard, 599, 400)).toBe(false)
    expect(fitsSize(MEDIA_SIZES.newsCard, null, null)).toBe(false)
  })

  it('houdt de verhouding aan voor formaten zonder hoogte', () => {
    expect(sizedDimensions(MEDIA_SIZES.teamPhoto, 3000, 2000)).toEqual({ width: 900, height: 600 })
    expect(sizedDimensions(MEDIA_SIZES.newsCard, 3000, 2000)).toEqual({ width: 600, height: 300 })
  })

  it('transformeert geen SVG of PDF', () => {
    expect(canTransform('image/png')).toBe(true)
    expect(canTransform('image/svg+xml')).toBe(false)
    expect(canTransform('application/pdf')).toBe(false)
  })
})

describe('Media afterRead', () => {
  it('vult ontbrekende formaten aan met een URL naar /api/img', () => {
    const doc = read(photo)
    expect(doc.sizes.newsCard).toMatchObject({
      url: 'https://svv04.nl/api/img/newsCard/12?v=2026-11-10T10%3A00%3A00.000Z',
      width: 600,
      height: 300,
      mimeType: 'image/webp',
    })
    expect(Object.keys(doc.sizes).sort()).toEqual(Object.keys(MEDIA_SIZES).sort())
  })

  it('zet de URL van het origineel op /media, uit de bestandsnaam', () => {
    expect(read(photo).url).toBe('https://svv04.nl/media/foto%201.jpg')
  })

  it('houdt bestaande formaten, met een URL naar /media', () => {
    const existing = {
      url: 'https://store.public.blob.vercel-storage.com/media/foto-600x300.webp',
      filename: 'foto-600x300.webp',
      width: 600,
      height: 300,
    }
    const doc = read({ ...photo, sizes: { newsCard: existing } })
    expect(doc.sizes.newsCard).toEqual({ ...existing, url: 'https://svv04.nl/media/foto-600x300.webp' })
    expect(doc.sizes.featuredPost.url).toContain('/api/img/featuredPost/12')
  })

  it('maakt geen formaat dat groter is dan het origineel', () => {
    const doc = read({ ...photo, width: 900, height: 900 })
    expect(doc.sizes.hero).toBeUndefined()
    expect(doc.sizes.teamPhoto.url).toContain('/api/img/teamPhoto/12')
  })

  it('gebruikt een relatief pad zonder request-URL', () => {
    const doc = afterRead({ doc: photo, req: {} })
    expect(doc.url).toBe('/media/foto%201.jpg')
    expect(doc.sizes.newsCard.url).toMatch(/^\/api\/img\/newsCard\/12\?v=/)
  })

  it('maakt geen formaten voor een SVG, maar zet wel de URL', () => {
    const doc = read({ ...photo, mimeType: 'image/svg+xml', filename: 'logo.svg' })
    expect(doc.url).toBe('https://svv04.nl/media/logo.svg')
    expect(doc.sizes).toEqual({})
  })
})

describe('Turnstile', () => {
  const request = (token?: string) =>
    new Request('https://svv04.nl/api/donatie', {
      method: 'POST',
      headers: token ? { [TURNSTILE_HEADER]: token, 'cf-connecting-ip': '203.0.113.7' } : {},
    })

  afterEach(() => {
    delete process.env.TURNSTILE_SECRET_KEY
    vi.unstubAllGlobals()
  })

  it('staat uit zonder geheime sleutel (lokaal en op previews)', async () => {
    expect(await isHuman(request())).toBe(true)
  })

  it('weigert een verzoek zonder token', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'geheim'
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect(await isHuman(request())).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('volgt het oordeel van Cloudflare', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'geheim'
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ success: true }))
      .mockResolvedValueOnce(Response.json({ success: false }))
    vi.stubGlobal('fetch', fetchMock)

    expect(await isHuman(request('goed-token'))).toBe(true)
    expect(await isHuman(request('fout-token'))).toBe(false)

    const body = fetchMock.mock.calls[0][1].body as FormData
    expect(body.get('secret')).toBe('geheim')
    expect(body.get('response')).toBe('goed-token')
    expect(body.get('remoteip')).toBe('203.0.113.7')
  })

  it('weigert als Cloudflare niet bereikbaar is', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'geheim'
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('netwerk')))
    expect(await isHuman(request('token'))).toBe(false)
  })
})

describe('Media afterRead via de Local API', () => {
  it('geeft een relatief pad, ook al heeft het request een nep-URL', () => {
    const doc = afterRead({ doc: photo, req: { url: 'http://localhost', payloadAPI: 'local' } })
    expect(doc.sizes.newsCard.url).toBe('/api/img/newsCard/12?v=2026-11-10T10%3A00%3A00.000Z')
  })
})
