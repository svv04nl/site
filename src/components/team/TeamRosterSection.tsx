'use client'

import { useQuery } from '@tanstack/react-query'
import TeamRoster from '@/components/ui/TeamRoster'
import { teamRosterQuery } from '@/lib/clubdata/queries'
import { useTeam } from '@/components/team/TeamContext'

export default function TeamRosterSection() {
  const { teamcode } = useTeam()
  const { data } = useQuery(teamRosterQuery(teamcode))

  if (!data) return null

  return <TeamRoster data={data} />
}
