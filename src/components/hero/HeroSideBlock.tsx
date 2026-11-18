import React from 'react'
import type { HeroSide } from '@/lib/hero-side'
import HeroPupilCard from '@/components/hero/HeroPupilCard'
import HeroAwayCard from '@/components/hero/HeroAwayCard'

/** "za 21 nov", in Dutch time. */
function dayLabel(date: string): string {
  return new Intl.DateTimeFormat('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/Amsterdam',
  })
    .format(new Date(`${date}T12:00:00Z`))
    .replace(/\./g, '')
}

/** The block on the right of the homepage hero (see lib/hero-side). */
export default function HeroSideBlock({ side }: { side: HeroSide }) {
  const day = dayLabel(side.match.date)
  return (
    <div className="site-hero-side">
      {side.kind === 'pupil' ? (
        <HeroPupilCard
          pupil={side.pupil}
          matchLabel={`${side.match.home.name} – ${side.match.away.name}`}
          dayLabel={day}
        />
      ) : (
        <HeroAwayCard match={side.match} dayLabel={day} />
      )}
    </div>
  )
}
