import React from 'react'
import FixtureCard from '@/components/FixtureCard'

export type MatchData = {
  date: string // e.g. "ZA 5 APR"
  dateShort?: string // abbreviated, e.g. "za 5 apr"
  dateISO?: string // sortable ISO date, e.g. "2026-04-05T14:30:00+0200"
  time: string // e.g. "14:30"
  matchCode?: number
  homeTeam: {
    name: string
    shortName?: string
    clubRelatiecode?: string
    isOwn?: boolean
    location: 'Thuis' | 'Uit'
  }
  awayTeam: {
    name: string
    shortName?: string
    clubRelatiecode?: string
    isOwn?: boolean
    location: 'Thuis' | 'Uit'
  }
}

type Props = {
  match?: MatchData | null
  teamName?: string
  showTitle?: boolean
}

export default function NextMatchCard({ match, teamName, showTitle = true }: Props) {
  return (
    <div className="next-match">
      {showTitle && <h2 className="card-match-title">Volgende wedstrijd</h2>}
      {match ? (
        <FixtureCard match={match} />
      ) : (
        <p className="card card-match-empty">
          {teamName ? `Nog geen wedstrijd gepland voor ${teamName}.` : 'Wedstrijdgegevens volgen.'}
        </p>
      )}
    </div>
  )
}
