import React from 'react'
import ClubSchedule from '@/components/ClubSchedule'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import { SectionHeader } from '@/components/ui/SectionHeader'

export default function ProgrammaVolgendeWeekPage() {
  return (
    <main className="page">
      <SetBreadcrumb
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Programma', href: '/programma' },
          { label: 'Volgende week' },
        ]}
      />

      <div className="page-inner">
        <SectionHeader as="h1" title="Programma - volgende week" />
        <ClubSchedule range="volgende-week" emptyMessage="Geen wedstrijden volgende week." />
      </div>
    </main>
  )
}
