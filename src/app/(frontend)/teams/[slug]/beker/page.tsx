'use client'

import { useQuery } from '@tanstack/react-query'
import { teamPoulesQuery } from '@/lib/clubdata/queries'
import { useTeam } from '@/components/team/TeamContext'
import CupTab from '@/components/team/CupTab'

export default function BekerPage() {
  const { teamcode } = useTeam()
  const { data: poules } = useQuery(teamPoulesQuery(teamcode))

  return <CupTab poules={poules?.cupPoules ?? []} />
}
