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
    {
      id: 2,
      name: 'JO11-1',
      slug: 'jo11-1',
      teamcode: 170047,
      category: 'jeugd',
      type: null,
      order: 2,
    },
  ]),
}))

const { fetchClubData } = await import('@/lib/clubdata/fetch')
const { loadTeamMatches, loadClubProgram } = await import('@/lib/app-api/matches')
const { sharedCache } = await import('@/lib/shared-cache')
const { matchesToIcs, withoutIcsExtension } = await import('@/lib/agenda/ics')
const { GET: teamFeed } = await import('@/app/(frontend)/api/agenda/team/[slug]/route')
const { GET: clubFeed } = await import('@/app/(frontend)/api/agenda/[feed]/route')

const match = (
  code: number,
  date: string,
  team: 'svv04-1' | 'jo11-1',
  extra: Record<string, unknown> = {},
) => ({
  wedstrijdcode: code,
  wedstrijddatum: `${date}T00:00:00+01:00`,
  aanvangstijd: '14:30',
  thuisteam: team === 'svv04-1' ? "SVV'04 1" : "SVV'04 JO11-1",
  uitteam: 'Beilen 1',
  thuisteamid: team === 'svv04-1' ? 170046 : 170047,
  uitteamid: 999,
  thuisteamclubrelatiecode: 'GKWH14N',
  uitteamclubrelatiecode: 'XXXX01',
  ...extra,
})

// Program: two matches of the first team (one today) and one youth match. Results: today's
// match with its score, and one of last week.
function sportlink() {
  vi.mocked(fetchClubData).mockImplementation(
    async (article: string) =>
      (article === 'programma'
        ? [
            match(2, '2026-11-21', 'svv04-1'),
            match(1, '2026-11-14', 'svv04-1'),
            match(5, '2026-11-15', 'jo11-1'),
          ]
        : [
            match(1, '2026-11-14', 'svv04-1', { uitslag: '3 - 1' }),
            match(0, '2026-11-07', 'svv04-1', { uitslag: '0 - 0' }),
          ]) as never,
  )
}

afterEach(() => vi.clearAllMocks())

describe('sharedCache', () => {
  it('runs the loader itself outside a Next request (tests, scripts)', async () => {
    const load = vi.fn(async () => 42)
    expect(await sharedCache(load, 'test-key', { revalidate: 60 })()).toBe(42)
    expect(load).toHaveBeenCalledOnce()
  })
})

describe('club matches', () => {
  it('asks Sportlink for the whole club, not cached a second time by fetch', async () => {
    sportlink()
    await loadClubProgram()
    const calls = vi.mocked(fetchClubData).mock.calls
    expect(calls.map(([article]) => article).sort()).toEqual(['programma', 'uitslagen'])
    for (const [, , options] of calls) {
      expect(options).toEqual({ fresh: true })
    }
  })

  it('gives a team its matches, a result replacing the same match from the program', async () => {
    sportlink()
    const matches = await loadTeamMatches('svv04-1')
    expect(matches.map((m) => m.id)).toEqual(['0', '1', '2'])
    expect(matches.find((m) => m.id === '1')?.status).toBe('played')
  })
})

describe('agenda feeds', () => {
  it('team feed: only that team, with links to the match pages on the requesting site', async () => {
    sportlink()
    const res = await teamFeed(new Request('https://preview.example/api/agenda/team/svv04-1.ics'), {
      params: Promise.resolve({ slug: 'svv04-1.ics' }),
    })
    const ics = await res.text()
    expect(res.headers.get('content-type')).toContain('text/calendar')
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(3)
    expect(ics).toContain('URL:https://preview.example/wedstrijd/2')
    expect(ics).not.toContain('wedstrijd-5@')
  })

  it('programma feed: filters the shared lists by team, each match once', async () => {
    sportlink()
    const res = await clubFeed(
      new Request('https://svv04.nl/api/agenda/programma.ics?teams=jo11-1,NIET-GELDIG'),
      { params: Promise.resolve({ feed: 'programma.ics' }) },
    )
    const ics = await res.text()
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1)
    expect(ics).toContain('UID:wedstrijd-5@svv04.nl')

    const all = await (
      await clubFeed(new Request('https://svv04.nl/api/agenda/programma.ics'), {
        params: Promise.resolve({ feed: 'programma.ics' }),
      })
    ).text()
    // 0, 1, 2 and 5: today's match is in both lists and counts once.
    expect(all.match(/BEGIN:VEVENT/g)).toHaveLength(4)
  })

  it('links every event to its match page', () => {
    const ics = matchesToIcs([], 'leeg')
    expect(ics).toContain('X-WR-CALNAME:leeg')
  })
})

describe('withoutIcsExtension', () => {
  it('strips .ics from the name and refuses a URL without the extension', () => {
    expect(withoutIcsExtension('svv04-1.ics')).toBe('svv04-1')
    expect(withoutIcsExtension('12345678.ICS')).toBe('12345678')
    expect(withoutIcsExtension('svv04-1')).toBeNull()
    expect(withoutIcsExtension('.ics')).toBeNull()
  })
})
