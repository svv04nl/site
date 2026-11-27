import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getPayload } from 'payload'
import { createFakePayload } from '../helpers/fake-payload'

vi.mock('payload', () => ({ getPayload: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
// Geen cache in de test: elke test zijn eigen database.
vi.mock('@/lib/ai/cache', () => ({
  cached: (_key: string, _ttl: number, fn: () => unknown) => fn(),
}))

const { cleanPdfText } = await import('@/lib/pdf-text')
const { searchSite, getPage } = await import('@/lib/ai/tools/site')

const run = (tool: any, input: object) => tool.execute(input, { toolCallId: 't', messages: [] })

describe('cleanPdfText', () => {
  it('haalt opmaakspaties, paginascheidingen en lege regels weg', () => {
    expect(cleanPdfText('Artikel 1      Naam\f\n\n\n\n   De vereniging   heet\tSVV\n')).toBe(
      'Artikel 1 Naam\n\nDe vereniging heet SVV',
    )
  })
})

describe('PDF’s in de zoekindex van de assistent', () => {
  const statuten = `Artikel 1 Naam. ${'x '.repeat(7000)}Artikel 20 Ontbinding van de vereniging.`

  beforeEach(() => {
    vi.mocked(getPayload).mockResolvedValue(
      createFakePayload({
        pages: [],
        audiences: [],
        posts: [],
        media: [
          {
            id: 1,
            alt: 'Statuten SVV’04',
            url: '/media/statuten.pdf',
            mimeType: 'application/pdf',
            text: statuten,
          },
          // Nog niet uitgelezen: komt niet in de index.
          {
            id: 2,
            alt: 'Nieuw document',
            url: '/media/nieuw.pdf',
            mimeType: 'application/pdf',
            text: null,
          },
          { id: 3, alt: 'Foto', url: '/media/foto.webp', mimeType: 'image/webp' },
        ],
      }) as any,
    )
  })

  it('vindt een document op een woord uit de tekst', async () => {
    const { results } = await run(searchSite, { query: 'ontbinding' })
    expect(results).toEqual([
      expect.objectContaining({
        type: 'document',
        title: 'Statuten SVV’04',
        url: '/media/statuten.pdf',
      }),
    ])
    expect((await run(searchSite, { query: 'nieuw document' })).results).toEqual([])
  })

  it('leest een lang document in delen', async () => {
    const first = await run(getPage, { path: '/media/statuten.pdf' })
    expect(first.truncated).toBe(true)
    expect(first.text).not.toContain('Artikel 20')

    const second = await run(getPage, { path: '/media/statuten.pdf', offset: first.nextOffset })
    expect(second.text).toContain('Artikel 20 Ontbinding')
    expect(second.truncated).toBe(false)
    expect(second.nextOffset).toBeUndefined()
  })
})
