'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useQueries } from '@tanstack/react-query'
import { fetchClubData } from '@/lib/clubdata/fetch'
import {
  transformStandings,
  transformSchedule,
  groupScheduleByWeek,
  transformLineup,
  transformResults,
  groupResultsByWeek,
} from '@/lib/clubdata/transform'
import ScheduleWeekGroups from '@/components/ScheduleWeekGroups'
import MatchCard from '@/components/MatchCard'
import { CLUB_RELATIECODE } from '@/lib/clubdata/config'
import type {
  RawTeamsEntry,
  RawPoulestandResponse,
  RawProgrammaResponse,
  RawPouleIndelingResponse,
  RawPouleUitslagenResponse,
} from '@/lib/clubdata/types'

export type StandingRow = {
  position: number
  teamName: string
  logoUrl?: string
  isOwn?: boolean
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  points: number
  note?: string
}

export type LeagueData = {
  competitionName?: string
  phase?: string
  phases?: string[]
  standing?: StandingRow[]
}

type Tab = 'standings' | 'schedule' | 'results' | 'lineup' | 'cup'

const ALL_TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'standings',
    label: 'Stand',
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    id: 'schedule',
    label: 'Programma',
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: 'results',
    label: 'Uitslagen',
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-3.09" />
      </svg>
    ),
  },
  {
    id: 'lineup',
    label: 'Indeling',
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    id: 'cup',
    label: 'Beker',
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    ),
  },
]

type Props = {
  regulierPoules: RawTeamsEntry[]
  bekerPoules: RawTeamsEntry[]
  initialFaseIndex?: number
  teamName?: string
}

const TAB_PARAM = 'tab'

const TAB_IDS: Tab[] = ['standings', 'schedule', 'results', 'lineup', 'cup']

export default function TeamLeagueTabs({
  regulierPoules,
  bekerPoules,
  initialFaseIndex = 0,
  teamName,
}: Props) {
  const hasCup = bekerPoules.length > 0
  const tabs = ALL_TABS.filter((t) => t.id !== 'cup' || hasCup)
  const router = useRouter()
  const searchParams = useSearchParams()

  const tabFromUrl = searchParams.get(TAB_PARAM) as Tab | null
  const activeTab: Tab =
    tabFromUrl && TAB_IDS.includes(tabFromUrl) && (tabFromUrl !== 'cup' || hasCup)
      ? tabFromUrl
      : 'standings'

  function setActiveTab(tab: Tab) {
    const params = new URLSearchParams(searchParams.toString())
    params.set(TAB_PARAM, tab)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="league-section">
      <div className="league-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`league-tab${activeTab === tab.id ? ' is-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="league-content">
        {activeTab === 'standings' && (
          <StandingsTab poules={regulierPoules} initialIndex={initialFaseIndex} />
        )}
        {activeTab === 'schedule' && (
          <ScheduleTab poules={regulierPoules} initialIndex={initialFaseIndex} />
        )}
        {activeTab === 'cup' && <StandingsTab poules={bekerPoules} initialIndex={0} />}
        {activeTab === 'results' && (
          <ResultsTab poules={regulierPoules} initialIndex={initialFaseIndex} />
        )}
        {activeTab === 'lineup' && (
          <LineupTab poules={regulierPoules} initialIndex={initialFaseIndex} />
        )}
      </div>
    </div>
  )
}

// ─── Standings tab ────────────────────────────────────────────────────────────

