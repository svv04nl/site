import React from 'react'
import Link from 'next/link'
import ClubSchedule from '@/components/ClubSchedule'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'

export default function ProgrammaPage() {
  return (
    <main className="programma-page">

      <SetBreadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Programma' }]} />

      <div className="team-page-inner">
        <h1 className="programma-title">Programma</h1>
        <ClubSchedule />
      </div>

    </main>
  )
}
