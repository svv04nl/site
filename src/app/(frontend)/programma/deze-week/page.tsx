import React from 'react'
import ClubSchedule from '@/components/ClubSchedule'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import { SectionHeader } from '@/components/ui/SectionHeader'

export default function ProgrammaDezeWeekPage() {
  return (
    <main className="page">
      <SetBreadcrumb
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Programma', href: '/programma' },
          { label: 'Deze week' },
        ]}
      />

      <div className="page-inner">
        <SectionHeader as="h1" title="Programma - deze week" />
        <ClubSchedule range="deze-week" emptyMessage="Geen wedstrijden deze week." />
      </div>
    </main>
  )
}
