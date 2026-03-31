'use client'

import { useQuery } from '@tanstack/react-query'
import { teamPoulesQuery } from '@/lib/clubdata/queries'
import { useTeam } from '@/components/team/TeamContext'
import ResultsTab from '@/components/team/ResultsTab'

export default function UitslagenPage() {
  const { teamcode } = useTeam()
  const { data: poules } = useQuery(teamPoulesQuery(teamcode))

  return <ResultsTab poules={poules?.poules ?? []} />
}
