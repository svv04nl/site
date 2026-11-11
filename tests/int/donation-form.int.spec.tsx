import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import DonationForm from '@/components/tribune/DonationForm'

const unit = { name: 'stoeltje', namePlural: 'stoeltjes', price: 30 }
const label = 'Mijn naam mag op de tribune zelf geplaatst worden.'

// formatEuro gebruikt een vaste spatie tussen € en het bedrag.
const text = (el: Element | null) => (el?.textContent ?? '').replace(/ /g, ' ')

const amountInput = () => screen.getByLabelText('Jouw donatie') as HTMLInputElement
const submit = () => screen.getByRole('button', { name: /Doneer/ }) as HTMLButtonElement
const hint = () => text(amountInput().closest('.fr-field'))

function renderForm(props: Partial<React.ComponentProps<typeof DonationForm>> = {}) {
  return render(
    <DonationForm unit={unit} transactionFee={0.29} nameOnObjectLabel={label} {...props} />,
  )
}

beforeEach(() => {
  // jsdom kan niet navigeren; de melding daarover is hier ruis.
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('DonationForm: bedrag en stoeltjes', () => {
  it('begint met één eenheid en toont het totaal inclusief transactiekosten', () => {
    renderForm()

    expect(amountInput().value).toBe('30')
    expect(text(submit())).toBe('Doneer € 30,29')
  })

  it('zet het bedrag op een veelvoud van de eenheidsprijs met de plus- en minknop', () => {
    renderForm()

    fireEvent.click(screen.getByRole('button', { name: 'Eén stoeltje meer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Eén stoeltje meer' }))
    expect(amountInput().value).toBe('90')
    expect(hint()).toContain('3 stoeltjes')

    fireEvent.click(screen.getByRole('button', { name: 'Eén stoeltje minder' }))
    expect(amountInput().value).toBe('60')
  })

  it('laat je het bedrag zelf aanpassen en toont wat dat in stoeltjes betekent', () => {
    renderForm()

    fireEvent.change(amountInput(), { target: { value: '65' } })

    expect(hint()).toContain('2 stoeltjes en € 5 extra')
    expect(text(submit())).toBe('Doneer € 65,29')
  })

  it('laat de minknop een restbedrag weghalen voordat hij een stoeltje aftrekt', () => {
    renderForm()
    fireEvent.change(amountInput(), { target: { value: '65' } })

    fireEvent.click(screen.getByRole('button', { name: 'Eén stoeltje minder' }))

    expect(amountInput().value).toBe('60')
  })

  it('noemt een bedrag onder één eenheid een vrije donatie', () => {
    renderForm()

    fireEvent.change(amountInput(), { target: { value: '10' } })

    expect(hint()).toContain('Een vrije donatie')
  })

  it('haalt letters en tekens uit het bedrag', () => {
    renderForm()

    fireEvent.change(amountInput(), { target: { value: '1a2,5€' } })

    expect(amountInput().value).toBe('125')
  })

  it('blokkeert het versturen onder het minimum en boven het maximum', () => {
    renderForm()

    fireEvent.change(amountInput(), { target: { value: '4' } })
    expect(submit().disabled).toBe(true)

    fireEvent.change(amountInput(), { target: { value: '5' } })
    expect(submit().disabled).toBe(false)

    fireEvent.change(amountInput(), { target: { value: '10000' } })
    expect(submit().disabled).toBe(false)

    fireEvent.change(amountInput(), { target: { value: '10001' } })
    expect(submit().disabled).toBe(true)
  })

  it('zet de plusknop uit als een volgende eenheid boven het maximum komt', () => {
    renderForm()

    fireEvent.change(amountInput(), { target: { value: '9990' } })

    expect(
      (screen.getByRole('button', { name: 'Eén stoeltje meer' }) as HTMLButtonElement).disabled,
    ).toBe(true)
  })
})

describe('DonationForm: transactiekosten', () => {
  it('laat de donateur de transactiekosten uitzetten', () => {
    renderForm()

    fireEvent.click(screen.getByLabelText(/Ik betaal de transactiekosten/))

    expect(text(submit())).toBe('Doneer € 30')
  })

  it('toont de optie niet als de fundraiser geen transactiekosten heeft', () => {
    renderForm({ transactionFee: 0 })

    expect(screen.queryByLabelText(/transactiekosten/)).toBeNull()
    expect(text(submit())).toBe('Doneer € 30')
  })
})

describe('DonationForm: fundraiser zonder eenheid of toestemmingsoptie', () => {
  it('toont zonder eenheid geen stoeltjesknoppen en begint met een vrij bedrag', () => {
    renderForm({ unit: null })

    expect(screen.queryByRole('button', { name: /stoeltje/ })).toBeNull()
    expect(amountInput().value).toBe('25')
    expect(hint()).toContain('minimaal € 5')
    expect(screen.getByLabelText(/Mijn naam en het bedrag mogen op de website komen/)).toBeTruthy()
  })

  it('noemt bij een eenheid het aantal eenheden in de toestemming voor de website', () => {
    renderForm()

    expect(
      screen.getByLabelText(/het aantal stoeltjes en het bedrag mogen op de website komen/),
    ).toBeTruthy()
  })

  it('toont de tweede toestemming alleen als er een tekst voor is', () => {
    renderForm()
    expect(screen.getByLabelText(label)).toBeTruthy()

    cleanup()
    renderForm({ nameOnObjectLabel: '' })
    expect(screen.queryByLabelText(label)).toBeNull()
  })

  it('gebruikt de naam van de eenheid uit de fundraiser', () => {
    renderForm({ unit: { name: 'baksteen', namePlural: 'bakstenen', price: 10 } })

    expect(screen.getByRole('button', { name: 'Eén baksteen meer' })).toBeTruthy()
    expect(amountInput().value).toBe('10')
  })
})

describe('DonationForm: wachtwoordmanagers', () => {
  it('zet het inlogvoorstel van wachtwoordmanagers uit op de tekstvelden', () => {
    renderForm()
    fireEvent.click(screen.getByLabelText('Ik doneer namens een bedrijf'))

    for (const field of [
      screen.getByLabelText('Naam'),
      screen.getByLabelText('E-mailadres'),
      screen.getByLabelText('Bedrijfsnaam'),
    ]) {
      expect(field.getAttribute('data-1p-ignore')).not.toBeNull()
      expect(field.getAttribute('data-lpignore')).toBe('true')
      expect(field.getAttribute('data-bwignore')).toBe('true')
    }
  })

  it('laat het autofill van de browser voor naam en e-mail wel werken', () => {
    renderForm()

    expect(screen.getByLabelText('Naam').getAttribute('autocomplete')).toBe('name')
    expect(screen.getByLabelText('E-mailadres').getAttribute('autocomplete')).toBe('email')
  })
})

describe('DonationForm: versturen', () => {
  const fillIn = () => {
    fireEvent.change(screen.getByLabelText('Naam'), { target: { value: 'Jan Jansen' } })
    fireEvent.change(screen.getByLabelText('E-mailadres'), { target: { value: 'jan@example.nl' } })
  }

  it('stuurt bedrag, gegevens en toestemmingen naar de server', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ checkoutUrl: 'https://mollie.test/checkout' }),
    })
    vi.stubGlobal('fetch', fetchMock)
    renderForm()
    fillIn()
    fireEvent.change(amountInput(), { target: { value: '65' } })
    fireEvent.click(
      screen.getByLabelText(/het aantal stoeltjes en het bedrag mogen op de website komen/),
    )

    fireEvent.click(submit())

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/donatie')
    expect(JSON.parse(init.body)).toMatchObject({
      name: 'Jan Jansen',
      email: 'jan@example.nl',
      amount: 65,
      coverFee: true,
      showOnList: true,
      nameOnObject: false,
      isCompany: false,
    })
  })

  it('vraagt om een bedrijfsnaam en stuurt die mee', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ checkoutUrl: 'https://mollie.test/checkout' }),
    })
    vi.stubGlobal('fetch', fetchMock)
    renderForm()
    fillIn()

    expect(screen.queryByLabelText('Bedrijfsnaam')).toBeNull()
    fireEvent.click(screen.getByLabelText('Ik doneer namens een bedrijf'))
    fireEvent.change(screen.getByLabelText('Bedrijfsnaam'), { target: { value: 'Bakkerij Bos' } })
    fireEvent.click(submit())

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      isCompany: true,
      companyName: 'Bakkerij Bos',
    })
  })

  it('toont de foutmelding van de server en laat je het opnieuw proberen', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Vul een geldig e-mailadres in.' }),
      }),
    )
    renderForm()
    fillIn()

    fireEvent.click(submit())

    await waitFor(() => expect(screen.getByText('Vul een geldig e-mailadres in.')).toBeTruthy())
    expect(submit().disabled).toBe(false)
  })

  it('toont een algemene fout als het netwerk uitvalt', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')))
    renderForm()
    fillIn()

    fireEvent.click(submit())

    await waitFor(() => expect(screen.getByText('Failed to fetch')).toBeTruthy())
    expect(submit().disabled).toBe(false)
  })
})
