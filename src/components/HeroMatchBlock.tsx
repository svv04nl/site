import React from 'react'
import Link from 'next/link'
import NextMatchServer from '@/components/NextMatchServer'

type Props = {
  teamcode: number | string | null
  teamName?: string
}

export default function HeroMatchBlock({ teamcode, teamName }: Props) {
  return (
    <div className="site-hero-match-block">
      <NextMatchServer teamcode={teamcode} teamName={teamName} showTitle={true} />
      <Link className="site-hero-matches-link" href="/programma">
        Alle wedstrijden &rarr;
      </Link>
    </div>
  )
}
