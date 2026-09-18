'use client'

import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getWeekMatches, getDayOptions, getScheduleForDay, getTournamentTeamsForDay } from './data'
import { POSTER_DIMENSIONS, paginateTeamGroups, shouldUseBigStyle, type PosterFormat } from './Poster'

const FORMAT_LABELS: Record<PosterFormat, string> = {
  story: 'Instagram Story (9:16)',
  post: 'Instagram post (1:1)',
}

type GalleryImage = {
  key: string
  label: string
  url: string
}

export default function ProgrammaSocialsPage() {
  const [format, setFormat] = useState<PosterFormat>('story')
  const [cacheBust, setCacheBust] = useState(0)

  const { data: matches, isLoading, isError } = useQuery({
    queryKey: ['social-schedule-week'],
    queryFn: getWeekMatches,
    staleTime: 5 * 60 * 1000,
  })

  const dayOptions = useMemo(() => getDayOptions(matches ?? []), [matches])

  const images = useMemo<GalleryImage[]>(() => {
    if (!matches) return []
    return dayOptions.flatMap((day) => {
      const daySchedule = getScheduleForDay(matches, day.dayKey)
      const bigStyle = shouldUseBigStyle(daySchedule.teamGroups)
      const pages = paginateTeamGroups(daySchedule.teamGroups, format, bigStyle)
      const dayImages: GalleryImage[] = pages.map((_, i) => ({
        key: `${day.dayKey}-${i + 1}`,
        label: pages.length > 1 ? `${day.label} · Deel ${i + 1}` : day.label,
        url: `/programma/socials/image?format=${format}&day=${day.dayKey}&page=${i + 1}&v=${cacheBust}`,
      }))

      // The 18+/35+/45+/VR18+ "Toernooivorm 7x7" evenings get their own
      // extra image (per own team, round-robin schedule) alongside the
      // regular thuis/uit poster, not folded into it — shown first since
      // it's usually the headline programme for that evening.
      const tournamentTeams = getTournamentTeamsForDay(matches, day.dayKey)
      if (tournamentTeams.length > 0) {
        dayImages.unshift({
          key: `${day.dayKey}-7x7`,
          label: `${day.label} · 7x7`,
          url: `/programma/socials/tournament-image?format=${format}&day=${day.dayKey}&v=${cacheBust}`,
        })
      }

      return dayImages
    })
  }, [matches, dayOptions, format, cacheBust])

  const { width, height } = POSTER_DIMENSIONS[format]

  async function handleShare(image: GalleryImage) {
    const filename = `svv04-programma-${image.key}-${format}.png`

    try {
      const response = await fetch(image.url)
      const blob = await response.blob()
      const file = new File([blob], filename, { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] })
        return
      }
    } catch {
      // User cancelled the share sheet, or sharing failed — don't fall back
      // to a surprise download in that case.
      return
    }

    // Web Share API with files isn't supported here (most desktop browsers)
    // — fall back to a normal file download.
    const a = document.createElement('a')
    a.href = image.url
    a.download = filename
    a.click()
  }

  return (
    <main className="page" style={{ paddingTop: 'var(--container-padding)', paddingBottom: 'var(--container-padding)' }}>
      <div className="page-inner">
        {isError && (
          <p className="league-error">Programma kon niet worden geladen. Probeer het later opnieuw.</p>
        )}

        {!isError && isLoading && <p>Programma laden…</p>}

        {!isError && !isLoading && dayOptions.length === 0 && (
          <p className="league-empty">Geen wedstrijden gevonden voor deze week.</p>
        )}

        {dayOptions.length > 0 && (
          <>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
              }}
            >
              <div className="league-filter-toggle">
                {(Object.keys(FORMAT_LABELS) as PosterFormat[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormat(key)}
                    className={`league-filter-btn${format === key ? ' is-active' : ''}`}
                  >
                    {FORMAT_LABELS[key]}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCacheBust((n) => n + 1)}
                className="league-filter-btn"
                style={{ border: '1px solid #ddd', borderRadius: '6px', height: '2.125rem' }}
              >
                Vernieuwen
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
              {images.map((image) => (
                <div
                  key={image.key}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    width: '260px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {image.label}
                  </span>

                  <a href={image.url} target="_blank" rel="noopener noreferrer">
                    <img
                      key={image.url}
                      src={image.url}
                      alt={`Programma ${image.label} - ${FORMAT_LABELS[format]}`}
                      width={width}
                      height={height}
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                        background: '#f2f2f2',
                      }}
                    />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleShare(image)}
                    className="league-filter-btn is-active"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--color-dark)',
                      borderRadius: '6px',
                      height: '3rem',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                    }}
                  >
                    Delen
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
