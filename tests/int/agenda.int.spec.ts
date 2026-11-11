// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('payload', () => ({ getPayload: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/lib/clubdata/fetch', () => ({ fetchClubData: vi.fn() }))
vi.mock('@/lib/ai/tools/site', () => ({
  loadTeams: vi.fn(async () => [
    {
      id: 1,
      name: "SVV'04 1",
      slug: 'svv04-1',
      teamcode: 170046,
      category: 'senioren',
      type: null,
      order: 1,
    },
  ]),
}))

const { fetchClubData } = await import('@/lib/clubdata/fetch')
const { loadTeamMatches } = await import('@/lib/app-api/matches')
const { withEdgeCache } = await import('@/lib/edge-cache')
const { withoutIcsExtension } = await import('@/lib/agenda/ics')

const match = (code: number, date: string, extra: Record<string, unknown> = {}) => ({
  wedstrijdcode: code,
  wedstrijddatum: `${date}T00:00:00+01:00`,
  aanvangstijd: '14:30',
  thuisteam: "SVV'04 1",
  uitteam: 'Beilen 1',
  thuisteamid: 170046,
  uitteamid: 999,
  thuisteamclubrelatiecode: 'BBKT71F',
  uitteamclubrelatiecode: 'XXXX01',
  ...extra,
})

describe('loadTeamMatches', () => {
  afterEach(() => vi.clearAllMocks())

  it('vraagt alleen dit team op bij Sportlink en zet een uitslag in de plaats van het programma', async () => {
    vi.mocked(fetchClubData).mockImplementation(
      async (article: string) =>
        (article === 'programma'
          ? [match(2, '2026-11-21'), match(1, '2026-11-14')]
          : [
              match(1, '2026-11-14', { uitslag: '3 - 1' }),
              match(0, '2026-11-07', { uitslag: '0 - 0' }),
            ]) as never,
    )

    const matches = await loadTeamMatches(170046)

    const calls = vi.mocked(fetchClubData).mock.calls
    expect(calls.map(([article]) => article).sort()).toEqual(['programma', 'uitslagen'])
    for (const [, params] of calls) {
      expect(params?.teamcode).toBe('170046')
    }
    expect(calls.find(([a]) => a === 'uitslagen')?.[1]).toMatchObject({
      weekoffset: '-4',
      aantaldagen: '35',
    })

    expect(matches.map((m) => m.id)).toEqual(['0', '1', '2'])
    expect(matches.find((m) => m.id === '1')?.status).toBe('played')
  })
})

describe('withEdgeCache', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('bouwt zonder Cache API (next dev, tests) gewoon het antwoord', async () => {
    const build = vi.fn(async () => new Response('feed'))
    const res = await withEdgeCache(new Request('https://svv04.nl/api/agenda/team/x.ics'), build)
    expect(await res.text()).toBe('feed')
    expect(build).toHaveBeenCalledOnce()
  })

  it('geeft een bewaard antwoord terug en bewaart alleen goede antwoorden', async () => {
    const store = new Map<string, Response>()
    vi.stubGlobal('caches', {
      default: {
        match: vi.fn(async (req: Request) => store.get(req.url)?.clone()),
        put: vi.fn(async (req: Request, res: Response) => void store.set(req.url, res)),
      },
    })
    const url = 'https://svv04.nl/api/agenda/team/svv04-1.ics'
    const build = vi.fn(async () => new Response('feed'))

    expect(await (await withEdgeCache(new Request(url), build)).text()).toBe('feed')
    expect(await (await withEdgeCache(new Request(url), build)).text()).toBe('feed')
    expect(build).toHaveBeenCalledOnce()

    const missing = vi.fn(async () => new Response('Team niet gevonden', { status: 404 }))
    await withEdgeCache(new Request(`${url}-onbekend`), missing)
    await withEdgeCache(new Request(`${url}-onbekend`), missing)
    expect(missing).toHaveBeenCalledTimes(2)
  })
})

describe('withoutIcsExtension', () => {
  it('haalt .ics van de naam af en weigert een URL zonder extensie', () => {
    expect(withoutIcsExtension('svv04-1.ics')).toBe('svv04-1')
    expect(withoutIcsExtension('12345678.ICS')).toBe('12345678')
    expect(withoutIcsExtension('svv04-1')).toBeNull()
    expect(withoutIcsExtension('.ics')).toBeNull()
  })
})
