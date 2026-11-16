'use client'

import { useQuery } from '@tanstack/react-query'
import TeamRoster from '@/components/ui/TeamRoster'
import { teamRosterQuery } from '@/lib/clubdata/queries'
import { useTeam } from '@/components/team/TeamContext'

export default function TeamRosterSection({ playersOnly = false }: { playersOnly?: boolean }) {
  const { teamcode } = useTeam()
  const { data, isLoading } = useQuery(teamRosterQuery(teamcode))

  if (isLoading) {
    return null
  }
  // The bond has no selection for this team (yet): say so instead of an empty tab.
  if (!data || (data.players.length === 0 && data.hiddenCount === 0)) {
    return <p className="league-empty">Er is nog geen selectie bekend voor dit team.</p>
  }

  return <TeamRoster data={data} playersOnly={playersOnly} />
}
