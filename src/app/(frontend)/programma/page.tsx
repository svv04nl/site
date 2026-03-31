import React from 'react'
import Link from 'next/link'
import ClubSchedule from '@/components/ClubSchedule'

export default function ProgrammaPage() {
  return (
    <main className="programma-page">

      <nav className="team-breadcrumb" aria-label="Kruimelpad">
        <div className="team-page-inner">
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          <span>Programma</span>
        </div>
      </nav>

      <div className="team-page-inner">
        <h1 className="programma-title">Programma</h1>
        <ClubSchedule />
      </div>

    </main>
  )
}
