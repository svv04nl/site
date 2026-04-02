'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import NextMatch from '@/components/NextMatch'
import { nextMatchQuery } from '@/lib/clubdata/queries'

type Props = {
  teamcode: number | string | null
  teamName?: string
  showTitle?: boolean
  maxDays?: number
}

export default function NextMatchServer({ teamcode, teamName, showTitle = true, maxDays }: Props) {
  const { data: match } = useQuery(nextMatchQuery(teamcode ? Number(teamcode) : null, maxDays))

  if (!match) return null

  return <NextMatch match={match} teamName={teamName} showTitle={showTitle} />
}
