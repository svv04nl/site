// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

vi.mock('payload', () => ({ getPayload: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))

const { hrefToTarget } = await import('@/lib/app-api/links')
const { toE164, shortTeamName, titleCase } = await import('@/lib/app-api/format')
const { thisWeekend, programRange, resultsRange, dayLabel } = await import('@/lib/app-api/dates')
const { lexicalToBlocks, markdownToBlocks, anchorsOf } = await import('@/lib/app-api/richtext')
const { toMatch } = await import('@/lib/app-api/matches')
const { enumParam, listParam, ApiError } = await import('@/lib/app-api/http')
const { checkRateLimit } = await import('@/lib/app-api/rate-limit')

describe('hrefToTarget', () => {
  it.each([
    ['/', { kind: 'screen', screen: 'home' }],
    ['/nieuws', { kind: 'screen', screen: 'posts' }],
    ['/nieuws/een-bericht', { kind: 'screen', screen: 'post', slug: 'een-bericht' }],
    ['/teams/svv04-1?tab=stand', { kind: 'screen', screen: 'team', slug: 'svv04-1' }],
    ['/programma', { kind: 'screen', screen: 'program' }],
    ['/agenda', { kind: 'screen', screen: 'activities' }],
    ['/vereniging/vrijwilligerswerk/taken', { kind: 'screen', screen: 'page', slug: 'taken' }],
    ['/privacy', { kind: 'screen', screen: 'page', slug: 'privacy' }],
    ['/ouders', { kind: 'screen', screen: 'audience', slug: 'ouders' }],
    ['/vereniging/sponsoring', { kind: 'screen', screen: 'audience', slug: 'sponsoring' }],
    ['https://svv04.nl/nieuws/x', { kind: 'screen', screen: 'post', slug: 'x' }],
  ])('%s becomes a screen', (href, expected) => {
    expect(hrefToTarget(href)).toEqual(expected)
  })

  it('keeps the contact topic from ?afdeling=', () => {
    expect(hrefToTarget('/contact?afdeling=sponsorgroep')).toEqual({
      kind: 'screen',
      screen: 'contacts',
      contactTopic: 'sponsorgroep',
    })
  })

  it('opens other websites in the in-app browser and mail links outside it', () => {
    expect(hrefToTarget('https://mijn.knvb.nl')).toEqual({
      kind: 'browser',
      url: 'https://mijn.knvb.nl/',
      inApp: true,
    })
    expect(hrefToTarget('mailto:secretaris@svv04.nl')).toEqual({
      kind: 'browser',
      url: 'mailto:secretaris@svv04.nl',
      inApp: false,
    })
  })

  it('sends site paths without an app screen to the website', () => {
    expect(hrefToTarget('/tribune')).toEqual({ kind: 'browser', url: 'https://svv04.nl/tribune', inApp: true })
  })
})

describe('format', () => {
  it('turns Dutch phone numbers into E.164', () => {
    expect(toE164('06-12345678')).toBe('+31612345678')
    expect(toE164('0524-531656')).toBe('+31524531656')
    expect(toE164('+31 6 1234 5678')).toBe('+31612345678')
    expect(toE164('0031612345678')).toBe('+31612345678')
    expect(toE164('12345')).toBeUndefined()
    expect(toE164(null)).toBeUndefined()
  })

  it('shortens team names only when the short name says something', () => {
    expect(shortTeamName("SVV'04 O11-1JM")).toBe('O11-1JM')
    expect(shortTeamName("SVV'04 VR18+1")).toBe('VR18+1')
    expect(shortTeamName("SVV'04 1")).toBe("SVV'04 1")
    expect(shortTeamName("SVV'04 35+1")).toBe("SVV'04 35+1")
  })

  it('title-cases Sportlink places', () => {
    expect(titleCase('EMMEN')).toBe('Emmen')
    expect(titleCase('SCHOONEBEEK-NOORD')).toBe('Schoonebeek-Noord')
  })
})

describe('periods', () => {
  // 2026-10-31 is a Saturday.
  it('uses the current weekend on Saturday and Sunday, the coming one before', () => {
    expect(thisWeekend('2026-10-31')).toEqual({ from: '2026-10-31', to: '2026-11-01' })
    expect(thisWeekend('2026-11-01')).toEqual({ from: '2026-10-31', to: '2026-11-01' })
    expect(thisWeekend('2026-11-02')).toEqual({ from: '2026-11-07', to: '2026-11-08' })
    expect(thisWeekend('2026-11-06')).toEqual({ from: '2026-11-07', to: '2026-11-08' })
  })

  it('derives the other program and results periods', () => {
    expect(programRange('next-weekend', '2026-10-31')).toEqual({ from: '2026-11-07', to: '2026-11-08' })
    expect(programRange('this-week', '2026-10-31')).toEqual({ from: '2026-10-26', to: '2026-11-01' })
    expect(programRange('next-week', '2026-10-31')).toEqual({ from: '2026-11-02', to: '2026-11-08' })
    expect(resultsRange('last-weekend', '2026-10-31')).toEqual({ from: '2026-10-24', to: '2026-10-25' })
    expect(resultsRange('last-week', '2026-10-31')).toEqual({ from: '2026-10-19', to: '2026-10-25' })
  })

  it('labels days', () => {
    expect(dayLabel('2026-10-31')).toBe('Zaterdag 31 oktober')
  })
})

describe('lexicalToBlocks', () => {
  const text = (value: string, format = 0) => ({ type: 'text', text: value, format })
  const state = (...children: unknown[]) => ({ root: { type: 'root', children } })

  it('converts paragraphs with bold, italic and links, and drops empty ones', () => {
    const blocks = lexicalToBlocks(
      state(
        { type: 'paragraph', children: [text('Hoi '), text('dik', 1), text(' en '), text('schuin', 2)] },
        { type: 'paragraph', children: [] },
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              fields: { linkType: 'internal', doc: { relationTo: 'pages', value: { slug: 'lidmaatschap' } } },
              children: [text('Lid worden')],
            },
          ],
        },
      ),
    )
    expect(blocks).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'Hoi ' }, { text: 'dik', bold: true }, { text: ' en ' }, { text: 'schuin', italic: true }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Lid worden', link: { kind: 'screen', screen: 'page', slug: 'lidmaatschap' } }],
      },
    ])
  })

  it('gives headings unique anchor ids and collects level 2 as anchors', () => {
    const blocks = lexicalToBlocks(
      state(
        { type: 'heading', tag: 'h2', children: [text('Contributie')] },
        { type: 'heading', tag: 'h3', children: [text('Contributie')] },
        { type: 'heading', tag: 'h2', children: [text('Betalen')] },
      ),
    )
    expect(blocks).toEqual([
      { type: 'heading', level: 2, id: 'contributie', text: 'Contributie' },
      { type: 'heading', level: 3, id: 'contributie-2', text: 'Contributie' },
      { type: 'heading', level: 2, id: 'betalen', text: 'Betalen' },
    ])
    expect(anchorsOf(blocks)).toEqual([
      { id: 'contributie', title: 'Contributie' },
      { id: 'betalen', title: 'Betalen' },
    ])
  })

  it('flattens nested lists', () => {
    const [list] = lexicalToBlocks(
      state({
        type: 'list',
        listType: 'bullet',
        children: [
          {
            type: 'listitem',
            children: [
              text('een'),
              { type: 'list', listType: 'bullet', children: [{ type: 'listitem', children: [text('binnen')] }] },
            ],
          },
          { type: 'listitem', children: [text('twee')] },
        ],
      }),
    )
    expect(list).toEqual({
      type: 'list',
      ordered: false,
      items: [[{ text: 'een' }], [{ text: 'binnen' }], [{ text: 'twee' }]],
    })
  })

  it('maps the supported blocks and turns the others into unsupported with a web link', () => {
    const block = (fields: Record<string, unknown>) => ({ type: 'block', fields })
    const blocks = lexicalToBlocks(
      state(
        block({ blockType: 'ctaBlock', buttonLabel: 'Direct aanmelden', buttonUrl: 'https://mijn.knvb.nl' }),
        block({ blockType: 'quoteBlock', text: 'Je *MAG* lid worden' }),
        block({ blockType: 'taskTableBlock', heading: 'Taken', rows: [] }),
        block({ blockType: 'qrCodeBlock', url: 'https://svv04.nl' }),
      ),
      { webUrl: 'https://svv04.nl/vereniging/x' },
    )
    expect(blocks).toEqual([
      {
        type: 'cta',
        title: 'Direct aanmelden',
        action: {
          title: 'Direct aanmelden',
          target: { kind: 'browser', url: 'https://mijn.knvb.nl/', inApp: true },
        },
      },
      { type: 'quote', text: 'Je *MAG* lid worden' },
      { type: 'unsupported', blockType: 'taskTableBlock', title: 'Taken', webUrl: 'https://svv04.nl/vereniging/x' },
    ])
  })

  it('converts a pricing table to cents and keeps what is not an amount as a note', () => {
    const [table] = lexicalToBlocks(
      state({
        type: 'block',
        fields: {
          blockType: 'pricingTableBlock',
          rows: [
            { category: 'Senioren', perKwartaal: '€48,30', perSeizoen: '€193,20' },
            { category: 'Donateur', perKwartaal: '€30,00', perSeizoen: 'Echtpaar: €37,50' },
          ],
        },
      }),
    )
    expect(table).toMatchObject({
      type: 'pricingTable',
      rows: [
        { label: 'Senioren', amounts: { quarter: 4830, season: 19320 } },
        { label: 'Donateur', amounts: { quarter: 3000 }, note: 'Per seizoen: Echtpaar: €37,50' },
      ],
    })
  })
})

