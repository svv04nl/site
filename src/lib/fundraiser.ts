// Instellingen en validatie voor de tribune-actie. Bedragen zijn hele euro's.

// De stoeltjesprijs en het doelbedrag staan in de collectie `fundraisers`.
export const FUNDRAISER_SLUG = 'tribune'
export const MIN_FREE_AMOUNT = 5
export const MAX_SEATS = 100
export const MAX_TOTAL = 10_000

export type DonationInput = {
  name: string
  email: string
  isCompany: boolean
  companyName?: string
  showOnList: boolean
  nameOnTribune: boolean
  coverFee: boolean
  seats: number
  freeAmount: number
}

type ParseResult = { ok: true; data: DonationInput } | { ok: false; error: string }

function toWholeNumber(value: unknown): number {
  if (value === undefined || value === null || value === '') return 0
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : NaN
}

export function donationTotal(seats: number, freeAmount: number, seatPrice: number): number {
  return seats * seatPrice + freeAmount
}

// Wat de donateur afrekent: de donatie plus eventuele transactiekosten, in centen
// afgerond zodat 30 + 0,29 geen 30,290000000000004 wordt.
export function paymentTotal(amount: number, fee: number): number {
  return Math.round(amount * 100 + fee * 100) / 100
}

export function formatEuro(amount: number): string {
  const digits = Number.isInteger(amount) ? 0 : 2
  return `€ ${amount.toLocaleString('nl-NL', { minimumFractionDigits: digits })}`
}

export function parseDonationInput(body: unknown, seatPrice: number): ParseResult {
  const input = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>

  const name = typeof input.name === 'string' ? input.name.trim() : ''
  const email = typeof input.email === 'string' ? input.email.trim() : ''
  const isCompany = input.isCompany === true
  const companyName = typeof input.companyName === 'string' ? input.companyName.trim() : ''
  const showOnList = input.showOnList === true
  const nameOnTribune = input.nameOnTribune === true
  const coverFee = input.coverFee === true
  const seats = toWholeNumber(input.seats)
  const freeAmount = toWholeNumber(input.freeAmount)

  if (!name || name.length > 100) return { ok: false, error: 'Vul je naam in.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return { ok: false, error: 'Vul een geldig e-mailadres in.' }
  }
  if (isCompany && (!companyName || companyName.length > 100)) {
    return { ok: false, error: 'Vul de bedrijfsnaam in.' }
  }
  if (!Number.isInteger(seats) || seats < 0 || seats > MAX_SEATS) {
    return { ok: false, error: `Kies tussen 0 en ${MAX_SEATS} stoeltjes.` }
  }
  if (!Number.isInteger(freeAmount) || freeAmount < 0) {
    return { ok: false, error: 'Vul het extra bedrag in hele euro’s in.' }
  }
  if (freeAmount > 0 && freeAmount < MIN_FREE_AMOUNT) {
    return { ok: false, error: `Een vrije donatie is minimaal ${formatEuro(MIN_FREE_AMOUNT)}.` }
  }

  const total = donationTotal(seats, freeAmount, seatPrice)
  if (total <= 0) return { ok: false, error: 'Kies een stoeltje of vul een bedrag in.' }
  if (total > MAX_TOTAL) {
    return {
      ok: false,
      error: `Online doneren kan tot ${formatEuro(MAX_TOTAL)}. Neem voor meer contact op met de sponsorgroep.`,
    }
  }

  return {
    ok: true,
    data: {
      name,
      email,
      isCompany,
      companyName: isCompany ? companyName : undefined,
      showOnList,
      nameOnTribune,
      coverFee,
      seats,
      freeAmount,
    },
  }
}
