'use client'

import React, { useMemo, useState } from 'react'
import { PhoneIcon, EmailIcon } from './ui/ContactIcons'

export type ContactFormOption = {
  label: string
  value: string
  name: string
  phone?: string | null
  email?: string | null
}

type Props = {
  afdelingen: ContactFormOption[]
  defaultAfdeling?: string
}

export default function ContactForm({ afdelingen, defaultAfdeling }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [afdeling, setAfdeling] = useState(defaultAfdeling ?? '')

  const selected = useMemo(
    () => afdelingen.find((a) => a.value === afdeling),
    [afdelingen, afdeling],
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    setStatus('sending')
    try {
      const res = await fetch('/api/message-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('naam'),
          email: data.get('email'),
          message: data.get('bericht'),
          afdeling: data.get('afdeling') || undefined,
          onderwerp: data.get('onderwerp') || undefined,
          pageUrl: window.location.href,
        }),
      })
      if (!res.ok) {
        throw new Error('Request failed')
      }
      setStatus('sent')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="contact-form-success">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        <p>Bedankt! Je bericht is verzonden. We nemen zo snel mogelijk contact met je op.</p>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form-field">
        <label htmlFor="cf-afdeling">Waar wil je contact over opnemen?</label>
        <div className="contact-form-select-wrap">
          <select
            id="cf-afdeling"
            name="afdeling"
            value={afdeling}
            onChange={(e) => setAfdeling(e.target.value)}
            required
          >
            <option value="" disabled>
              Kies een onderwerp
            </option>
            {afdelingen.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selected && (
        <div className="contact-form-selected-person">
          <div className="contact-person-name">{selected.label}</div>
          <div className="contact-person-role">{selected.name}</div>
          {selected.phone && (
            <div className="contact-info-row">
              <PhoneIcon />
              <a href={`tel:${selected.phone.replace(/\s/g, '')}`}>{selected.phone}</a>
            </div>
          )}
          {selected.email && (
            <div className="contact-info-row">
              <EmailIcon />
              <a href={`mailto:${selected.email}`}>{selected.email}</a>
            </div>
          )}
        </div>
      )}

      <div className="contact-form-field">
        <label htmlFor="cf-naam">Naam</label>
        <input id="cf-naam" name="naam" type="text" placeholder="Naam" required />
      </div>
      <div className="contact-form-field">
        <label htmlFor="cf-email">E-mail</label>
        <input id="cf-email" name="email" type="email" placeholder="E-mailadres" required />
      </div>
      <div className="contact-form-field">
        <label htmlFor="cf-onderwerp">Onderwerp</label>
        <input id="cf-onderwerp" name="onderwerp" type="text" placeholder="Onderwerp" required />
      </div>
      <div className="contact-form-field">
        <label htmlFor="cf-bericht">Bericht</label>
        <textarea id="cf-bericht" name="bericht" placeholder="Bericht" rows={6} required />
      </div>
      {status === 'error' && (
        <p className="contact-form-error">Versturen is niet gelukt. Probeer het opnieuw.</p>
      )}
      <button className="contact-form-submit" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Verzenden…' : 'Verstuur bericht'}
      </button>
    </form>
  )
}
