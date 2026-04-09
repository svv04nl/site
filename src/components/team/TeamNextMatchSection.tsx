'use client'

import React from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import NextMatch from '@/components/NextMatch'
import { nextMatchQuery } from '@/lib/clubdata/queries'
import { MoreLink } from '@/components/ui/MoreLink'

type Props = {
  teamcode: number | string | null
  teamName: string
  programmaHref?: string
}

export default function TeamNextMatchSection({ teamcode, teamName, programmaHref }: Props) {
  const { data: match } = useQuery(nextMatchQuery(teamcode ? Number(teamcode) : null))

  if (!match) return null

  return (
    <div className="team-sidebar-section">
      <h2 className="sidebar-section-title">Volgende wedstrijd</h2>
      <NextMatch match={match} teamName={teamName} showTitle={false} />
      {programmaHref && <MoreLink href={programmaHref} text="Volledig programma" />}
    </div>
  )
}
