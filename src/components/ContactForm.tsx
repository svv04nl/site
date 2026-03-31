'use client'

import React, { useState } from 'react'

const AFDELINGEN = [
  'Secretariaat',
  'Wedstrijdsecretariaat',
  'Bestuur',
  'Jeugdafdeling',
  'Technische Commissie',
  'Kantinecommissie',
  'Overig',
]

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    // Placeholder: in production wire up to an API route or email service
    await new Promise((r) => setTimeout(r, 800))
    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div className="contact-form-success">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
        </svg>
        <p>Bedankt! Je bericht is verzonden. We nemen zo snel mogelijk contact met je op.</p>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form-field">
        <label htmlFor="cf-naam">Naam</label>
        <input id="cf-naam" name="naam" type="text" placeholder="Naam" required />
      </div>
      <div className="contact-form-field">
        <label htmlFor="cf-email">E-mail</label>
        <input id="cf-email" name="email" type="email" placeholder="E-mailadres" required />
      </div>
      <div className="contact-form-field">
        <label htmlFor="cf-afdeling">Afdeling</label>
        <div className="contact-form-select-wrap">
          <select id="cf-afdeling" name="afdeling">
            {AFDELINGEN.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>
      <div className="contact-form-field">
        <label htmlFor="cf-onderwerp">Onderwerp</label>
        <input id="cf-onderwerp" name="onderwerp" type="text" placeholder="Onderwerp" required />
      </div>
      <div className="contact-form-field">
        <label htmlFor="cf-bericht">Bericht</label>
        <textarea id="cf-bericht" name="bericht" placeholder="Bericht" rows={6} required />
      </div>
      <button className="contact-form-submit" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Verzenden…' : 'Verstuur bericht'}
      </button>
    </form>
  )
}
