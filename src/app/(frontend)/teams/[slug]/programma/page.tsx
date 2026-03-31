'use client'

import { useQuery } from '@tanstack/react-query'
import { teamPoulesQuery } from '@/lib/clubdata/queries'
import { useTeam } from '@/components/team/TeamContext'
import ScheduleTab from '@/components/team/ScheduleTab'

export default function ProgrammaPage() {
  const { teamcode } = useTeam()
  const { data: poules } = useQuery(teamPoulesQuery(teamcode))

  return <ScheduleTab poules={poules?.poules ?? []} teamcode={teamcode ?? 0} />
}
