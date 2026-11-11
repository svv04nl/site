'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type CancelledMatch = {
  matchCode: number
  dayKey: string
  /** "za 14 nov" */
  day: string
  time: string
  home: string
  away: string
  /** Our team plays at home (our name is the home team). */
  isHome: boolean
}

/** A day on which all our matches ('alle') or all our home matches ('thuis') are cancelled. */
export type AllCancelled = { dayKey: string; dayLong: string; scope: 'alle' | 'thuis' }

export type CancellationData = { matches: CancelledMatch[]; allCancelled: AllCancelled | null }

// The bar shows this many matches; the rest sit behind a "+N" label that unfolds them.
const MAX_INLINE = 2
// The popup list scrolls above this many matches, so it stays as high as with two.
const MAX_LISTED = 2

// Below this width the bar is too cramped: a phone gets a popup from the bottom instead.
const PHONE_QUERY = '(max-width: 640px)'

function readStorage(store: 'session' | 'local', key: string): boolean {
  try {
    return Boolean((store === 'session' ? sessionStorage : localStorage).getItem(key))
  } catch {
    return false
  }
}

function writeStorage(store: 'session' | 'local', key: string) {
  try {
    ;(store === 'session' ? sessionStorage : localStorage).setItem(key, '1')
  } catch {
    // Storage blocked: the message just comes back on the next page.
  }
}

