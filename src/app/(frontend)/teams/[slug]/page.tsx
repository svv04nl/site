'use client'

import { useQuery } from '@tanstack/react-query'
import { teamPoulesQuery } from '@/lib/clubdata/queries'
import { useTeam } from '@/components/team/TeamContext'
import StandingsTab from '@/components/team/StandingsTab'

export default function TeamPage() {
  const { teamcode } = useTeam()
  const { data: poules } = useQuery(teamPoulesQuery(teamcode))

  return <StandingsTab poules={poules?.poules ?? []} />
}
