'use client'

import React from 'react'
import { useQueries } from '@tanstack/react-query'
import FixtureCard from '@/components/FixtureCard'
import type { MatchData } from '@/components/NextMatchCard'
import { MoreLink } from '@/components/ui/MoreLink'
import { nextMatchQuery } from '@/lib/clubdata/queries'

export type FixtureTeam = {
  teamcode: number | string
  teamName?: string
}

type Props = {
  teams: FixtureTeam[]
  /** Aantal dagen vooruit waarin een volgende wedstrijd gezocht wordt. */
  maxDays?: number
  /** Maximaal aantal wedstrijden dat getoond wordt. */
  limit?: number
  /** Teamcode van het 1e elftal: alleen die wedstrijd blijft zichtbaar op kleine schermen. */
  primaryTeamcode?: number | string
}

/**
 * Container voor de fixtures-strip op de homepage. Haalt per team de volgende
 * wedstrijd op, sorteert ze op datum en toont er maximaal `limit` (standaard 3).
 * De rendering van één wedstrijd zit in de losse FixtureCard-component.
 *
 * Op kleine schermen toont de CSS alleen de wedstrijd van het 1e elftal
 * (`primaryTeamcode`). Die wedstrijd wordt daarom altijd meegenomen, ook als hij
 * later valt dan de `limit` eerste wedstrijden.
 */
export default function FixturesStrip({ teams, maxDays = 31, limit = 3, primaryTeamcode }: Props) {
  const results = useQueries({
    queries: teams.map((team) => nextMatchQuery(Number(team.teamcode), maxDays)),
  })

  const byDate = (a: { match: MatchData }, b: { match: MatchData }) =>
    (a.match.dateISO ?? '').localeCompare(b.match.dateISO ?? '')

  const all = results
    .map((r, i) => ({
      match: r.data,
      isPrimary: primaryTeamcode != null && String(teams[i].teamcode) === String(primaryTeamcode),
    }))
    .filter((e): e is { match: MatchData; isPrimary: boolean } => !!e.match)
    .sort(byDate)

  const entries = all.slice(0, limit)
  const primary = all.find((e) => e.isPrimary)
  if (primary && !entries.includes(primary)) {
    entries[entries.length - 1] = primary
    entries.sort(byDate)
  }
  const matches = entries

  if (matches.length === 0) return null

  return (
    <section className={`fixtures-strip${primary ? '' : ' fixtures-strip--no-primary'}`}>
      <div className="fixtures-strip-inner">
        <h2 className="fixtures-strip-title">
          Komende
          <br />
          wedstrijden
        </h2>
        <div className="fixtures-strip-list">
          {matches.map(({ match, isPrimary }) => (
            <FixtureCard
              key={match.matchCode ?? `${match.dateISO}-${match.homeTeam.name}`}
              match={match}
              secondary={!isPrimary}
            />
          ))}
        </div>
        <MoreLink href="/programma" text="Volledig programma" className="fixtures-strip-link" />
      </div>
    </section>
  )
}
