import React from 'react'
import Link from 'next/link'
import ClubSchedule from '@/components/ClubSchedule'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import { SectionHeader } from '@/components/ui/SectionHeader'

export default function ProgrammaPage() {
  return (
    <main className="page">
      <SetBreadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Programma' }]} />

      <div className="page-inner">
        <SectionHeader as="h1" title="Programma" />
        <ClubSchedule />
      </div>
    </main>
  )
}
