import React from 'react'
import NextMatch from '@/components/NextMatch'
import { fetchClubData } from '@/lib/clubdata/fetch'
import { transformNextMatch } from '@/lib/clubdata/transform'
import type { RawProgrammaResponse } from '@/lib/clubdata/types'

type Props = {
  teamcode: number | string
  teamName?: string
  showTitle?: boolean
}

export default async function NextMatchServer({ teamcode, teamName, showTitle = true }: Props) {
  const raw = await fetchClubData<RawProgrammaResponse>('programma', teamcode, {
    aantaldagen: '365',
    aantalregels: '1',
  }).catch(() => null)

  const match = raw ? transformNextMatch(raw, Number(teamcode)) : null
  if (!match) return null

  return <NextMatch match={match} teamName={teamName} showTitle={showTitle} />
}
