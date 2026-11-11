// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createFakePayload, fundraiserRow, type FakePayload } from '../helpers/fake-payload'

vi.mock('payload', () => ({ getPayload: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/lib/turnstile', () => ({ isHuman: vi.fn() }))
vi.mock('@/lib/mollie', () => ({ createPayment: vi.fn(), getPayment: vi.fn() }))

const { getPayload } = await import('payload')
const { isHuman } = await import('@/lib/turnstile')
const { createPayment } = await import('@/lib/mollie')
const { POST } = await import('@/app/(frontend)/api/donatie/route')

let payload: FakePayload

const valid = { name: 'Jan Jansen', email: 'jan@example.nl', amount: 65, coverFee: true }

function post(body: unknown, origin = 'https://svv04.nl') {
  return POST(new Request(`${origin}/api/donatie`, { method: 'POST', body: JSON.stringify(body) }))
}

function setup(fundraiser: Record<string, unknown> | null = fundraiserRow) {
  payload = createFakePayload({ fundraisers: fundraiser ? [fundraiser] : [] })
  vi.mocked(getPayload).mockResolvedValue(payload as any)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(isHuman).mockResolvedValue(true)
  vi.mocked(createPayment).mockResolvedValue({
    id: 'tr_test1',
    status: 'open',
    _links: { checkout: { href: 'https://mollie.test/checkout/abc' } },
  } as any)
  setup()
})

describe('POST /api/donatie', () => {
  it('maakt een donatie en een Mollie-betaling en geeft de checkout-URL terug', async () => {
    const res = await post(valid)

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ checkoutUrl: 'https://mollie.test/checkout/abc' })

    const [donation] = payload.db.donations
    expect(donation).toMatchObject({
      fundraiser: 1,
      name: 'Jan Jansen',
      email: 'jan@example.nl',
      amount: 65,
      units: 2,
      freeAmount: 5,
      fee: 0.29,
      status: 'open',
      mollieId: 'tr_test1',
    })
    expect(donation.publicToken).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('rekent het bedrag server-side uit en vraagt Mollie om donatie plus transactiekosten', async () => {
    await post({ ...valid, amount: 65 })

    const call = vi.mocked(createPayment).mock.calls[0][0]
    expect(call.amount).toBe(65.29)
    expect(call.description).toBe('Donatie Renovatie tribune')
    expect(call.redirectUrl).toBe(
      `https://svv04.nl/tribune/bedankt?t=${payload.db.donations[0].publicToken}`,
    )
    expect(call.webhookUrl).toBe('https://svv04.nl/api/mollie-webhook')
  })

  it('rekent geen transactiekosten als de donateur die niet wil betalen', async () => {
    await post({ ...valid, coverFee: false })

    expect(payload.db.donations[0].fee).toBe(0)
    expect(vi.mocked(createPayment).mock.calls[0][0].amount).toBe(65)
  })

  it('vertrouwt de transactiekosten niet uit de browser', async () => {
    await post({ ...valid, coverFee: true, fee: 0 })

    expect(payload.db.donations[0].fee).toBe(0.29)
  })

  it('geeft Mollie geen webhook-URL mee op localhost, want die kan Mollie niet bereiken', async () => {
    await post(valid, 'http://localhost:3000')

    expect(vi.mocked(createPayment).mock.calls[0][0].webhookUrl).toBeUndefined()
  })

  it('slaat de keuze voor naam op de website en fysiek plaatsen op', async () => {
    await post({ ...valid, showOnList: true, nameOnObject: true })

    expect(payload.db.donations[0]).toMatchObject({ showOnList: true, nameOnObject: true })
  })

  it('behandelt alles als vrij bedrag bij een fundraiser zonder eenheid', async () => {
    setup({ ...fundraiserRow, unitPrice: null })

    await post({ ...valid, amount: 65 })

    expect(payload.db.donations[0]).toMatchObject({ units: 0, freeAmount: 65, amount: 65 })
  })

  it('weigert ongeldige invoer zonder iets aan te maken of Mollie aan te roepen', async () => {
    for (const body of [
      { ...valid, amount: 3 },
      { ...valid, amount: 12.5 },
      { ...valid, amount: 10_001 },
      { ...valid, email: 'geen-mail' },
      { ...valid, name: '' },
      { ...valid, isCompany: true },
    ]) {
      const res = await post(body)
      expect(res.status).toBe(400)
      expect((await res.json()).error).toBeTruthy()
    }
    expect(payload.db.donations).toHaveLength(0)
    expect(createPayment).not.toHaveBeenCalled()
  })

  it('weigert bots', async () => {
    vi.mocked(isHuman).mockResolvedValue(false)

    const res = await post(valid)

    expect(res.status).toBe(403)
    expect(payload.db.donations).toHaveLength(0)
  })

  it('weigert een ingevuld honeypot-veld', async () => {
    const res = await post({ ...valid, website: 'https://spam.example' })

    expect(res.status).toBe(403)
    expect(payload.db.donations).toHaveLength(0)
  })

  it('neemt geen donaties aan als de fundraiser gesloten is of niet bestaat', async () => {
    setup({ ...fundraiserRow, active: false })
    expect((await post(valid)).status).toBe(410)

    setup(null)
    expect((await post(valid)).status).toBe(410)

    expect(payload.db.donations).toHaveLength(0)
    expect(createPayment).not.toHaveBeenCalled()
  })

  it('zet de donatie op mislukt en geeft een fout als Mollie de betaling weigert', async () => {
    vi.mocked(createPayment).mockRejectedValue(new Error('Mollie 422'))

    const res = await post(valid)

    expect(res.status).toBe(502)
    expect(payload.db.donations[0].status).toBe('mislukt')
    expect(payload.logger.error).toHaveBeenCalled()
  })

  it('geeft een fout als Mollie geen checkout-URL teruggeeft', async () => {
    vi.mocked(createPayment).mockResolvedValue({ id: 'tr_x', status: 'open' } as any)

    const res = await post(valid)

    expect(res.status).toBe(502)
    expect(payload.db.donations[0].status).toBe('mislukt')
  })
})
