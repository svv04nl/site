// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createFakePayload, donationRow, type FakePayload } from '../helpers/fake-payload'

vi.mock('payload', () => ({ getPayload: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/donations', () => ({ syncDonation: vi.fn(), reconcileOpenDonations: vi.fn() }))

const { getPayload } = await import('payload')
const { revalidatePath } = await import('next/cache')
const { syncDonation, reconcileOpenDonations } = await import('@/lib/donations')
const { POST: webhook } = await import('@/app/(frontend)/api/mollie-webhook/route')
const { GET: reconcileCron } = await import('@/app/(frontend)/api/cron/reconcile-donations/route')

let payload: FakePayload

beforeEach(() => {
  vi.clearAllMocks()
  payload = createFakePayload({ donations: [donationRow({ mollieId: 'tr_known' })] })
  vi.mocked(getPayload).mockResolvedValue(payload as any)
})

function webhookRequest(id?: string) {
  return new Request('https://svv04.nl/api/mollie-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: id === undefined ? '' : new URLSearchParams({ id }).toString(),
  })
}

describe('POST /api/mollie-webhook', () => {
  it('weigert een verzoek zonder of met een ongeldig betaal-id', async () => {
    for (const id of [undefined, '', 'nope', 'tr_', 'tr_abc/../x', "tr_a'; DROP TABLE donations;--"]) {
      expect((await webhook(webhookRequest(id))).status).toBe(400)
    }
    expect(syncDonation).not.toHaveBeenCalled()
  })

  it('antwoordt 200 zonder iets te doen voor een onbekende betaling', async () => {
    const res = await webhook(webhookRequest('tr_unknown'))

    expect(res.status).toBe(200)
    expect(syncDonation).not.toHaveBeenCalled()
  })

  it('synchroniseert de bijbehorende donatie en ververst de pagina', async () => {
    const res = await webhook(webhookRequest('tr_known'))

    expect(res.status).toBe(200)
    expect(syncDonation).toHaveBeenCalledTimes(1)
    expect(vi.mocked(syncDonation).mock.calls[0][0]).toMatchObject({ mollieId: 'tr_known' })
    expect(revalidatePath).toHaveBeenCalledWith('/tribune')
  })

  it('geeft een foutstatus als de synchronisatie faalt, zodat Mollie het opnieuw probeert', async () => {
    vi.mocked(syncDonation).mockRejectedValue(new Error('Mollie down'))

    const res = await webhook(webhookRequest('tr_known'))

    expect(res.status).toBe(500)
    expect(payload.logger.error).toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe('GET /api/cron/reconcile-donations', () => {
  const original = process.env.CRON_SECRET
  const request = (authorization?: string) =>
    new Request('https://svv04.nl/api/cron/reconcile-donations', {
      headers: authorization ? { authorization } : {},
    })

  beforeEach(() => {
    process.env.CRON_SECRET = 'geheim'
    vi.mocked(reconcileOpenDonations).mockResolvedValue({
      checked: 2,
      paid: 1,
      otherChange: 0,
      unchanged: 1,
      failed: 0,
    })
  })

  afterEach(() => {
    if (original === undefined) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = original
  })

  it('weigert verzoeken zonder of met een verkeerd geheim', async () => {
    expect((await reconcileCron(request())).status).toBe(401)
    expect((await reconcileCron(request('Bearer fout'))).status).toBe(401)
    expect(reconcileOpenDonations).not.toHaveBeenCalled()
  })

  it('weigert alles als er geen CRON_SECRET is ingesteld, ook "Bearer undefined"', async () => {
    delete process.env.CRON_SECRET

    expect((await reconcileCron(request('Bearer undefined'))).status).toBe(401)
    expect(reconcileOpenDonations).not.toHaveBeenCalled()
  })

  it('draait de controle met het juiste geheim en geeft het resultaat terug', async () => {
    const res = await reconcileCron(request('Bearer geheim'))

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ checked: 2, paid: 1 })
    expect(revalidatePath).toHaveBeenCalledWith('/tribune')
  })

  it('ververst de pagina niet als er niets is gewijzigd', async () => {
    vi.mocked(reconcileOpenDonations).mockResolvedValue({
      checked: 1,
      paid: 0,
      otherChange: 0,
      unchanged: 1,
      failed: 0,
    })

    await reconcileCron(request('Bearer geheim'))

    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
