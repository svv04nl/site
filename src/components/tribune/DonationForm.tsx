'use client'

import React, { useState } from 'react'
import { MAX_TOTAL, MIN_AMOUNT, formatEuro, paymentTotal, splitAmount } from '@/lib/fundraiser'

type Props = { seatPrice: number; transactionFee: number }

export default function DonationForm({ seatPrice, transactionFee }: Props) {
  // Eén bedrag: de knoppen zetten het op een veelvoud van de stoeltjesprijs en je kunt het
  // daarna zelf aanpassen.
  const [amountText, setAmountText] = useState(String(seatPrice))
  const [isCompany, setIsCompany] = useState(false)
  const [coverFee, setCoverFee] = useState(true)
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const [error, setError] = useState('')

  const total = Number(amountText) || 0
  const { seats, freeAmount: extra } = splitAmount(total, seatPrice)
  const canAddSeat = (seats + 1) * seatPrice <= MAX_TOTAL
  const setSeatCount = (n: number) => setAmountText(String(Math.max(0, n) * seatPrice))
  const fee = coverFee ? transactionFee : 0
  const toPay = paymentTotal(total, fee)

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
          coverFee: transactionFee > 0 && coverFee,
          amount: total,
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
      <fieldset className="fr-field fr-field--center">
        <legend>Nieuwe stoeltjes ({formatEuro(seatPrice)} per stoeltje)</legend>
        <div className="fr-stepper">
          <button
            type="button"
            onClick={() => setSeatCount(extra > 0 ? seats : seats - 1)}
            disabled={total <= 0}
            aria-label="Eén stoeltje minder"
          >
            −
          </button>
          <output aria-live="polite">
            <strong>{seats}</strong> {seats === 1 ? 'stoeltje' : 'stoeltjes'}
          </output>
          <button
            type="button"
            onClick={() => setSeatCount(seats + 1)}
            disabled={!canAddSeat}
            aria-label="Eén stoeltje meer"
          >
            +
          </button>
        </div>
      </fieldset>

      <div className="fr-field fr-field--center">
        <label htmlFor="fr-amount">Jouw donatie</label>
        <div className="fr-money fr-money--amount">
          <span aria-hidden="true">€</span>
          <input
            id="fr-amount"
            inputMode="numeric"
            placeholder="0"
            value={amountText}
            onChange={(e) => setAmountText(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
          />
        </div>
        <small aria-live="polite">
          {total <= 0
            ? `Hele euro's, minimaal ${formatEuro(MIN_AMOUNT)}. Je kunt het bedrag zelf aanpassen.`
            : seats === 0
              ? 'Een vrije donatie.'
              : `${seats} ${seats === 1 ? 'stoeltje' : 'stoeltjes'}${extra > 0 ? ` en ${formatEuro(extra)} extra` : ''}. Je kunt het bedrag zelf aanpassen.`}
        </small>
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
          <span>Mijn naam, het aantal stoeltjes en het bedrag mogen op de website komen.</span>
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

      {transactionFee > 0 && (
        <label className="fr-check">
          <input
            type="checkbox"
            checked={coverFee}
            onChange={(e) => setCoverFee(e.target.checked)}
          />
          <span>
            Ik betaal de transactiekosten ({formatEuro(transactionFee)}) ook, zodat het hele bedrag
            naar de club gaat.
          </span>
        </label>
      )}

      {total > 0 && (
        <dl className="fr-summary">
          <div>
            <dt>Donatie</dt>
            <dd>{formatEuro(total)}</dd>
          </div>
          {fee > 0 && (
            <div>
              <dt>Transactiekosten</dt>
              <dd>{formatEuro(fee)}</dd>
            </div>
          )}
          <div className="fr-summary-total">
            <dt>Totaal</dt>
            <dd>{formatEuro(toPay)}</dd>
          </div>
        </dl>
      )}

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
        disabled={status === 'sending' || total < MIN_AMOUNT || total > MAX_TOTAL}
      >
        {status === 'sending' ? 'Even geduld…' : `Doneer ${formatEuro(toPay)}`}
      </button>
      <p className="fr-note">
        Je betaalt veilig via Mollie. Met doneren ga je akkoord met onze{' '}
        <a href="/privacy">privacyverklaring</a>.
      </p>
    </form>
  )
}
