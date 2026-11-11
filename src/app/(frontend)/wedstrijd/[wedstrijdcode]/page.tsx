'use client'

import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQueries, useQuery } from '@tanstack/react-query'
import { format, parseISO, isValid } from 'date-fns'
import { nl } from 'date-fns/locale'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import MatchCard from '@/components/ui/MatchCard'
import CalendarButton from '@/components/ui/CalendarDialog'
import { addMinutes, matchMinutes } from '@/lib/agenda/links'
import {
  clubScheduleQuery,
  gameInfoQuery,
  gameHomeTeamQuery,
  gameAwayTeamQuery,
} from '@/lib/clubdata/queries'
import {
  amsterdamToday,
  browserTestMode,
  cancellationLabel,
  testCancelledCodes,
  type CancellationTestMode,
} from '@/lib/clubdata/cancellation'
import { CLUB_RELATIECODE } from '@/lib/clubdata/config'
import type { RawWedstrijdSpeler } from '@/lib/clubdata/types'

function parseDateStr(s: string): Date | null {
  if (!s) {
    return null
  }
  const d = parseISO(s)
  return isValid(d) ? d : null
}

function parseScheidsrechters(s: string): { name: string; role: string }[] {
  if (!s) {
    return []
  }
  // Each entry is "Naam (Functie)" separated by ", " — but names may contain commas,
  // so split on the pattern "),\s*" which only appears between entries.
  return s
    .split(/\),\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^(.+?)\s*\(([^)]+)\)?$/)
      if (match) {
        return { name: match[1].trim(), role: match[2].trim() }
      }
      return { name: part.replace(/\)$/, '').trim(), role: '' }
    })
}

