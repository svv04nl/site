import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getPayload } from 'payload'
import { createFakePayload } from '../helpers/fake-payload'

vi.mock('payload', () => ({ getPayload: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
// Net als in Next: redirect en notFound gooien, zodat de route daar stopt.
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect ${url}`)
  }),
  permanentRedirect: vi.fn((url: string) => {
    throw new Error(`308 ${url}`)
  }),
  notFound: vi.fn(() => {
    throw new Error('404')
  }),
}))

const { pageHref, pageHrefs } = await import('@/lib/pages')
const { loadPage } = await import('@/lib/page-route')
const { hrefToTarget } = await import('@/lib/app-api/links')

const audiences = [
  { id: 1, slug: 'spelers', name: 'spelers' },
  { id: 2, slug: 'ouders', name: 'ouders' },
]
const pages = [
  { id: 10, slug: 'lidmaatschap', section: 'vereniging', parent: null, audience: null },
  { id: 11, slug: 'vrijwilligerswerk', section: 'doelgroep', parent: null, audience: 4 },
  { id: 12, slug: 'taken', section: 'doelgroep', parent: 11, audience: 4 },
  { id: 13, slug: 'jongste-jeugd', section: 'doelgroep', parent: null, audience: 2 },
  { id: 14, slug: 'whatsapp-community', section: 'info', parent: null, audience: null },
]

describe('pageHref', () => {
  it('bouwt het adres uit de sectie, de doelgroep of /info', () => {
    expect(pageHref({ slug: 'lidmaatschap', section: 'vereniging' })).toBe(
      '/vereniging/lidmaatschap',
    )
    expect(pageHref({ slug: 'jongste-jeugd', section: 'doelgroep', audience: audiences[1] })).toBe(
      '/ouders/jongste-jeugd',
    )
    expect(pageHref({ slug: 'whatsapp-community', section: 'info' })).toBe(
      '/info/whatsapp-community',
    )
  })

  it('volgt bovenliggende pagina’s', () => {
    const parent = { slug: 'vrijwilligerswerk', section: 'doelgroep', audience: audiences[0] }
    expect(pageHref({ slug: 'taken', section: 'doelgroep', audience: audiences[0], parent })).toBe(
      '/spelers/vrijwilligerswerk/taken',
    )
  })

  it('valt zonder geladen doelgroep terug op /vereniging, dat doorstuurt', () => {
    expect(pageHref({ slug: 'jongste-jeugd', section: 'doelgroep', audience: 2 })).toBe(
      '/vereniging/jongste-jeugd',
    )
  })
})

describe('pageHrefs', () => {
  it('rekent alle adressen uit een platte lijst uit, met subpagina’s', () => {
    const hrefs = pageHrefs(pages, [...audiences, { id: 4, slug: 'vrijwilligers' }])
    expect(Object.fromEntries(hrefs)).toEqual({
      10: '/vereniging/lidmaatschap',
      11: '/vrijwilligers/vrijwilligerswerk',
      12: '/vrijwilligers/vrijwilligerswerk/taken',
      13: '/ouders/jongste-jeugd',
      14: '/info/whatsapp-community',
    })
  })
})

describe('loadPage', () => {
  beforeEach(() => {
    vi.mocked(getPayload).mockResolvedValue(
      createFakePayload({
        pages,
        audiences: [...audiences, { id: 4, slug: 'vrijwilligers', name: 'vrijwilligers' }],
      }) as any,
    )
  })

  it('geeft de pagina op haar eigen adres', async () => {
    const page = await loadPage(
      '/ouders/jongste-jeugd',
      { section: { equals: 'doelgroep' }, audience: { equals: 2 } },
      'jongste-jeugd',
    )
    expect(page.id).toBe(13)
  })

  it('stuurt een oud /vereniging-adres permanent door naar de nieuwe plek', async () => {
    const vereniging = { section: { equals: 'vereniging' } }
    await expect(
      loadPage('/vereniging/jongste-jeugd', vereniging, 'jongste-jeugd'),
    ).rejects.toThrow('308 /ouders/jongste-jeugd')
    await expect(
      loadPage('/vereniging/whatsapp-community', vereniging, 'whatsapp-community'),
    ).rejects.toThrow('308 /info/whatsapp-community')
    await expect(
      loadPage('/vereniging/vrijwilligerswerk/taken', vereniging, 'taken'),
    ).rejects.toThrow('308 /vrijwilligers/vrijwilligerswerk/taken')
  })

  it('stuurt een pagina onder de verkeerde doelgroep door', async () => {
    const spelers = { section: { equals: 'doelgroep' }, audience: { equals: 1 } }
    await expect(loadPage('/spelers/jongste-jeugd', spelers, 'jongste-jeugd')).rejects.toThrow(
      '308 /ouders/jongste-jeugd',
    )
  })

  it('stuurt een subpagina zonder haar ouder in het pad door naar het volledige adres', async () => {
    const vrijwilligers = { section: { equals: 'doelgroep' }, audience: { equals: 4 } }
    await expect(loadPage('/vrijwilligers/taken', vrijwilligers, 'taken')).rejects.toThrow(
      'redirect /vrijwilligers/vrijwilligerswerk/taken',
    )
  })

  it('geeft 404 voor een slug die nergens bestaat', async () => {
    await expect(
      loadPage('/vereniging/bestaat-niet', { section: { equals: 'vereniging' } }, 'bestaat-niet'),
    ).rejects.toThrow('404')
  })
})

describe('hrefToTarget', () => {
  it('opent pagina’s onder een doelgroep en onder /info als pagina in de app', () => {
    expect(hrefToTarget('/ouders/jongste-jeugd')).toEqual({
      kind: 'screen',
      screen: 'page',
      slug: 'jongste-jeugd',
    })
    expect(hrefToTarget('/info/whatsapp-community')).toEqual({
      kind: 'screen',
      screen: 'page',
      slug: 'whatsapp-community',
    })
    expect(hrefToTarget('/ouders')).toEqual({ kind: 'screen', screen: 'audience', slug: 'ouders' })
  })
})