describe('markdownToBlocks', () => {
  it('converts headings, paragraphs, lists, bold and links', () => {
    const blocks = markdownToBlocks(
      [
        'Vragen? Mail [de secretaris](mailto:secretaris@svv04.nl).',
        '',
        '## Gegevens',
        '',
        '- **Naam:** en adres',
        '- Telefoon',
        '',
        '### Detail',
        'Eerste regel',
        'tweede regel',
      ].join('\n'),
    )
    expect(blocks).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'Vragen? Mail ' },
          { text: 'de secretaris', link: { kind: 'browser', url: 'mailto:secretaris@svv04.nl', inApp: false } },
          { text: '.' },
        ],
      },
      { type: 'heading', level: 2, id: 'gegevens', text: 'Gegevens' },
      {
        type: 'list',
        ordered: false,
        items: [[{ text: 'Naam:', bold: true }, { text: ' en adres' }], [{ text: 'Telefoon' }]],
      },
      { type: 'heading', level: 3, id: 'detail', text: 'Detail' },
      { type: 'paragraph', children: [{ text: 'Eerste regel tweede regel' }] },
    ])
  })
})

describe('toMatch', () => {
  const lookup = {
    byCode: new Map([[329276, { id: 1, name: "SVV'04 O10-1", slug: 'svv04-o10-1' } as any]]),
    byName: new Map(),
  }
  const base = {
    wedstrijdcode: 21165232,
    wedstrijddatum: '2026-10-31T08:30:00+0100',
    aanvangstijd: '08:30',
    thuisteam: 'DZOH O10-1',
    uitteam: "SVV'04 O10-1",
    thuisteamid: 334009,
    uitteamid: 329276,
    thuisteamclubrelatiecode: 'BBBC31U',
    uitteamclubrelatiecode: 'GKWH14N',
    accommodatie: 'Sportpark Zwanenveld',
    veld: 'veld 2 B1',
    plaats: 'EMMEN',
    klasse: 'Hoofdklasse (2e fase)',
  }

  it('maps an away match with the own team resolved by team code', () => {
    const match = toMatch({ ...base, status: 'Te spelen' }, lookup)
    expect(match).toMatchObject({
      id: '21165232',
      date: '2026-10-31',
      kickoff: '08:30',
      startsAt: '2026-10-31T08:30:00+01:00',
      status: 'scheduled',
      competition: 'Hoofdklasse',
      ownTeamSlug: 'svv04-o10-1',
      isHomeGame: false,
      home: { name: 'DZOH O10-1', isOwn: false },
      away: { name: "SVV'04 O10-1", isOwn: true, teamSlug: 'svv04-o10-1' },
      venue: { name: 'Sportpark Zwanenveld', shortName: 'Zwanenveld', mapsQuery: 'Sportpark Zwanenveld, Emmen', field: 'veld 2 B1' },
      result: null,
    })
    expect(match.home.logoUrl).toContain('BBBC31U')
  })

  it('maps statuses and only keeps a score for played matches', () => {
    expect(toMatch({ ...base, status: 'Afgelast' }, lookup).status).toBe('cancelled')
    expect(toMatch({ ...base, status: 'Uitgesteld' }, lookup).status).toBe('postponed')
    const played = toMatch({ ...base, status: 'Uitgespeeld', uitslag: '2 - 1' }, lookup)
    expect(played.status).toBe('played')
    expect(played.result).toEqual({ home: 2, away: 1 })
    expect(toMatch({ ...base, status: 'Afgelast', uitslag: '2 - 1' }, lookup).result).toBeNull()
  })
})

