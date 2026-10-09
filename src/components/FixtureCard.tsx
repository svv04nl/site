import React from 'react'
import MatchCard from '@/components/ui/MatchCard'
import type { MatchData } from '@/components/NextMatchCard'

type Props = {
  match: MatchData
}

/** Maps the clubdata MatchData of the next-match queries onto the shared MatchCard. */
export default function FixtureCard({ match }: Props) {
  return (
    <MatchCard
      date={match.dateShort ?? match.date}
      homeTeam={match.homeTeam.name}
      awayTeam={match.awayTeam.name}
      homeTeamRelatiecode={match.homeTeam.clubRelatiecode}
      awayTeamRelatiecode={match.awayTeam.clubRelatiecode}
      isOwnHome={match.homeTeam.isOwn}
      isOwnAway={match.awayTeam.isOwn}
      time={match.time}
      href={match.matchCode ? `/wedstrijd/${match.matchCode}` : undefined}
    />
  )
}
