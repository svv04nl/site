'use client'

import { useQuery } from '@tanstack/react-query'
import { teamPoulesQuery } from '@/lib/clubdata/queries'
import { useTeam } from '@/components/team/TeamContext'
import LineupTab from '@/components/team/LineupTab'

export default function IndelingPage() {
  const { teamcode } = useTeam()
  const { data: poules } = useQuery(teamPoulesQuery(teamcode))

  return <LineupTab poules={poules?.poules ?? []} />
}
