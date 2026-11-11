'use client'

import React from 'react'
import CalendarButton from '@/components/ui/CalendarDialog'

// "Volg in je agenda": one button that opens the agenda popup for the team's feed, so every
// match (and every change to it) shows up in your own calendar.
export default function TeamCalendarSection({
  slug,
  teamName,
}: {
  slug: string
  teamName: string
}) {
  const name = /svv/i.test(teamName) ? teamName : `SVV'04 ${teamName}`
  return (
    <div className="sidebar-section team-calendar">
      <h2 className="sidebar-section-title">Volg in je agenda</h2>
      <p className="team-calendar__text">
        Alle wedstrijden van dit team in je eigen agenda. Wijzigingen en afgelastingen komen er
        vanzelf in.
      </p>
      <CalendarButton
        className="btn btn--primary btn--block calendar-button"
        title="Zet in je agenda"
        subtitle={`Alle wedstrijden van ${name}, altijd actueel.`}
        target={{ kind: 'feed', path: `/api/agenda/team/${slug}.ics`, name }}
      />
    </div>
  )
}
