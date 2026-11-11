import { describe, expect, it } from 'vitest'
import {
  MAX_TOTAL,
  MIN_AMOUNT,
  parseDonationInput,
  paymentTotal,
  splitAmount,
} from '@/lib/fundraiser'

const base = { name: 'Jan Jansen', email: 'jan@example.nl', amount: 30 }

describe('parseDonationInput', () => {
  it('accepteert een bedrag van één stoeltje', () => {
    const result = parseDonationInput(base, 30)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.amount).toBe(30)
      expect(result.data.units).toBe(1)
      expect(result.data.freeAmount).toBe(0)
      expect(result.data.showOnList).toBe(false)
      expect(result.data.nameOnObject).toBe(false)
    }
  })

  it('accepteert een bedrag als tekst', () => {
    const result = parseDonationInput({ ...base, amount: '60' }, 30)
    expect(result.ok && result.data.units).toBe(2)
  })

  it('weigert een halve euro', () => {
    expect(parseDonationInput({ ...base, amount: '12,5' }, 30).ok).toBe(false)
    expect(parseDonationInput({ ...base, amount: 12.5 }, 30).ok).toBe(false)
  })

  it('weigert een bedrag onder het minimum, nul of niets', () => {
    expect(parseDonationInput({ ...base, amount: MIN_AMOUNT - 1 }, 30).ok).toBe(false)
    expect(parseDonationInput({ ...base, amount: 0 }, 30).ok).toBe(false)
    expect(parseDonationInput({ name: base.name, email: base.email }, 30).ok).toBe(false)
    expect(parseDonationInput({ ...base, amount: MIN_AMOUNT }, 30).ok).toBe(true)
  })

  it('weigert negatieve en onleesbare bedragen', () => {
    expect(parseDonationInput({ ...base, amount: -30 }, 30).ok).toBe(false)
    expect(parseDonationInput({ ...base, amount: 'abc' }, 30).ok).toBe(false)
  })

  it('weigert een bedrag boven het maximum', () => {
    expect(parseDonationInput({ ...base, amount: MAX_TOTAL + 1 }, 30).ok).toBe(false)
    expect(parseDonationInput({ ...base, amount: MAX_TOTAL }, 30).ok).toBe(true)
  })

  it('vereist naam en een geldig e-mailadres', () => {
    expect(parseDonationInput({ ...base, name: ' ' }, 30).ok).toBe(false)
    expect(parseDonationInput({ ...base, email: 'geen-mail' }, 30).ok).toBe(false)
  })

  it('vereist een bedrijfsnaam bij een bedrijf en negeert die anders', () => {
    expect(parseDonationInput({ ...base, isCompany: true }, 30).ok).toBe(false)
    const company = parseDonationInput(
      { ...base, isCompany: true, companyName: 'Bakkerij Bos' },
      30,
    )
    expect(company.ok && company.data.companyName).toBe('Bakkerij Bos')
    const person = parseDonationInput({ ...base, companyName: 'Bakkerij Bos' }, 30)
    expect(person.ok && person.data.companyName).toBeUndefined()
  })

  it('neemt toestemmingen alleen over bij een echte true', () => {
    const result = parseDonationInput({ ...base, showOnList: true, nameOnObject: 'true' }, 30)
    expect(result.ok && result.data.showOnList).toBe(true)
    expect(result.ok && result.data.nameOnObject).toBe(false)
  })

  it('neemt coverFee alleen over bij een echte true', () => {
    const yes = parseDonationInput({ ...base, coverFee: true }, 30)
    expect(yes.ok && yes.data.coverFee).toBe(true)
    const no = parseDonationInput({ ...base, coverFee: 'true' }, 30)
    expect(no.ok && no.data.coverFee).toBe(false)
  })
})

describe('splitAmount', () => {
  it('telt elke volle stoeltjesprijs als stoeltje en de rest als extra', () => {
    expect(splitAmount(30, 30)).toEqual({ units: 1, freeAmount: 0 })
    expect(splitAmount(65, 30)).toEqual({ units: 2, freeAmount: 5 })
    expect(splitAmount(25, 30)).toEqual({ units: 0, freeAmount: 25 })
  })

  it('volgt de eenheidsprijs van de fundraiser', () => {
    expect(splitAmount(65, 25)).toEqual({ units: 2, freeAmount: 15 })
  })

  it('maakt van alles een vrij bedrag als de fundraiser geen eenheid heeft', () => {
    expect(splitAmount(65, null)).toEqual({ units: 0, freeAmount: 65 })
    expect(splitAmount(65, undefined)).toEqual({ units: 0, freeAmount: 65 })
    const result = parseDonationInput({ ...base, amount: 65 }, null)
    expect(result.ok && result.data.units).toBe(0)
    expect(result.ok && result.data.freeAmount).toBe(65)
  })
})

describe('paymentTotal', () => {
  it('telt transactiekosten zonder afrondingsfouten op', () => {
    expect(paymentTotal(30, 0.29)).toBe(30.29)
    expect(paymentTotal(65, 0.29)).toBe(65.29)
    expect(paymentTotal(30, 0)).toBe(30)
  })
})
