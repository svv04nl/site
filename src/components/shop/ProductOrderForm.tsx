'use client'

import React, { useState } from 'react'

type Props = {
  product: string
  sizes: string[]
  /** Role slug of the contact who gets the orders; empty = algemene zaken. */
  orderRole?: string | null
}

/** Order a clubartikel: sends a message (like the contact form) to whoever handles the orders. */
export function ProductOrderForm({ product, sizes, orderRole }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const size = data.get('maat')
    const note = String(data.get('opmerking') ?? '').trim()
    const message = [
      `Bestelling: ${product}`,
      size ? `Maat: ${size}` : null,
      `Aantal: ${data.get('aantal') || 1}`,
      note ? `\nOpmerking:\n${note}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    setStatus('sending')
    try {
      const res = await fetch('/api/message-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('naam'),
          email: data.get('email'),
          message,
          afdeling: orderRole || undefined,
          onderwerp: `Bestelling ${product}`,
          pageUrl: window.location.href,
        }),
      })
      if (!res.ok) {
        throw new Error('Request failed')
      }
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="product-order product-order--sent" role="status">
        <h2 className="product-order__title">Bedankt!</h2>
        <p>Je bestelling is verstuurd. We nemen contact met je op over betalen en ophalen.</p>
      </div>
    )
  }

  return (
    <form className="product-order contact-form" onSubmit={handleSubmit}>
      <h2 className="product-order__title">Bestellen via het formulier</h2>
      <p className="product-order__intro">We nemen contact met je op over betalen en ophalen.</p>
      <div className="product-order__row">
        {sizes.length > 0 && (
          <div className="contact-form-field">
            <label htmlFor="po-maat">Maat</label>
            <div className="contact-form-select-wrap">
              <select id="po-maat" name="maat" required defaultValue="">
                <option value="" disabled>
                  Kies een maat
                </option>
                {sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        <div className="contact-form-field product-order__amount">
          <label htmlFor="po-aantal">Aantal</label>
          <input
            id="po-aantal"
            name="aantal"
            type="number"
            min={1}
            max={50}
            defaultValue={1}
            required
          />
        </div>
      </div>
      <div className="contact-form-field">
        <label htmlFor="po-naam">Naam</label>
        <input id="po-naam" name="naam" type="text" autoComplete="name" required />
      </div>
      <div className="contact-form-field">
        <label htmlFor="po-email">E-mail</label>
        <input id="po-email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="contact-form-field">
        <label htmlFor="po-opmerking">Opmerking (optioneel)</label>
        <textarea id="po-opmerking" name="opmerking" rows={3} />
      </div>
      {status === 'error' && (
        <p className="contact-form-error">Versturen is niet gelukt. Probeer het opnieuw.</p>
      )}
      <button className="contact-form-submit" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Versturen…' : 'Verstuur'}
      </button>
    </form>
  )
}
