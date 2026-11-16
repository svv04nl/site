'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import NextMatchCard from '@/components/NextMatchCard'
import CalendarButton from '@/components/ui/CalendarDialog'
import { nextMatchQuery } from '@/lib/clubdata/queries'
import { MoreLink } from '@/components/ui/MoreLink'

type Props = {
  teamcode: number | string | null
  teamName: string
  /** The team's slug: adds the button that puts every match of the team in your calendar. */
  slug?: string
  programmaHref?: string
}

export default function TeamNextMatchSection({ teamcode, teamName, slug, programmaHref }: Props) {
  const { data: match } = useQuery(nextMatchQuery(teamcode ? Number(teamcode) : null))
  const name = /svv/i.test(teamName) ? teamName : `SVV'04 ${teamName}`

  if (!match && !slug) {
    return null
  }

  return (
    <div className="sidebar-section team-next">
      <h2 className="sidebar-section-title">Volgende wedstrijd</h2>
      {match ? (
        <NextMatchCard match={match} teamName={teamName} showTitle={false} />
      ) : (
        <p className="team-next__empty">Nog geen wedstrijd gepland.</p>
      )}
      {programmaHref && <MoreLink href={programmaHref} text="Volledig programma" />}
      {/* "Volg in je agenda": the team's feed, so every match and every change to it shows up
          in your own calendar. */}
      {slug && teamcode && (
        <CalendarButton
          className="btn btn--primary btn--block calendar-button team-next__agenda"
          label="Alle wedstrijden in je agenda"
          title="Zet in je agenda"
          subtitle={`Alle wedstrijden van ${name}, altijd actueel. Wijzigingen en afgelastingen komen er vanzelf in.`}
          target={{ kind: 'feed', path: `/api/agenda/team/${slug}.ics`, name }}
        />
      )}
    </div>
  )
}
