'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import NextMatchCard from '@/components/NextMatchCard'
import { nextMatchQuery } from '@/lib/clubdata/queries'

type Props = {
  teamcode: number | string | null
  teamName?: string
  showTitle?: boolean
  maxDays?: number
}

export default function NextMatchServer({ teamcode, teamName, showTitle = true, maxDays }: Props) {
  const { data: match } = useQuery(nextMatchQuery(teamcode ? Number(teamcode) : null, maxDays))

  if (!match) {
    return null
  }

  return <NextMatchCard match={match} teamName={teamName} showTitle={showTitle} />
}
