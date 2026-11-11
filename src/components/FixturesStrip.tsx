'use client'

import React from 'react'
import { useQueries } from '@tanstack/react-query'
import FixtureCard from '@/components/FixtureCard'
import Link from 'next/link'
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
}

/**
 * Container voor de fixtures-strip op de homepage. Haalt per team de volgende
 * wedstrijd op, sorteert ze op datum en toont er maximaal `limit` (standaard 3).
 * De rendering van één wedstrijd zit in de losse FixtureCard-component.
 */
export default function FixturesStrip({ teams, maxDays = 31, limit = 3 }: Props) {
  const results = useQueries({
    queries: teams.map((team) => nextMatchQuery(Number(team.teamcode), maxDays)),
  })

  const matches = results
    .map((r) => r.data)
    .filter((m): m is NonNullable<typeof m> => !!m)
    .sort((a, b) => (a.dateISO ?? '').localeCompare(b.dateISO ?? ''))
    .slice(0, limit)

  if (matches.length === 0) {
    return null
  }

  return (
    <section className="fixtures-strip">
      <div className="fixtures-strip-inner">
        <div className="fixtures-strip-head">
          <p className="home-eyebrow home-eyebrow--sm">Programma</p>
          <h2 className="fixtures-strip-title">Komende wedstrijden</h2>
          <Link href="/programma" className="fixtures-strip-link">
            Volledig programma &rarr;
          </Link>
        </div>
        <div className="fixtures-strip-list">
          {matches.map((match) => (
            <FixtureCard
              key={match.matchCode ?? `${match.dateISO}-${match.homeTeam.name}`}
              match={match}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
