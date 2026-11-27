'use client'

import React, { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { HeroPupil } from '@/lib/hero-side'

type Props = {
  pupil: HeroPupil
  /** "SVV'04 1 – vv Emmen" */
  matchLabel: string
  /** "za 21 nov" */
  dayLabel: string
  /** The match, as the same match card as in the programma (HeroMatchCard). */
  children?: React.ReactNode
}

/** The pupil's answers in the same popup style as "Zet in je agenda". */
function PupilDialog({
  pupil,
  subtitle,
  onClose,
}: {
  pupil: HeroPupil
  subtitle: string
  onClose: () => void
}) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose])

  return createPortal(
    <div className="calendar-dialog">
      <div className="calendar-dialog__shade" onClick={onClose} aria-hidden="true" />
      <div
        className="calendar-dialog__box pupil-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {/* The photo on top, with the close button over it. */}
        <div className="pupil-dialog__top">
          {pupil.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="pupil-dialog__photo" src={pupil.photo.url} alt={pupil.photo.alt} />
          ) : (
            <span className="pupil-dialog__photo pupil-dialog__photo--empty" aria-hidden="true" />
          )}
          <button
            ref={closeRef}
            type="button"
            className="calendar-dialog__close pupil-dialog__close"
            aria-label="Sluiten"
            onClick={onClose}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div>
          <p className="hero-side-card__label">Pupil van de week</p>
          <h2 id={titleId} className="calendar-dialog__title">
            {pupil.name}
          </h2>
          <p className="calendar-dialog__subtitle">{subtitle}</p>
        </div>
        {pupil.answers.length > 0 && (
          <dl className="pupil-dialog__answers">
            {pupil.answers.map((a) => (
              <div key={a.question}>
                <dt>{a.question}</dt>
                <dd>{a.answer}</dd>
              </div>
            ))}
          </dl>
        )}
        <p className="calendar-dialog__note">
          Kom {pupil.name} aanmoedigen op Sportpark De Kampen!
        </p>
      </div>
    </div>,
    document.body,
  )
}

/** Pupil van de week in the homepage hero: a card that opens the pupil's answers. */
export default function HeroPupilCard({ pupil, matchLabel, dayLabel, children }: Props) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const subtitle = [pupil.team, `loopt mee bij ${matchLabel}`, dayLabel].filter(Boolean).join(' · ')
  return (
    <>
      <div className="hero-side-card hero-side-card--pupil">
        <button
          type="button"
          className="hero-side-card__open"
          onClick={() => setOpen(true)}
          aria-label={`Lees meer over pupil van de week ${pupil.name}`}
        >
          {pupil.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="hero-side-card__photo" src={pupil.photo.url} alt="" />
          ) : (
            <span
              className="hero-side-card__photo hero-side-card__photo--empty"
              aria-hidden="true"
            />
          )}
          {/* Laptop: over the bottom of the photo. Phone: next to it. The match card under it
              already shows the opponent and the day, so this stays short. */}
          <span className="hero-side-card__body">
            <span className="hero-side-card__label">Pupil van de week</span>
            <span className="hero-side-card__name">{pupil.name}</span>
            <span className="hero-side-card__foot">
              <span className="hero-side-card__meta">Loopt mee bij SVV&apos;04 1</span>
              <span className="hero-side-card__more">
                Lees meer <span aria-hidden="true">+</span>
              </span>
            </span>
          </span>
        </button>
        {children}
      </div>
      {open && <PupilDialog pupil={pupil} subtitle={subtitle} onClose={close} />}
    </>
  )
}