const Icon = ({
  name,
  size = 16,
}: {
  name: 'ban' | 'close' | 'up' | 'down' | 'right'
  size?: number
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {name === 'ban' && (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M5.6 5.6l12.8 12.8" />
      </>
    )}
    {name === 'close' && <path d="M6 6l12 12M18 6L6 18" />}
    {name === 'up' && <path d="M6 15l6-6 6 6" />}
    {name === 'down' && <path d="M6 9l6 6 6-6" />}
    {name === 'right' && <path d="M9 6l6 6-6 6" />}
  </svg>
)

/** "SVV'04 1 – Testclub 1" with our own team in bold. */
const Teams = ({ m }: { m: CancelledMatch }) =>
  m.isHome ? (
    <>
      <b>{m.home}</b> – {m.away}
    </>
  ) : (
    <>
      {m.home} – <b>{m.away}</b>
    </>
  )

/**
 * Cancelled matches. Computer: a yellow bar above the header (closing it hides it for the visit).
 * Phone: a popup from the bottom, once per visit. When all matches (or all home matches) of a
 * day are cancelled, a computer also gets a popup on the homepage, once per day.
 */
export function CancellationBannerClient({
  data: realData,
  tests,
}: {
  data: CancellationData
  /** Only passed outside production: ?afgelasting=test, =veel or =alles. */
  tests?: Record<string, CancellationData>
}) {
  const pathname = usePathname()
  const [testKey, setTestKey] = useState<string | null>(null)
  const [isPhone, setIsPhone] = useState<boolean | null>(null)
  const [barClosed, setBarClosed] = useState(false)
  const [popupSeen, setPopupSeen] = useState(true)
  const [unfolded, setUnfolded] = useState(false)
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get('afgelasting')
    if (tests && key && tests[key]) {
      setTestKey(key)
    }
  }, [tests])

  useEffect(() => {
    const query = window.matchMedia(PHONE_QUERY)
    const update = () => setIsPhone(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  const data = testKey && tests ? tests[testKey] : realData
  const { matches, allCancelled } = data
  const codes = matches.map((m) => m.matchCode).join('-')

  // A new cancellation changes the keys, so the message comes back for that one.
  const barKey = `svv-afgelast-balk-${codes}`
  const popupKey = isPhone
    ? `svv-afgelast-popup-${codes}`
    : `svv-afgelast-alles-${allCancelled?.dayKey ?? ''}`
  // Computer: the popup is only for "everything cancelled", on the homepage.
  const popupWanted = isPhone ? matches.length > 0 : Boolean(allCancelled) && pathname === '/'

  useEffect(() => {
    setBarClosed(readStorage('session', barKey))
  }, [barKey])

  useEffect(() => {
    if (isPhone === null) {
      return
    }
    // Phone: once per visit. Computer: once per day (the key holds the day).
    setPopupSeen(readStorage(isPhone ? 'session' : 'local', popupKey))
  }, [isPhone, popupKey])

  const showPopup = popupWanted && !popupSeen

  function closePopup() {
    setPopupSeen(true)
    writeStorage(isPhone ? 'session' : 'local', popupKey)
  }

  // Popup open: focus on its close button, Escape closes it.
  useEffect(() => {
    if (!showPopup) {
      return
    }
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePopup()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPopup])

  if (matches.length === 0) {
    return null
  }

  const popup = showPopup ? (
    <CancellationPopup
      matches={allCancelled ? matches.filter((m) => m.dayKey === allCancelled.dayKey) : matches}
      allCancelled={allCancelled}
      titleId={titleId}
      closeRef={closeRef}
      onClose={closePopup}
    />
  ) : null

  // The bar never shows on a phone (CSS hides it there, also before isPhone is known).
  if (barClosed) {
    return popup
  }

  const sameDay = matches.every((m) => m.dayKey === matches[0].dayKey)
  const shown = unfolded ? matches : matches.slice(0, MAX_INLINE)
  const hidden = matches.length - MAX_INLINE

  return (
    <>
      <div className="cancellation-banner" role="status">
        <div className="cancellation-banner-inner">
          <span className="cancellation-banner-icon" aria-hidden="true">
            <Icon name="ban" size={18} />
          </span>
          <span className="cancellation-banner-summary">
            <b>
              {matches.length} {matches.length === 1 ? 'wedstrijd' : 'wedstrijden'} afgelast
            </b>
            {sameDay && ` · ${matches[0].day}`}
          </span>
          <span className="cancellation-banner-pills">
            {shown.map((m) => (
              <Link
                key={m.matchCode}
                href={`/wedstrijd/${m.matchCode}`}
                className="cancellation-pill"
              >
                {!sameDay && <span className="cancellation-pill-day">{m.day}</span>}
                {m.time && <s>{m.time}</s>}
                <span>
                  <Teams m={m} />
                </span>
              </Link>
            ))}
            {hidden > 0 && (
              <button
                type="button"
                className="cancellation-pill cancellation-pill--more"
                aria-expanded={unfolded}
                onClick={() => setUnfolded((v) => !v)}
              >
                {unfolded ? 'Minder' : `+${hidden}`}
                <Icon name={unfolded ? 'up' : 'down'} size={13} />
              </button>
            )}
          </span>
          <Link href="/programma" className="cancellation-banner-link">
            Programma ›
          </Link>
          <button
            type="button"
            className="cancellation-banner-close"
            aria-label="Melding sluiten"
            onClick={() => {
              setBarClosed(true)
              writeStorage('session', barKey)
            }}
          >
            <Icon name="close" />
          </button>
        </div>
      </div>
      {popup}
    </>
  )
}

function CancellationPopup({
  matches,
  allCancelled,
  titleId,
  closeRef,
  onClose,
}: {
  matches: CancelledMatch[]
  allCancelled: AllCancelled | null
  titleId: string
  closeRef: React.RefObject<HTMLButtonElement | null>
  onClose: () => void
}) {
  const title = allCancelled
    ? allCancelled.scope === 'alle'
      ? 'Alle wedstrijden afgelast'
      : 'Alle thuiswedstrijden afgelast'
    : 'Afgelast'
  const sameDay = matches.every((m) => m.dayKey === matches[0]?.dayKey)

  return (
    <div className={`cancellation-popup${allCancelled ? ' cancellation-popup--all' : ''}`}>
      <div className="cancellation-popup-shade" onClick={onClose} aria-hidden="true" />
      <div
        className="cancellation-popup-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="cancellation-popup-head">
          <span className="cancellation-popup-icon" aria-hidden="true">
            <Icon name="ban" size={20} />
          </span>
          <div className="cancellation-popup-heading">
            {allCancelled && (
              <span className="cancellation-popup-eyebrow">{allCancelled.dayLong}</span>
            )}
            <h2 id={titleId} className="cancellation-popup-title">
              {title}
            </h2>
            {!allCancelled && (
              <span className="cancellation-popup-intro">
                {matches.length === 1
                  ? 'Deze wedstrijd gaat niet door.'
                  : 'Deze wedstrijden gaan niet door.'}
              </span>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            className="cancellation-popup-close"
            aria-label="Sluiten"
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {allCancelled && (
          <p className="cancellation-popup-intro">
            {allCancelled.scope === 'alle'
              ? 'Geen van onze wedstrijden gaat door.'
              : 'Geen van onze thuiswedstrijden op Sportpark De Kampen gaat door.'}
          </p>
        )}

        {/* Above MAX_LISTED matches the list scrolls, so the popup keeps its size. */}
        <div
          className={`cancellation-popup-scroll${matches.length > MAX_LISTED ? ' is-scrolling' : ''}`}
        >
          <ul className="cancellation-popup-list">
            {matches.map((m) => (
              <li key={m.matchCode}>
                <Link href={`/wedstrijd/${m.matchCode}`} onClick={onClose}>
                  <span className="cancellation-popup-match">
                    <span className="cancellation-popup-meta">
                      {(!sameDay || !allCancelled) && `${m.day} · `}
                      {m.time && <s>{m.time}</s>}
                      {` · ${m.isHome ? 'Thuis' : 'Uit'}`}
                    </span>
                    <span>
                      <Teams m={m} />
                    </span>
                  </span>
                  <Icon name="right" size={16} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {matches.length > MAX_LISTED && (
          <p className="cancellation-popup-hint">Scroll voor alle {matches.length} wedstrijden</p>
        )}

        <div className="cancellation-popup-actions">
          <Link href="/programma" className="btn btn--primary" onClick={onClose}>
            Bekijk het programma
          </Link>
          {allCancelled && (
            <button type="button" className="btn cancellation-popup-ok" onClick={onClose}>
              Begrepen
            </button>
          )}
        </div>

        <p className="cancellation-popup-note">Tik op een wedstrijd voor meer informatie.</p>
      </div>
    </div>
  )
}
