import { describe, expect, it } from 'vitest'
import { MAX_TOTAL, donationTotal, parseDonationInput, paymentTotal } from '@/lib/fundraiser'

const base = { name: 'Jan Jansen', email: 'jan@example.nl', seats: 1 }

describe('parseDonationInput', () => {
  it('accepteert één stoeltje', () => {
    const result = parseDonationInput(base, 30)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.seats).toBe(1)
      expect(result.data.freeAmount).toBe(0)
      expect(result.data.showOnList).toBe(false)
      expect(result.data.nameOnTribune).toBe(false)
    }
  })

  it('accepteert een vrije donatie zonder stoeltjes, maar geen halve euro', () => {
    const result = parseDonationInput({ ...base, seats: 0, freeAmount: '25' }, 30)
    expect(result.ok).toBe(true)
    expect(parseDonationInput({ ...base, seats: 0, freeAmount: '12,5' }, 30).ok).toBe(false)
  })

  it('weigert een donatie van nul', () => {
    expect(parseDonationInput({ ...base, seats: 0 }, 30).ok).toBe(false)
  })

  it('weigert een vrij bedrag onder het minimum', () => {
    expect(parseDonationInput({ ...base, freeAmount: 3 }, 30).ok).toBe(false)
  })

  it('weigert negatieve en gebroken aantallen', () => {
    expect(parseDonationInput({ ...base, seats: -1 }, 30).ok).toBe(false)
    expect(parseDonationInput({ ...base, seats: 1.5 }, 30).ok).toBe(false)
    expect(parseDonationInput({ ...base, seats: 'abc' }, 30).ok).toBe(false)
  })

  it('weigert een totaal boven het maximum', () => {
    expect(parseDonationInput({ ...base, seats: 0, freeAmount: MAX_TOTAL + 1 }, 30).ok).toBe(false)
    expect(parseDonationInput({ ...base, seats: 0, freeAmount: MAX_TOTAL }, 30).ok).toBe(true)
  })

  it('vereist naam en een geldig e-mailadres', () => {
    expect(parseDonationInput({ ...base, name: ' ' }, 30).ok).toBe(false)
    expect(parseDonationInput({ ...base, email: 'geen-mail' }, 30).ok).toBe(false)
  })

  it('vereist een bedrijfsnaam bij een bedrijf en negeert die anders', () => {
    expect(parseDonationInput({ ...base, isCompany: true }, 30).ok).toBe(false)
    const company = parseDonationInput({ ...base, isCompany: true, companyName: 'Bakkerij Bos' }, 30)
    expect(company.ok && company.data.companyName).toBe('Bakkerij Bos')
    const person = parseDonationInput({ ...base, companyName: 'Bakkerij Bos' }, 30)
    expect(person.ok && person.data.companyName).toBeUndefined()
  })

  it('neemt toestemmingen alleen over bij een echte true', () => {
    const result = parseDonationInput({ ...base, showOnList: true, nameOnTribune: 'true' }, 30)
    expect(result.ok && result.data.showOnList).toBe(true)
    expect(result.ok && result.data.nameOnTribune).toBe(false)
  })

  it('neemt coverFee alleen over bij een echte true', () => {
    const yes = parseDonationInput({ ...base, coverFee: true }, 30)
    expect(yes.ok && yes.data.coverFee).toBe(true)
    const no = parseDonationInput({ ...base, coverFee: 'true' }, 30)
    expect(no.ok && no.data.coverFee).toBe(false)
  })

  it('telt transactiekosten zonder afrondingsfouten op', () => {
    expect(paymentTotal(30, 0.29)).toBe(30.29)
    expect(paymentTotal(65, 0.29)).toBe(65.29)
    expect(paymentTotal(30, 0)).toBe(30)
  })

  it('rekent met de stoeltjesprijs uit de fundraiser', () => {
    expect(donationTotal(2, 10, 30)).toBe(70)
    expect(donationTotal(2, 10, 25)).toBe(60)
  })
})
