import React from 'react'
import MatchCard from '@/components/ui/MatchCard'
import type { MatchDto, MatchTeamDto } from '@/lib/app-api/types'

// The club code sits at the end of the logo URL of the app API ("…logo.php?clubcode=BBKT31T").
const clubcode = (team: MatchTeamDto) => team.logoUrl?.split('clubcode=')[1]

/** A first team match in the hero, as the same match card as in the programma. */
export default function HeroMatchCard({ match, dayLabel }: { match: MatchDto; dayLabel: string }) {
  const cancelled = match.status === 'cancelled' || match.status === 'postponed'
  return (
    <MatchCard
      date={dayLabel}
      homeTeam={match.home.name}
      awayTeam={match.away.name}
      homeTeamRelatiecode={clubcode(match.home)}
      awayTeamRelatiecode={clubcode(match.away)}
      isOwnHome={match.home.isOwn}
      isOwnAway={match.away.isOwn}
      time={match.kickoff}
      {...(cancelled ? { status: match.status === 'postponed' ? 'Uitgesteld' : 'Afgelast' } : {})}
      href={`/wedstrijd/${match.id}`}
    />
  )
}