describe('http helpers', () => {
  const url = (query: string) => new URL(`https://svv04.nl/api/app/x?${query}`)

  it('reads slug lists and drops anything that is not a slug', () => {
    expect(listParam(url('teams=svv04-1,%20svv04-o11-1jm,Bad Slug,svv04-1'), 'teams')).toEqual([
      'svv04-1',
      'svv04-o11-1jm',
    ])
    expect(listParam(url(''), 'teams')).toEqual([])
  })

  it('rejects enum values outside the contract with a 400', () => {
    expect(enumParam(url(''), 'venue', ['all', 'home'] as const, 'all')).toBe('all')
    expect(enumParam(url('venue=home'), 'venue', ['all', 'home'] as const, 'all')).toBe('home')
    expect(() => enumParam(url('venue=nope'), 'venue', ['all', 'home'] as const, 'all')).toThrow(ApiError)
  })
})

describe('checkRateLimit', () => {
  it('allows ten requests a minute per visitor and then says when to retry', () => {
    const now = 1_000_000
    for (let i = 0; i < 10; i++) expect(checkRateLimit('visitor-a', now + i).ok).toBe(true)
    const blocked = checkRateLimit('visitor-a', now + 11)
    expect(blocked.ok).toBe(false)
    expect(blocked.ok === false && blocked.retryAfter).toBeGreaterThan(0)
    expect(checkRateLimit('visitor-b', now + 11).ok).toBe(true)
    expect(checkRateLimit('visitor-a', now + 61_000).ok).toBe(true)
  })
})
