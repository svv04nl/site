// Instellingen en validatie voor fundraisers. Bedragen zijn hele euro's.

// De pagina op /tribune hoort bij de fundraiser met deze slug. Wat de actie inhoudt (eenheid en
// prijs, doelbedrag, transactiekosten) staat in de collectie `fundraisers`.
export const FUNDRAISER_SLUG = 'tribune'
export const MIN_AMOUNT = 5
export const MAX_TOTAL = 10_000

// Een vaste eenheid van een fundraiser, bijvoorbeeld een stoeltje van 30 euro.
export type FundraiserUnit = { name: string; namePlural: string; price: number }

export function getUnit(fundraiser: {
  unitPrice?: number | null
  unitName?: string | null
  unitNamePlural?: string | null
}): FundraiserUnit | null {
  if (!fundraiser.unitPrice) return null
  return {
    name: fundraiser.unitName || 'eenheid',
    namePlural: fundraiser.unitNamePlural || 'eenheden',
    price: fundraiser.unitPrice,
  }
}

export function formatUnits(count: number, unit: Pick<FundraiserUnit, 'name' | 'namePlural'>) {
  return `${count} ${count === 1 ? unit.name : unit.namePlural}`
}

export type DonationInput = {
  name: string
  email: string
  isCompany: boolean
  companyName?: string
  showOnList: boolean
  nameOnObject: boolean
  coverFee: boolean
  // Het gekozen bedrag, en hoe dat uitvalt: elke volle eenheidsprijs is een eenheid, de rest
  // telt als extra. Zonder eenheidsprijs is alles een vrij bedrag.
  amount: number
  units: number
  freeAmount: number
}

type ParseResult = { ok: true; data: DonationInput } | { ok: false; error: string }

function toWholeNumber(value: unknown): number {
  if (value === undefined || value === null || value === '') return 0
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : NaN
}

export function splitAmount(amount: number, unitPrice?: number | null) {
  if (!unitPrice) return { units: 0, freeAmount: amount }
  return { units: Math.floor(amount / unitPrice), freeAmount: amount % unitPrice }
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

export function parseDonationInput(body: unknown, unitPrice?: number | null): ParseResult {
  const input = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>

  const name = typeof input.name === 'string' ? input.name.trim() : ''
  const email = typeof input.email === 'string' ? input.email.trim() : ''
  const isCompany = input.isCompany === true
  const companyName = typeof input.companyName === 'string' ? input.companyName.trim() : ''
  const showOnList = input.showOnList === true
  const nameOnObject = input.nameOnObject === true
  const coverFee = input.coverFee === true
  const amount = toWholeNumber(input.amount)

  if (!name || name.length > 100) return { ok: false, error: 'Vul je naam in.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return { ok: false, error: 'Vul een geldig e-mailadres in.' }
  }
  if (isCompany && (!companyName || companyName.length > 100)) {
    return { ok: false, error: 'Vul de bedrijfsnaam in.' }
  }
  if (!Number.isInteger(amount)) {
    return { ok: false, error: 'Vul het bedrag in hele euro’s in.' }
  }
  if (amount < MIN_AMOUNT) {
    return { ok: false, error: `Een donatie is minimaal ${formatEuro(MIN_AMOUNT)}.` }
  }
  if (amount > MAX_TOTAL) {
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
      nameOnObject,
      coverFee,
      amount,
      ...splitAmount(amount, unitPrice),
    },
  }
}