export default function WedstrijdDetailPage() {
  const { wedstrijdcode } = useParams<{ wedstrijdcode: string }>()

  const [detailQuery, thuisteamQuery, uitteamQuery] = useQueries({
    queries: [
      gameInfoQuery(wedstrijdcode),
      gameHomeTeamQuery(wedstrijdcode),
      gameAwayTeamQuery(wedstrijdcode),
    ],
  })

  const isLoading = detailQuery.isLoading || thuisteamQuery.isLoading || uitteamQuery.isLoading
  const info = detailQuery.data?.wedstrijdinformatie
  const accommodatie = detailQuery.data?.accommodatie
  const matchofficials = detailQuery.data?.matchofficials
  const officials = detailQuery.data?.officials
  const kleedkamers = detailQuery.data?.kleedkamers
  const thuisteamData = detailQuery.data?.thuisteam
  const uitteamData = detailQuery.data?.uitteam
  const homePlayers = thuisteamQuery.data ?? []
  const awayPlayers = uitteamQuery.data ?? []

  const date = info ? parseDateStr(info.wedstrijddatetime) : null
  const displayDate = date
    ? format(date, 'EEE d MMM yyyy', { locale: nl })
    : info?.wedstrijddatumopgemaakt

  const isOwnHome = thuisteamData?.code === CLUB_RELATIECODE
  const isOwnAway = uitteamData?.code === CLUB_RELATIECODE

  const hasScore = info?.thuisscore !== null && info?.uitscore !== null

  // The match details carry no status; the club programme does (afgelast, uitgesteld, ...).
  const { data: schedule } = useQuery(clubScheduleQuery('alles'))
  // Test mode on previews (?afgelasting=test, =veel or =alles): the same matches as in the bar.
  const [testMode, setTestMode] = React.useState<CancellationTestMode | null>(null)
  React.useEffect(() => setTestMode(browserTestMode()), [])
  const testCancelled =
    testMode !== null &&
    testCancelledCodes(schedule ?? [], testMode, amsterdamToday()).has(Number(wedstrijdcode))
  const status = testCancelled
    ? 'Afgelast'
    : schedule?.find((m) => String(m.matchCode) === wedstrijdcode)?.status
  const cancelled = cancellationLabel(status)

  const pageTitle = info ? `${info.thuisteam} – ${info.uitteam}` : 'Wedstrijd'

  return (
    <main className="page wedstrijd-detail-page">
      <SetBreadcrumb
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Programma', href: '/programma' },
          { label: pageTitle },
        ]}
      />

      <div className="page-inner">
        {isLoading && (
          <div className="schedule-loading" aria-label="Laden…">
            <span className="schedule-spinner" />
          </div>
        )}

        {detailQuery.isError && (
          <div className="card" style={{ padding: '2rem' }}>
            <p style={{ marginBottom: '0.5rem' }}>
              Wedstrijdgegevens voor code <strong>{wedstrijdcode}</strong> konden niet worden
              geladen.
            </p>
            <p style={{ fontSize: '0.8rem', color: '#999', fontFamily: 'monospace' }}>
              {detailQuery.error instanceof Error
                ? detailQuery.error.message
                : String(detailQuery.error)}
            </p>
          </div>
        )}

        {!isLoading && !detailQuery.isError && !info && (
          <div className="card" style={{ padding: '2rem' }}>
            <p>
              Geen wedstrijdgegevens gevonden voor code <strong>{wedstrijdcode}</strong>.
            </p>
          </div>
        )}

        {info && (
          <>
            {/* Match header: the shared match card, with what only this page knows around it */}
            {cancelled && (
              <div className="wedstrijd-cancelled" role="status">
                <span className="wedstrijd-cancelled-icon" aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M5.6 5.6l12.8 12.8" />
                  </svg>
                </span>
                <div className="wedstrijd-cancelled-text">
                  <strong>Deze wedstrijd is {cancelled.toLowerCase()}</strong>
                  <span>Een nieuwe datum zie je in het programma zodra die bekend is.</span>
                </div>
                <Link href="/programma" className="wedstrijd-cancelled-link">
                  Naar het programma ›
                </Link>
              </div>
            )}

            <div className="wedstrijd-header">
              {info.klasse && <div className="wedstrijd-header-meta">{info.klasse}</div>}

              <MatchCard
                date={displayDate}
                homeTeam={info.thuisteam}
                awayTeam={info.uitteam}
                homeTeamRelatiecode={thuisteamData?.code}
                awayTeamRelatiecode={uitteamData?.code}
                isOwnHome={isOwnHome}
                isOwnAway={isOwnAway}
                time={info.aanvangstijdopgemaakt}
                score={hasScore ? `${info.thuisscore} – ${info.uitscore}` : undefined}
                venue={info.veldnaam}
                status={status}
                homeNote={kleedkamers?.thuis ? `Kleedkamer ${kleedkamers.thuis}` : undefined}
                awayNote={kleedkamers?.uit ? `Kleedkamer ${kleedkamers.uit}` : undefined}
              />

              <div className="wedstrijd-header-details">
                {accommodatie?.naam &&
                  (accommodatie.routeplanner ? (
                    <a href={accommodatie.routeplanner} target="_blank" rel="noopener noreferrer">
                      {accommodatie.naam}
                      {accommodatie.plaats ? `, ${accommodatie.plaats}` : ''}
                    </a>
                  ) : (
                    <span>
                      {accommodatie.naam}
                      {accommodatie.plaats ? `, ${accommodatie.plaats}` : ''}
                    </span>
                  ))}
              </div>
            </div>

            {/* Before the match: in your calendar and the way there. A dark band with a line of
                text on a computer, only the two buttons on a phone. */}
            {!hasScore && !cancelled && (isOwnHome || isOwnAway || accommodatie?.naam) && (
              <section className="wedstrijd-plan" aria-label="Naar de wedstrijd">
                <div className="wedstrijd-plan-text">
                  <h2 className="wedstrijd-plan-title">Ga je kijken?</h2>
                  <p>Zet de wedstrijd in je agenda of plan je route.</p>
                </div>
                <div className="wedstrijd-plan-actions">
                  {(isOwnHome || isOwnAway) && (
                    <CalendarButton
                      label="Zet in mijn agenda"
                      title="Zet in je agenda"
                      subtitle={`${info.thuisteam} - ${info.uitteam}${displayDate ? `, ${displayDate}` : ''}`}
                      target={{
                        kind: 'event',
                        event: {
                          title: `${info.thuisteam} - ${info.uitteam}`,
                          ...(date
                            ? {
                                start: date,
                                end: addMinutes(
                                  date,
                                  matchMinutes(isOwnHome ? info.thuisteam : info.uitteam),
                                ),
                              }
                            : { firstDay: info.wedstrijddatum.slice(0, 10) }),
                          location: [accommodatie?.naam, accommodatie?.straat, accommodatie?.plaats]
                            .filter(Boolean)
                            .join(', '),
                          details: `Kijk op https://svv04.nl/wedstrijd/${wedstrijdcode} voor afgelastingen en wijzigingen.`,
                        },
                        icsPath: `/api/agenda/wedstrijd/${wedstrijdcode}.ics`,
                        fileName: `svv04-wedstrijd-${wedstrijdcode}.ics`,
                      }}
                    />
                  )}
                  {accommodatie?.naam && (
                    <a
                      className="btn wedstrijd-plan-route"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        [accommodatie.naam, accommodatie.straat, accommodatie.plaats]
                          .filter(Boolean)
                          .join(', '),
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M3 11l18-8-8 18-2-8z" />
                      </svg>
                      Navigeer
                    </a>
                  )}
                </div>
              </section>
            )}

            {/* Opmerkingen */}
            {info.opmerkingen && (
              <section className="wedstrijd-section">
                <h2 className="wedstrijd-section-title">Opmerkingen</h2>
                <div className="card wedstrijd-opmerkingen">{info.opmerkingen}</div>
              </section>
            )}

            {/* Kleedkamer scheidsrechter */}
            {kleedkamers?.official && (
              <section className="wedstrijd-section">
                <h2 className="wedstrijd-section-title">Kleedkamers</h2>
                <div className="wedstrijd-officials card">
                  <div className="wedstrijd-official-row">
                    <span className="wedstrijd-official-label">Scheidsrechter</span>
                    <span className="wedstrijd-official-value">{kleedkamers.official}</span>
                  </div>
                </div>
              </section>
            )}

            {/* Officials */}
            {(() => {
              const parsedRefs = parseScheidsrechters(matchofficials?.scheidsrechters ?? '')
              const hasOfficials =
                parsedRefs.length > 0 ||
                !!officials?.verenigingsscheidsrechter ||
                !!officials?.overigeofficial
              if (!hasOfficials) {
                return null
              }
              return (
                <section className="wedstrijd-section">
                  <h2 className="wedstrijd-section-title">Officials</h2>
                  <div className="wedstrijd-officials card">
                    {parsedRefs.map((ref, i) => (
                      <div key={i} className="wedstrijd-official-row">
                        <span className="wedstrijd-official-label">
                          {ref.role || 'Scheidsrechter'}
                        </span>
                        <span className="wedstrijd-official-value">{ref.name}</span>
                      </div>
                    ))}
                    {officials?.verenigingsscheidsrechter && (
                      <div className="wedstrijd-official-row">
                        <span className="wedstrijd-official-label">Verenigingsscheidsrechter</span>
                        <span className="wedstrijd-official-value">
                          {officials.verenigingsscheidsrechter}
                        </span>
                      </div>
                    )}
                    {officials?.overigeofficial && (
                      <div className="wedstrijd-official-row">
                        <span className="wedstrijd-official-label">Overige official</span>
                        <span className="wedstrijd-official-value">
                          {officials.overigeofficial}
                        </span>
                      </div>
                    )}
                  </div>
                </section>
              )
            })()}

            {/* Player lineups */}
            {(homePlayers.length > 0 || awayPlayers.length > 0) && (
              <section className="wedstrijd-section">
                <h2 className="wedstrijd-section-title">Spelers</h2>
                <div className="wedstrijd-lineups">
                  {(
                    [
                      {
                        title: info.thuisteam,
                        players: homePlayers.filter((p) => p.rol === 'Teamspeler'),
                      },
                      {
                        title: info.uitteam,
                        players: awayPlayers.filter((p) => p.rol === 'Teamspeler'),
                      },
                    ] as { title: string; players: RawWedstrijdSpeler[] }[]
                  ).map(({ title, players }) => {
                    const visible = players.filter((p) => p.relatiecode !== null)
                    const hiddenCount = players.length - visible.length
                    return (
                      <div key={title} className="wedstrijd-lineup">
                        <ul className="wedstrijd-lineup-list">
                          {visible.map((p, i) => (
                            <li key={i} className="wedstrijd-lineup-player">
                              <span className="wedstrijd-lineup-name">{p.naam}</span>
                            </li>
                          ))}
                          {hiddenCount > 0 && (
                            <li className="wedstrijd-lineup-player">
                              <span className="wedstrijd-lineup-hidden">
                                Afgeschermd ({hiddenCount}x)
                              </span>
                            </li>
                          )}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Staff */}
            {(() => {
              const sortStaf = (staf: RawWedstrijdSpeler[]) =>
                [...staf].sort((a, b) => {
                  if (a.functie === 'Trainer/coach') {
                    return -1
                  }
                  if (b.functie === 'Trainer/coach') {
                    return 1
                  }
                  return 0
                })
              const homeStaf = sortStaf(homePlayers.filter((p) => p.rol !== 'Teamspeler'))
              const awayStaf = sortStaf(awayPlayers.filter((p) => p.rol !== 'Teamspeler'))
              if (homeStaf.length === 0 && awayStaf.length === 0) {
                return null
              }
              return (
                <section className="wedstrijd-section">
                  <h2 className="wedstrijd-section-title">Staf</h2>
                  <div className="wedstrijd-lineups">
                    {(
                      [
                        { title: info.thuisteam, staf: homeStaf },
                        { title: info.uitteam, staf: awayStaf },
                      ] as { title: string; staf: RawWedstrijdSpeler[] }[]
                    ).map(({ title, staf }) => (
                      <div key={title} className="wedstrijd-lineup">
                        <ul className="wedstrijd-lineup-list">
                          {staf.map((p, i) => (
                            <li key={i} className="wedstrijd-lineup-player">
                              <span className="wedstrijd-lineup-name">
                                {p.relatiecode === null ? (
                                  <span className="wedstrijd-lineup-hidden">Afgeschermd</span>
                                ) : (
                                  p.naam
                                )}
                              </span>
                              {p.functie && (
                                <span className="wedstrijd-lineup-pos">{p.functie}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })()}
          </>
        )}
      </div>
    </main>
  )
}
