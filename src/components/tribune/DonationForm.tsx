'use client'

import React, { useState } from 'react'
import { MAX_SEATS, MAX_TOTAL, MIN_FREE_AMOUNT, donationTotal, formatEuro } from '@/lib/fundraiser'

export default function DonationForm({ seatPrice }: { seatPrice: number }) {
  const [seats, setSeats] = useState(1)
  const [freeAmount, setFreeAmount] = useState('')
  const [isCompany, setIsCompany] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const [error, setError] = useState('')

  const free = Number(freeAmount.replace(',', '.')) || 0
  const total = donationTotal(seats, free, seatPrice)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/donatie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          isCompany,
          companyName: data.get('companyName') || undefined,
          showOnList: data.get('showOnList') === 'on',
          nameOnTribune: data.get('nameOnTribune') === 'on',
          seats,
          freeAmount,
          website: data.get('website'),
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.checkoutUrl) {
        throw new Error(json.error ?? 'De betaling kon niet worden gestart.')
      }
      window.location.href = json.checkoutUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'De betaling kon niet worden gestart.')
      setStatus('error')
    }
  }

  return (
    <form className="fr-form" onSubmit={handleSubmit} noValidate>
      <fieldset className="fr-field">
        <legend>Nieuwe stoeltjes ({formatEuro(seatPrice)} per stoeltje)</legend>
        <div className="fr-stepper">
          <button
            type="button"
            onClick={() => setSeats((s) => Math.max(0, s - 1))}
            disabled={seats === 0}
            aria-label="Eén stoeltje minder"
          >
            −
          </button>
          <output aria-live="polite">
            <strong>{seats}</strong> {seats === 1 ? 'stoeltje' : 'stoeltjes'}
          </output>
          <button
            type="button"
            onClick={() => setSeats((s) => Math.min(MAX_SEATS, s + 1))}
            disabled={seats === MAX_SEATS}
            aria-label="Eén stoeltje meer"
          >
            +
          </button>
        </div>
      </fieldset>

      <div className="fr-field">
        <label htmlFor="fr-free">Extra bedrag (optioneel)</label>
        <div className="fr-money">
          <span aria-hidden="true">€</span>
          <input
            id="fr-free"
            inputMode="numeric"
            placeholder="0"
            value={freeAmount}
            onChange={(e) => setFreeAmount(e.target.value.replace(/[^\d]/g, ''))}
          />
        </div>
        <small>Hele euro&apos;s, minimaal {formatEuro(MIN_FREE_AMOUNT)}.</small>
      </div>

      <div className="fr-field">
        <label htmlFor="fr-name">Naam</label>
        <input id="fr-name" name="name" type="text" autoComplete="name" required />
      </div>

      <div className="fr-field">
        <label htmlFor="fr-email">E-mailadres</label>
        <input id="fr-email" name="email" type="email" autoComplete="email" required />
        <small>Hier sturen we de bevestiging naartoe.</small>
      </div>

      <label className="fr-check">
        <input
          type="checkbox"
          checked={isCompany}
          onChange={(e) => setIsCompany(e.target.checked)}
        />
        <span>Ik doneer namens een bedrijf</span>
      </label>

      {isCompany && (
        <div className="fr-field">
          <label htmlFor="fr-company">Bedrijfsnaam</label>
          <input id="fr-company" name="companyName" type="text" autoComplete="organization" />
        </div>
      )}

      <fieldset className="fr-field">
        <legend>Wat mag er met {isCompany ? 'de bedrijfsnaam' : 'je naam'} gebeuren?</legend>
        <label className="fr-check">
          <input type="checkbox" name="showOnList" />
          <span>Mijn naam mag op de website komen.</span>
        </label>
        <label className="fr-check">
          <input type="checkbox" name="nameOnTribune" />
          <span>Mijn naam mag op de tribune zelf geplaatst worden.</span>
        </label>
        <small>Zonder vinkje blijft je donatie anoniem.</small>
      </fieldset>

      {/* Honeypot: voor mensen onzichtbaar, bots vullen het wel in. */}
      <div className="fr-hp" aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {total > MAX_TOTAL && (
        <p className="fr-error">
          Online doneren kan tot {formatEuro(MAX_TOTAL)}. Neem voor meer contact op met de
          sponsorgroep.
        </p>
      )}
      {status === 'error' && <p className="fr-error">{error}</p>}

      <button
        className="fr-submit"
        type="submit"
        disabled={status === 'sending' || total <= 0 || total > MAX_TOTAL}
      >
        {status === 'sending' ? 'Even geduld…' : `Doneer ${formatEuro(total)}`}
      </button>
      <p className="fr-note">
        Je betaalt veilig via Mollie. Met doneren ga je akkoord met onze{' '}
        <a href="/privacy">privacyverklaring</a>.
      </p>
    </form>
  )
}
