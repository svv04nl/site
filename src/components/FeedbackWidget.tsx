'use client'

import React, { useEffect, useRef, useState } from 'react'

// Auto-popup only fires during the launch introduction window; the corner
// icon itself stays available indefinitely after that.
const LAUNCH_DATE = new Date('2026-08-16T00:00:00')
const LAUNCH_WINDOW_END = new Date('2026-10-16T00:00:00')
const REPEAT_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000
const STORAGE_KEY = 'svv04-feedback-popup-last-shown'
const AUTO_OPEN_DELAY_MS = 1200

type View = 'intro' | 'form' | 'sent'

const FeedbackIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)

const CloseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('form')
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const wasAutoOpened = useRef(false)

  useEffect(() => {
    const now = new Date()
    if (now < LAUNCH_DATE || now > LAUNCH_WINDOW_END) {
      return
    }

    const lastShown = Number(window.localStorage.getItem(STORAGE_KEY) ?? 0)
    if (lastShown && Date.now() - lastShown < REPEAT_INTERVAL_MS) {
      return
    }

    const timer = window.setTimeout(() => {
      wasAutoOpened.current = true
      setView('intro')
      setOpen(true)
    }, AUTO_OPEN_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [])

  function closeWidget() {
    if (wasAutoOpened.current) {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()))
      wasAutoOpened.current = false
    }
    setOpen(false)
  }

  function openForm() {
    wasAutoOpened.current = false
    setView('form')
    setOpen(true)
  }

  useEffect(() => {
    if (!open) {
      return
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeWidget()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    setStatus('sending')
    try {
      const res = await fetch('/api/message-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
          pageUrl: window.location.href,
        }),
      })
      if (!res.ok) {
        throw new Error('Request failed')
      }
      setStatus('idle')
      setView('sent')
      form.reset()
      window.setTimeout(closeWidget, 2200)
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <button
        type="button"
        className="feedback-widget-button"
        onClick={openForm}
        aria-label="Website feedback geven"
      >
        <FeedbackIcon />
      </button>

      {open && (
        <div className="feedback-widget-overlay" onClick={closeWidget}>
          <div
            className="feedback-widget-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Feedback"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="feedback-widget-close"
              onClick={closeWidget}
              aria-label="Sluiten"
            >
              <CloseIcon />
            </button>

            {view === 'intro' && (
              <div className="feedback-widget-intro">
                <h3>
                  We hebben hard gewerkt aan onze nieuwe website en we hopen dat het gelukt is!
                </h3>
                <p>Heb je vragen, opmerkingen of kan je iets niet vinden?</p>
                <p>Laat het ons weten en neem contact op!</p>
                <button type="button" className="feedback-widget-cta" onClick={closeWidget}>
                  Ga naar de website
                </button>
              </div>
            )}

            {view === 'form' && (
              <form className="feedback-widget-form" onSubmit={handleSubmit} noValidate>
                <h3>Website feedback geven</h3>
                <p className="feedback-widget-form-intro">
                  Help ons de website te verbeteren en informatie makkelijker vindbaar te maken.
                </p>
                <div className="feedback-widget-field">
                  <label htmlFor="fw-naam">Naam</label>
                  <input id="fw-naam" name="name" type="text" placeholder="Naam" required />
                </div>
                <div className="feedback-widget-field">
                  <label htmlFor="fw-email">E-mail</label>
                  <input
                    id="fw-email"
                    name="email"
                    type="email"
                    placeholder="E-mailadres"
                    required
                  />
                </div>
                <div className="feedback-widget-field">
                  <label htmlFor="fw-bericht">Bericht</label>
                  <textarea
                    id="fw-bericht"
                    name="message"
                    placeholder="Bericht"
                    rows={5}
                    required
                  />
                </div>
                {status === 'error' && (
                  <p className="feedback-widget-error">
                    Versturen is niet gelukt. Probeer het opnieuw.
                  </p>
                )}
                <button
                  className="feedback-widget-submit"
                  type="submit"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Verzenden…' : 'Versturen'}
                </button>
              </form>
            )}

            {view === 'sent' && (
              <div className="feedback-widget-success">
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
                <p>Bedankt voor je feedback!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
