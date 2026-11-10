'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export type CancelledMatch = {
  matchCode: number
  label: string
}

// Above this many matches the bar names the first few and counts the rest.
const MAX_LISTED = 3

export function CancellationBannerClient({
  matches: realMatches,
  testMatches,
}: {
  matches: CancelledMatch[]
  /** Only passed outside production: shown when the URL has ?afgelasting=test. */
  testMatches?: CancelledMatch[]
}) {
  const [testMode, setTestMode] = useState(false)

  useEffect(() => {
    if (testMatches && new URLSearchParams(window.location.search).get('afgelasting') === 'test') {
      setTestMode(true)
    }
  }, [testMatches])

  const matches = testMode && testMatches ? testMatches : realMatches

  // Closing the bar hides it for the rest of the visit. A new cancellation
  // changes the key, so the bar comes back for that one.
  const storageKey = `svv-afgelast-${matches.map((m) => m.matchCode).join('-')}`
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      if (sessionStorage.getItem(storageKey)) setDismissed(true)
    } catch {
      // sessionStorage can be blocked; the bar then simply stays visible.
    }
  }, [storageKey])

  if (dismissed || matches.length === 0) return null

  const listed = matches.slice(0, MAX_LISTED).map((m) => m.label)
  const rest = matches.length - listed.length
  const text = rest > 0 ? `${listed.join(', ')} en nog ${rest} wedstrijden` : listed.join(', ')

  function close() {
    setDismissed(true)
    try {
      sessionStorage.setItem(storageKey, '1')
    } catch {
      // ignore
    }
  }

  return (
    <div className="cancellation-banner" role="status">
      <div className="cancellation-banner-inner">
        <img
          className="cancellation-banner-bram"
          src="/bram/bram-afgelast.webp"
          alt=""
          width={263}
          height={220}
        />
        <Link href="/programma" className="cancellation-banner-text">
          <strong>Afgelast:</strong> {text}
        </Link>
        <Link href="/programma" className="cancellation-banner-link">
          Bekijk het programma
        </Link>
        <button
          type="button"
          className="cancellation-banner-close"
          aria-label="Melding sluiten"
          onClick={close}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
