import React from 'react'
import Link from 'next/link'
import ClubSchedule from '@/components/ClubSchedule'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'

export default function ProgrammaPage() {
  return (
    <main className="page">
      <SetBreadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Programma' }]} />

      <div className="page-inner">
        <h1 className="page-title">Programma</h1>
        <ClubSchedule />
      </div>
    </main>
  )
}
