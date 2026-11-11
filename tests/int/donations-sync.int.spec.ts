// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createFakePayload,
  donationRow,
  fundraiserRow,
  type FakePayload,
} from '../helpers/fake-payload'

vi.mock('payload', () => ({ getPayload: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/lib/mollie', () => ({ getPayment: vi.fn(), createPayment: vi.fn() }))

const { getPayload } = await import('payload')
const { getPayment } = await import('@/lib/mollie')
const { mapMollieStatus, reconcileOpenDonations, syncDonation } = await import('@/lib/donations')

const SPONSOR = { id: 1, email: 'sponsor@svv04.nl', roles: [{ slug: 'sponsorgroep' }] }

let payload: FakePayload

function setup(donations = [donationRow()], contacts: any[] = [SPONSOR]) {
  payload = createFakePayload({ donations, fundraisers: [fundraiserRow], contacts })
  vi.mocked(getPayload).mockResolvedValue(payload as any)
}

function mollieSays(status: string, method: string | null = 'ideal') {
  vi.mocked(getPayment).mockResolvedValue({ id: 'tr_1', status, method } as any)
}

const stored = (id = 1) => payload.db.donations.find((d) => d.id === id)!
const donation = (overrides = {}) => donationRow(overrides) as any

beforeEach(() => {
  vi.clearAllMocks()
})

describe('mapMollieStatus', () => {
  it('zet Mollie-statussen om naar donatiestatussen', () => {
    expect(mapMollieStatus('paid')).toBe('betaald')
    expect(mapMollieStatus('canceled')).toBe('geannuleerd')
    expect(mapMollieStatus('expired')).toBe('verlopen')
    expect(mapMollieStatus('failed')).toBe('mislukt')
  })

  it('behandelt alles wat nog onderweg is als open', () => {
    expect(mapMollieStatus('open')).toBe('open')
    expect(mapMollieStatus('pending')).toBe('open')
    expect(mapMollieStatus('authorized')).toBe('open')
  })
})

describe('syncDonation', () => {
  it('markeert een betaalde donatie als betaald, met datum en methode', async () => {
    setup()
    mollieSays('paid', 'ideal')

    const result = await syncDonation(donation())

    expect(result.status).toBe('betaald')
    expect(stored().status).toBe('betaald')
    expect(stored().method).toBe('ideal')
    expect(stored().paidAt).toBeTruthy()
  })

  it('stuurt een bevestiging naar de donateur en een melding naar de sponsorgroep', async () => {
    setup()
    mollieSays('paid')

    await syncDonation(donation())

    expect(payload.sendEmail).toHaveBeenCalledTimes(2)
    const [donor, sponsor] = payload.sendEmail.mock.calls.map((c) => c[0])
    expect(donor.to).toBe('jan@example.nl')
    expect(donor.subject).toMatch(/Bedankt/)
    expect(donor.html).toContain('2 stoeltjes')
    expect(donor.html).toContain('transactiekosten')
    expect(sponsor.to).toBe('sponsor@svv04.nl')
    expect(sponsor.subject).toMatch(/Nieuwe donatie/)
  })

  it('valt terug op het algemene adres als er geen sponsorgroep-contact is', async () => {
    setup([donationRow()], [])
    mollieSays('paid')

    await syncDonation(donation())

    expect(payload.sendEmail.mock.calls[1][0].to).toBe('algemenezaken@svv04.nl')
  })

  it('escaped de naam van de donateur in de mails', async () => {
    setup([donationRow({ name: '<script>alert(1)</script>' })])
    mollieSays('paid')

    await syncDonation(donation({ name: '<script>alert(1)</script>' }))

    for (const [message] of payload.sendEmail.mock.calls) {
      expect(message.html).not.toContain('<script>')
    }
  })

  it('noemt bij een fundraiser zonder eenheid alleen het vrije bedrag', async () => {
    payload = createFakePayload({
      donations: [donationRow({ units: 0, freeAmount: 65 })],
      fundraisers: [{ ...fundraiserRow, unitPrice: null }],
      contacts: [SPONSOR],
    })
    vi.mocked(getPayload).mockResolvedValue(payload as any)
    mollieSays('paid')

    await syncDonation(donation({ units: 0, freeAmount: 65 }))

    const html = payload.sendEmail.mock.calls[0][0].html
    expect(html).toContain('een vrije donatie van')
    expect(html).not.toContain('stoeltje')
  })

  it('stuurt de mails maar één keer, ook als de webhook en de terugkeerpagina tegelijk komen', async () => {
    setup()
    mollieSays('paid')

    const [a, b] = await Promise.all([syncDonation(donation()), syncDonation(donation())])

    expect(a.status).toBe('betaald')
    expect(b.status).toBe('betaald')
    expect(payload.sendEmail).toHaveBeenCalledTimes(2) // één donateur + één sponsorgroep
  })

  it('doet niets en roept Mollie niet aan voor een donatie die al betaald is', async () => {
    setup([donationRow({ status: 'betaald' })])

    const result = await syncDonation(donation({ status: 'betaald' }))

    expect(result.status).toBe('betaald')
    expect(getPayment).not.toHaveBeenCalled()
    expect(payload.sendEmail).not.toHaveBeenCalled()
  })

  it('doet niets voor een donatie zonder Mollie-betaling', async () => {
    setup([donationRow({ mollieId: undefined })])

    const result = await syncDonation(donation({ mollieId: undefined }))

    expect(result.status).toBe('open')
    expect(getPayment).not.toHaveBeenCalled()
  })

  it('laat een donatie open zolang de betaling onderweg is', async () => {
    setup()
    mollieSays('pending')

    const result = await syncDonation(donation())

    expect(result.status).toBe('open')
    expect(payload.update).not.toHaveBeenCalled()
    expect(payload.sendEmail).not.toHaveBeenCalled()
  })

  it.each([
    ['canceled', 'geannuleerd'],
    ['expired', 'verlopen'],
    ['failed', 'mislukt'],
  ])('zet een %s betaling op %s zonder mails', async (mollieStatus, expected) => {
    setup()
    mollieSays(mollieStatus)

    const result = await syncDonation(donation())

    expect(result.status).toBe(expected)
    expect(stored().status).toBe(expected)
    expect(stored().paidAt).toBeUndefined()
    expect(payload.sendEmail).not.toHaveBeenCalled()
  })

  it('blijft werken als een mail niet verstuurd kan worden', async () => {
    setup()
    mollieSays('paid')
    payload.sendEmail.mockRejectedValue(new Error('403 Forbidden'))

    const result = await syncDonation(donation())

    expect(result.status).toBe('betaald')
    expect(stored().status).toBe('betaald')
    expect(payload.logger.error).toHaveBeenCalledTimes(2)
  })
})

describe('reconcileOpenDonations', () => {
  const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()

  it('controleert alleen open donaties met een Mollie-betaling die oud genoeg zijn', async () => {
    setup([
      donationRow({ id: 1, mollieId: 'tr_old_paid', createdAt: minutesAgo(60) }),
      donationRow({ id: 2, mollieId: 'tr_fresh', createdAt: minutesAgo(2) }),
      donationRow({ id: 3, mollieId: 'tr_ancient', createdAt: minutesAgo(40 * 24 * 60) }),
      donationRow({ id: 4, mollieId: undefined, createdAt: minutesAgo(60) }),
      donationRow({ id: 5, mollieId: 'tr_done', status: 'betaald', createdAt: minutesAgo(60) }),
    ])
    mollieSays('paid')

    const result = await reconcileOpenDonations(payload as any)

    expect(result).toEqual({ checked: 1, paid: 1, otherChange: 0, unchanged: 0, failed: 0 })
    expect(stored(1).status).toBe('betaald')
    for (const id of [2, 3, 4]) {
      expect(stored(id).status).toBe('open')
    }
    expect(getPayment).toHaveBeenCalledTimes(1)
  })

  it('verwerkt een gemiste betaling alsnog, met de mails, en doet de tweede keer niets meer', async () => {
    setup([donationRow({ createdAt: minutesAgo(60) })])
    mollieSays('paid')

    await reconcileOpenDonations(payload as any)
    expect(payload.sendEmail).toHaveBeenCalledTimes(2)

    const second = await reconcileOpenDonations(payload as any)
    expect(second.checked).toBe(0)
    expect(payload.sendEmail).toHaveBeenCalledTimes(2)
  })

  it('telt betaald, andere wijzigingen, ongewijzigd en mislukt apart', async () => {
    setup([
      donationRow({ id: 1, mollieId: 'tr_paid', createdAt: minutesAgo(90) }),
      donationRow({ id: 2, mollieId: 'tr_expired', createdAt: minutesAgo(80) }),
      donationRow({ id: 3, mollieId: 'tr_pending', createdAt: minutesAgo(70) }),
      donationRow({ id: 4, mollieId: 'tr_broken', createdAt: minutesAgo(60) }),
    ])
    const byId: Record<string, any> = {
      tr_paid: { status: 'paid', method: 'ideal' },
      tr_expired: { status: 'expired' },
      tr_pending: { status: 'pending' },
    }
    vi.mocked(getPayment).mockImplementation(async (id: string) => {
      if (id === 'tr_broken') {
        throw new Error('Mollie 500')
      }
      return { id, ...byId[id] } as any
    })

    const result = await reconcileOpenDonations(payload as any)

    // Eén mislukte controle houdt de rest niet tegen.
    expect(result).toEqual({ checked: 4, paid: 1, otherChange: 1, unchanged: 1, failed: 1 })
    expect(stored(1).status).toBe('betaald')
    expect(stored(2).status).toBe('verlopen')
    expect(stored(3).status).toBe('open')
    expect(stored(4).status).toBe('open')
    expect(payload.logger.error).toHaveBeenCalledTimes(1)
  })
})
