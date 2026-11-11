// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('next/headers', () => ({ cookies: vi.fn() }))
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

const { cookies } = await import('next/headers')
const gate = await import('@/lib/access-gate')
const { proxy } = await import('@/proxy')
const { submitAccessCode } = await import('@/app/(gate)/toegang/actions')

const CODE = 'testcode-123'
const original = { code: process.env.SITE_ACCESS_CODE, secret: process.env.PAYLOAD_SECRET }

beforeEach(() => {
  process.env.SITE_ACCESS_CODE = CODE
  process.env.PAYLOAD_SECRET = 'test-secret'
  vi.clearAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
  for (const [key, value] of [
    ['SITE_ACCESS_CODE', original.code],
    ['PAYLOAD_SECRET', original.secret],
  ] as const) {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
})

describe('isExemptPath', () => {
  it.each([
    '/api/mollie-webhook',
    '/api/cron/reconcile-donations',
    '/api/cron/sync-staff',
    '/api/donatie',
    '/admin',
    '/admin/collections/donations',
    '/toegang',
    '/_next/static/chunks/app.js',
    '/_next/image',
    '/api/img/newsCard/12',
    '/media/foto.jpg',
    '/robots.txt',
    '/logo.webp',
  ])('laat %s altijd door', (path) => {
    expect(gate.isExemptPath(path)).toBe(true)
  })

  it.each(['/', '/tribune', '/tribune/bedankt', '/nieuws/een-bericht', '/contact', '/sitemap.xml'])(
    'zet %s achter de code',
    (path) => {
      expect(gate.isExemptPath(path)).toBe(false)
    },
  )

  it('laat geen pagina door die alleen met dezelfde letters begint', () => {
    expect(gate.isExemptPath('/administratie')).toBe(false)
    expect(gate.isExemptPath('/apiary')).toBe(false)
    expect(gate.isExemptPath('/toegang-nodig')).toBe(false)
  })
})

describe('accessToken en safeEqual', () => {
  it('geeft hetzelfde token voor dezelfde code en een ander token voor een andere code', async () => {
    expect(await gate.accessToken(CODE)).toBe(await gate.accessToken(CODE))
    expect(await gate.accessToken(CODE)).not.toBe(await gate.accessToken('andere-code'))
  })

  it('bevat de code zelf niet in het token', async () => {
    expect(await gate.accessToken(CODE)).not.toContain(CODE)
  })

  it('maakt een ander token als het geheim verandert', async () => {
    const before = await gate.accessToken(CODE)
    process.env.PAYLOAD_SECRET = 'ander-geheim'
    expect(await gate.accessToken(CODE)).not.toBe(before)
  })

  it('vergelijkt strings correct', () => {
    expect(gate.safeEqual('abc', 'abc')).toBe(true)
    expect(gate.safeEqual('abc', 'abd')).toBe(false)
    expect(gate.safeEqual('abc', 'abcd')).toBe(false)
    expect(gate.safeEqual('', 'a')).toBe(false)
    expect(gate.safeEqual('', '')).toBe(true)
  })
})

describe('safeRedirectTarget', () => {
  it('laat alleen paden op deze site toe', () => {
    expect(gate.safeRedirectTarget('/tribune?x=1')).toBe('/tribune?x=1')
    expect(gate.safeRedirectTarget('/nieuws/post')).toBe('/nieuws/post')
  })

  it.each([
    '//evil.com',
    'https://evil.com',
    'evil.com',
    '/\\evil.com',
    '/toegang',
    '/toegang?next=/x',
    '',
    undefined,
    null,
    42,
  ])('stuurt %s naar de homepage', (value) => {
    expect(gate.safeRedirectTarget(value)).toBe('/')
  })
})

describe('proxy', () => {
  const request = (path: string, cookie?: string) =>
    new NextRequest(`https://svv04.nl${path}`, {
      headers: cookie ? { cookie: `${gate.ACCESS_COOKIE}=${cookie}` } : {},
    })
  const passes = (response: Response) => response.headers.get('x-middleware-next') === '1'

  it('doet niets als er geen toegangscode is ingesteld', async () => {
    delete process.env.SITE_ACCESS_CODE

    expect(passes(await proxy(request('/tribune')))).toBe(true)
  })

  it('doet niets als de toegangscode leeg is', async () => {
    process.env.SITE_ACCESS_CODE = '   '

    expect(passes(await proxy(request('/tribune')))).toBe(true)
  })

  it('stuurt een bezoeker zonder cookie naar de toegangspagina, met het oorspronkelijke pad', async () => {
    const response = await proxy(request('/tribune?bron=mail'))

    expect(response.status).toBe(307)
    const location = new URL(response.headers.get('location')!)
    expect(location.pathname).toBe('/toegang')
    expect(location.searchParams.get('next')).toBe('/tribune?bron=mail')
  })

  it('laat het pad weg bij de homepage', async () => {
    const response = await proxy(request('/'))

    const location = new URL(response.headers.get('location')!)
    expect(location.pathname).toBe('/toegang')
    expect(location.searchParams.has('next')).toBe(false)
  })

  it('houdt de poort uit zoekmachines en caches', async () => {
    const response = await proxy(request('/tribune'))

    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow')
    expect(response.headers.get('cache-control')).toBe('no-store')
  })

  it('laat een bezoeker met het juiste cookie door', async () => {
    const token = await gate.accessToken(CODE)

    expect(passes(await proxy(request('/tribune', token)))).toBe(true)
  })

  it('weigert een verkeerd of verlopen cookie', async () => {
    expect((await proxy(request('/tribune', 'verzonnen'))).status).toBe(307)
    expect((await proxy(request('/tribune', await gate.accessToken('andere-code')))).status).toBe(
      307,
    )
    // De code die in de cookie staat, is niet het token.
    expect((await proxy(request('/tribune', CODE))).status).toBe(307)
  })

  it('maakt cookies ongeldig zodra de code verandert', async () => {
    const token = await gate.accessToken(CODE)
    process.env.SITE_ACCESS_CODE = 'nieuwe-code'

    expect((await proxy(request('/tribune', token))).status).toBe(307)
  })

  it.each([
    '/api/mollie-webhook',
    '/api/cron/reconcile-donations',
    '/api/donatie',
    '/admin',
    '/toegang',
    '/_next/static/chunks/app.js',
    '/robots.txt',
    '/api/img/hero/7',
  ])(
    'laat %s zonder cookie door, zodat Mollie, cron, admin en beeldformaten blijven werken',
    async (path) => {
      expect(passes(await proxy(request(path)))).toBe(true)
    },
  )

  it('zet elke gewone pagina achter de code', async () => {
    for (const path of [
      '/',
      '/contact',
      '/nieuws/een-bericht',
      '/tribune/bedankt',
      '/sitemap.xml',
    ]) {
      expect((await proxy(request(path))).status).toBe(307)
    }
  })
})

describe('submitAccessCode', () => {
  const set = vi.fn()

  const form = (fields: Record<string, string>) => {
    const data = new FormData()
    for (const [key, value] of Object.entries(fields)) {
      data.set(key, value)
    }
    return data
  }

  // Alleen setTimeout is nep, zodat de echte (asynchrone) crypto gewoon doorloopt. Tussen de
  // stappen krijgt de echte event loop de kans om verder te gaan.
  const tick = async (ms: number) => {
    await new Promise((resolve) => setImmediate(resolve))
    await vi.advanceTimersByTimeAsync(ms)
  }

  // Runs the action until it is done. The crypto runs on a real thread and can take a while on
  // a slow CI runner, so keep yielding until the action settles (a fixed number of rounds left
  // the fake 600 ms pause unadvanced there, and the test hung until its timeout).
  const submit = async (fields: Record<string, string>) => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    let settled = false
    const result = submitAccessCode(null, form(fields))
      .catch((error: Error) => error)
      .finally(() => {
        settled = true
      })
    for (let i = 0; !settled; i++) {
      if (i > 10_000) {
        throw new Error('submitAccessCode did not settle')
      }
      await tick(50)
    }
    return result
  }

  beforeEach(() => {
    vi.mocked(cookies).mockResolvedValue({ set } as any)
  })

  it('zet bij de juiste code een cookie en stuurt door naar het gevraagde pad', async () => {
    const result = await submit({ code: CODE, next: '/tribune' })

    expect(result).toBeInstanceOf(Error)
    expect((result as Error).message).toBe('NEXT_REDIRECT:/tribune')
    expect(set).toHaveBeenCalledTimes(1)
    const [name, value, options] = set.mock.calls[0]
    expect(name).toBe(gate.ACCESS_COOKIE)
    expect(value).toBe(await gate.accessToken(CODE))
    expect(value).not.toContain(CODE)
    expect(options).toMatchObject({
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: gate.ACCESS_MAX_AGE,
    })
  })

  it('negeert spaties rond de code', async () => {
    const result = await submit({ code: `  ${CODE} `, next: '/' })

    expect((result as Error).message).toBe('NEXT_REDIRECT:/')
    expect(set).toHaveBeenCalled()
  })

  it('geeft bij een verkeerde code een foutmelding en zet geen cookie', async () => {
    const result = await submit({ code: 'verkeerd', next: '/tribune' })

    expect(result).toEqual({ error: expect.stringContaining('klopt niet') })
    expect(set).not.toHaveBeenCalled()
  })

  it('maakt onderscheid tussen hoofdletters en kleine letters', async () => {
    const result = await submit({ code: CODE.toUpperCase(), next: '/' })

    expect(result).toEqual({ error: expect.any(String) })
    expect(set).not.toHaveBeenCalled()
  })

  it('geeft bij een lege code een foutmelding', async () => {
    const result = await submit({ code: '', next: '/' })

    expect(result).toEqual({ error: expect.any(String) })
    expect(set).not.toHaveBeenCalled()
  })

  it('wacht even bij een verkeerde code, tegen gokken', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    let done = false
    const pending = submitAccessCode(null, form({ code: 'fout', next: '/' })).then(
      () => (done = true),
    )

    // Eerst de echte crypto laten afronden, tot de actie op zijn pauze wacht (een nep-timer staat
    // klaar). Op een trage CI-runner duurt dat langer dan een vast aantal rondes.
    for (let i = 0; vi.getTimerCount() === 0; i++) {
      if (i > 10_000) {
        throw new Error('submitAccessCode never started its pause')
      }
      await new Promise((resolve) => setImmediate(resolve))
    }

    // Na 300 ms nep-tijd is er nog geen antwoord, na 700 ms wel.
    await vi.advanceTimersByTimeAsync(300)
    expect(done).toBe(false)
    await vi.advanceTimersByTimeAsync(400)
    await pending
    expect(done).toBe(true)
  })

  it('stuurt nooit door naar een andere site', async () => {
    for (const next of ['//evil.com', 'https://evil.com', '/\\evil.com']) {
      const result = await submit({ code: CODE, next })
      expect((result as Error).message).toBe('NEXT_REDIRECT:/')
    }
  })

  it('stuurt naar de homepage als de poort uit staat', async () => {
    delete process.env.SITE_ACCESS_CODE

    const result = await submit({ code: CODE, next: '/tribune' })

    expect((result as Error).message).toBe('NEXT_REDIRECT:/')
    expect(set).not.toHaveBeenCalled()
  })
})