function StandingsTab({ poules, initialIndex }: { poules: RawTeamsEntry[]; initialIndex: number }) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex)

  const selectedPoule = poules[selectedIndex]
  const poulecode = selectedPoule?.poulecode

  const {
    data: standing,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['standings', poulecode],
    queryFn: async () => {
      const raw = await fetchClubData<RawPoulestandResponse>('poulestand', null, {
        poulecode: String(poulecode),
      })
      return transformStandings(raw)
    },
    enabled: !!poulecode,
    staleTime: 5 * 60 * 1000,
  })

  if (!poulecode) {
    return <p className="league-empty">Geen competitiegegevens beschikbaar.</p>
  }

  return (
    <div className="league-standings">
      <div className="league-standings-controls">
        <h2 className="league-standings-title">Stand</h2>
        {poules.length > 1 && (
          <select
            id="fase-select"
            className="league-fase-select"
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
          >
            {poules.map((p, i) => (
              <option key={p.poulecode} value={i}>
                {p.klasse}
              </option>
            ))}
          </select>
        )}
      </div>
      {selectedPoule?.klassepoule && (
        <p className="league-standings-subtitle">{selectedPoule.klassepoule}</p>
      )}

      {isError && <p className="league-empty">Gegevens konden niet worden geladen.</p>}

      {!isError && standing ? (
        <div style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.15s' }}>
          <table className="league-table">
            <thead>
              <tr>
                <th>#</th>
                <th />
                <th>Team</th>
                <th>GW</th>
                <th>W</th>
                <th>G</th>
                <th>V</th>
                <th>DV</th>
                <th>DT</th>
                <th>DS</th>
                <th>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-label="Aantekening"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </th>
                <th>P</th>
              </tr>
            </thead>
            <tbody>
              {standing.map((row) => (
                <tr key={row.position} className={row.isOwn ? 'league-table-own-row' : ''}>
                  <td className="league-table-pos">{row.position}</td>
                  <td className="league-table-logo-cell">
                    {row.logoUrl ? (
                      <img src={row.logoUrl} alt={row.teamName} className="league-table-logo" />
                    ) : (
                      <div className="league-table-logo-placeholder" />
                    )}
                  </td>
                  <td className={`league-table-name${row.isOwn ? ' is-own' : ''}`}>
                    {row.teamName}
                  </td>
                  <td>{row.played}</td>
                  <td>{row.won}</td>
                  <td>{row.drawn}</td>
                  <td>{row.lost}</td>
                  <td>{row.goalsFor}</td>
                  <td>{row.goalsAgainst}</td>
                  <td>{row.goalDiff}</td>
                  <td className="league-table-note-cell">
                    {row.note && (
                      <span
                        className="league-table-note-icon"
                        title={row.note}
                        aria-label={row.note}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2" />
                          <line x1="12" y1="16" x2="12.01" y2="16" stroke="white" strokeWidth="2" />
                        </svg>
                      </span>
                    )}
                  </td>
                  <td className="league-table-pts">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !isError &&
        !isLoading && <p className="league-empty">Competitiegegevens worden binnenkort geladen.</p>
      )}
    </div>
  )
}

// ─── Schedule tab ─────────────────────────────────────────────────────────────

const ShieldIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

function ScheduleTab({ poules, initialIndex }: { poules: RawTeamsEntry[]; initialIndex: number }) {
  const [selectedPoulecode, setSelectedPoulecode] = useState(poules[initialIndex]?.poulecode)
  const [filterOwn, setFilterOwn] = useState(false)

  // Fetch all poules in parallel to know which have data
  const scheduleQueries = useQueries({
    queries: poules.map((p) => ({
      queryKey: ['schedule', p.poulecode],
      queryFn: async () => {
        const raw = await fetchClubData<RawProgrammaResponse>('poule-programma', null, {
          poulecode: String(p.poulecode),
          eigenwedstrijden: 'NEE',
        })
        return transformSchedule(raw, CLUB_RELATIECODE)
      },
      staleTime: 5 * 60 * 1000,
    })),
  })

  // Only show poules that have data (or haven't loaded yet)
  const availablePoules = poules.filter((_, i) => {
    const q = scheduleQueries[i]
    return !q.isFetched || (q.data && q.data.length > 0)
  })

  // If selected poule was filtered out, switch to first available
  const poulecode =
    availablePoules.find((p) => p.poulecode === selectedPoulecode)?.poulecode ??
    availablePoules[0]?.poulecode

  const selectedPoule = poules.find((p) => p.poulecode === poulecode)
  const queryIndex = poules.findIndex((p) => p.poulecode === poulecode)
  const { data: allMatches, isLoading, isError } = scheduleQueries[queryIndex] ?? {}

  const { data: logoMap } = useQuery({
    queryKey: ['standings', poulecode],
    queryFn: async () => {
      const raw = await fetchClubData<RawPoulestandResponse>('poulestand', null, {
        poulecode: String(poulecode),
      })
      return transformStandings(raw)
    },
    enabled: !!poulecode,
    staleTime: 5 * 60 * 1000,
    select: (rows) => new Map(rows.map((r) => [r.teamName, r.logoUrl])),
  })

  if (!poulecode) {
    return <p className="league-empty">Geen competitiegegevens beschikbaar.</p>
  }

  const filtered = filterOwn ? (allMatches ?? []).filter((m) => m.isOwn) : (allMatches ?? [])
  const weekGroups = groupScheduleByWeek(filtered)

  return (
    <div className="league-schedule">
      <div className="league-schedule-controls">
        <h2 className="league-standings-title">Programma</h2>
        <div className="league-schedule-controls-right">
          <div className="league-filter-toggle">
            <button
              className={`league-filter-btn${!filterOwn ? ' is-active' : ''}`}
              onClick={() => setFilterOwn(false)}
              type="button"
            >
              Alle wedstrijden
            </button>
            <button
              className={`league-filter-btn${filterOwn ? ' is-active' : ''}`}
              onClick={() => setFilterOwn(true)}
              type="button"
            >
              Eigen club
            </button>
          </div>

          {availablePoules.length > 1 && (
            <select
              id="schedule-fase-select"
              value={poulecode}
              onChange={(e) => setSelectedPoulecode(Number(e.target.value))}
              className="league-fase-select"
            >
              {availablePoules.map((p) => (
                <option key={p.poulecode} value={p.poulecode}>
                  {p.klasse}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {isError && <p className="league-empty">Gegevens konden niet worden geladen.</p>}

      {!isError && (
        <ScheduleWeekGroups
          weekGroups={weekGroups}
          logoMap={logoMap}
          subtitle={selectedPoule?.klassepoule}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}

// ─── Lineup tab (poule-indeling) ──────────────────────────────────────────────

function LineupTab({ poules, initialIndex }: { poules: RawTeamsEntry[]; initialIndex: number }) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex)

  const selectedPoule = poules[selectedIndex]
  const poulecode = selectedPoule?.poulecode

  const { data: entries, isLoading, isError } = useQuery({
    queryKey: ['lineup', poulecode],
    queryFn: async () => {
      const raw = await fetchClubData<RawPouleIndelingResponse>('poule-indeling', null, {
        poulecode: String(poulecode),
      })
      return transformLineup(raw)
    },
    enabled: !!poulecode,
    staleTime: 5 * 60 * 1000,
  })

  if (!poulecode) {
    return <p className="league-empty">Geen competitiegegevens beschikbaar.</p>
  }

  return (
    <div className="league-standings">
      <div className="league-standings-controls">
        <h2 className="league-standings-title">Indeling</h2>
        {poules.length > 1 && (
          <select
            className="league-fase-select"
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
          >
            {poules.map((p, i) => (
              <option key={p.poulecode} value={i}>{p.klasse}</option>
            ))}
          </select>
        )}
      </div>
      {selectedPoule?.klassepoule && (
        <p className="league-standings-subtitle">{selectedPoule.klassepoule}</p>
      )}

      {isError && <p className="league-empty">Gegevens konden niet worden geladen.</p>}

      {!isError && entries ? (
        <div style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.15s' }}>
          <table className="league-table league-lineup-table">
            <colgroup>
              <col className="col-pos" />
              <col className="col-lineup-team" />
              <col className="col-lineup-day" />
              <col className="col-lineup-time" />
            </colgroup>
            <thead>
              <tr>
                <th>#</th>
                <th>Team</th>
                <th>Speeldag</th>
                <th>Starttijd</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i} className={e.isOwn ? 'league-table-own-row' : ''}>
                  <td className="league-table-pos" data-label="#">{e.speelnummer}</td>
                  <td className={`league-table-name${e.isOwn ? ' is-own' : ''}`} data-label="Team">{e.teamName}</td>
                  <td data-label="Speeldag">{e.speeldag}</td>
                  <td data-label="Starttijd">{e.starttijd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !isError && !isLoading && <p className="league-empty">Indelingsgegevens worden binnenkort geladen.</p>
      )}
    </div>
  )
}

// ─── Results tab (pouleuitslagen) ─────────────────────────────────────────────

function ResultsTab({ poules, initialIndex }: { poules: RawTeamsEntry[]; initialIndex: number }) {
  const [selectedPoulecode, setSelectedPoulecode] = useState(poules[initialIndex]?.poulecode)
  const [filterOwn, setFilterOwn] = useState(false)

  // Fetch all poules in parallel to know which have data
  const resultsQueries = useQueries({
    queries: poules.map((p) => ({
      queryKey: ['results', p.poulecode],
      queryFn: async () => {
        const raw = await fetchClubData<RawPouleUitslagenResponse>('pouleuitslagen', null, {
          poulecode: String(p.poulecode),
          eigenwedstrijden: 'NEE',
        })
        return transformResults(raw, CLUB_RELATIECODE)
      },
      staleTime: 5 * 60 * 1000,
    })),
  })

  // Only show poules that have data (or haven't loaded yet)
  const availablePoules = poules.filter((_, i) => {
    const q = resultsQueries[i]
    return !q.isFetched || (q.data && q.data.length > 0)
  })

  // If selected poule was filtered out, switch to first available
  const poulecode =
    availablePoules.find((p) => p.poulecode === selectedPoulecode)?.poulecode ??
    availablePoules[0]?.poulecode

  const selectedPoule = poules.find((p) => p.poulecode === poulecode)
  const queryIndex = poules.findIndex((p) => p.poulecode === poulecode)
  const { data: allMatches, isLoading, isError } = resultsQueries[queryIndex] ?? {}

  const { data: logoMap } = useQuery({
    queryKey: ['standings', poulecode],
    queryFn: async () => {
      const raw = await fetchClubData<RawPoulestandResponse>('poulestand', null, {
        poulecode: String(poulecode),
      })
      return transformStandings(raw)
    },
    enabled: !!poulecode,
    staleTime: 5 * 60 * 1000,
    select: (rows) => new Map(rows.map((r) => [r.teamName, r.logoUrl])),
  })

  if (!poulecode) {
    return <p className="league-empty">Geen competitiegegevens beschikbaar.</p>
  }

  const filtered = filterOwn ? (allMatches ?? []).filter((m) => m.isOwn) : (allMatches ?? [])
  const weekGroups = groupResultsByWeek(filtered)

  return (
    <div className="league-schedule">
      <div className="league-schedule-controls">
        <h2 className="league-standings-title">Uitslagen</h2>
        <div className="league-schedule-controls-right">
          <div className="league-filter-toggle">
            <button
              className={`league-filter-btn${!filterOwn ? ' is-active' : ''}`}
              onClick={() => setFilterOwn(false)}
              type="button"
            >
              Alle wedstrijden
            </button>
            <button
              className={`league-filter-btn${filterOwn ? ' is-active' : ''}`}
              onClick={() => setFilterOwn(true)}
              type="button"
            >
              Eigen club
            </button>
          </div>
          {availablePoules.length > 1 && (
            <select
              value={poulecode}
              onChange={(e) => setSelectedPoulecode(Number(e.target.value))}
              className="league-fase-select"
            >
              {availablePoules.map((p) => (
                <option key={p.poulecode} value={p.poulecode}>{p.klasse}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {isError && <p className="league-empty">Gegevens konden niet worden geladen.</p>}

      {!isError && (isLoading && weekGroups.length === 0 ? (
        <div className="schedule-loading" aria-label="Laden…">
          <span className="schedule-spinner" />
        </div>
      ) : weekGroups.length === 0 ? (
        <p className="league-empty">Geen uitslagen gevonden.</p>
      ) : (
        <div style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.15s' }}>
          {weekGroups.map((group) => (
            <div key={group.weekKey} className="league-week-group">
              <h2 className="league-week-title">{group.label}</h2>
              {selectedPoule?.klassepoule && (
                <p className="league-standings-subtitle">{selectedPoule.klassepoule}</p>
              )}
              {/* Desktop: table */}
              <div className="league-week-table-wrap">
                <table className="league-results-table">
                  <colgroup>
                    <col className="col-date" />
                    <col className="col-home" />
                    <col className="col-away" />
                    <col className="col-score" />
                    <col className="col-status" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Datum</th>
                      <th>
                        <span className="league-schedule-th-team">
                          <ShieldIcon />
                          Thuisteam
                        </span>
                      </th>
                      <th>
                        <span className="league-schedule-th-team">
                          <ShieldIcon />
                          Uitteam
                        </span>
                      </th>
                      <th>Uitslag</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.matches.map((m) => (
                      <tr key={m.matchCode} className={m.isOwn ? 'league-schedule-own-row' : ''}>
                        <td className="league-schedule-date" data-label="Datum">{m.date}</td>
                        <td data-label="Thuis">
                          <span className="league-schedule-team-cell">
                            {logoMap?.get(m.homeTeam) && (
                              <img src={logoMap.get(m.homeTeam)} alt="" className="league-schedule-logo" />
                            )}
                            <span className={m.isOwnHome ? 'league-schedule-own-name' : ''}>{m.homeTeam}</span>
                          </span>
                        </td>
                        <td data-label="Uit">
                          <span className="league-schedule-team-cell">
                            {logoMap?.get(m.awayTeam) && (
                              <img src={logoMap.get(m.awayTeam)} alt="" className="league-schedule-logo" />
                            )}
                            <span className={m.isOwnAway ? 'league-schedule-own-name' : ''}>{m.awayTeam}</span>
                          </span>
                        </td>
                        <td className="league-results-score" data-label="Uitslag">{m.score}</td>
                        <td className="league-schedule-status" data-label="Status">{m.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: cards */}
              <div className="next-match-cards-list">
                {group.matches.map((m) => (
                  <MatchCard
                    key={m.matchCode}
                    date={m.date}
                    homeTeam={m.homeTeam}
                    awayTeam={m.awayTeam}
                    homeTeamLogo={logoMap?.get(m.homeTeam)}
                    awayTeamLogo={logoMap?.get(m.awayTeam)}
                    isOwnHome={m.isOwnHome}
                    isOwnAway={m.isOwnAway}
                    isOwn={m.isOwn}
                    score={m.score}
                    status={m.status}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
