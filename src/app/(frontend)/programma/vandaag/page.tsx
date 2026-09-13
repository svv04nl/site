import React from 'react'
import ClubSchedule from '@/components/ClubSchedule'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import { SectionHeader } from '@/components/ui/SectionHeader'

export default function ProgrammaVandaagPage() {
  return (
    <main className="page">
      <SetBreadcrumb
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Programma', href: '/programma' },
          { label: 'Vandaag' },
        ]}
      />

      <div className="page-inner">
        <SectionHeader as="h1" title="Programma - vandaag" />
        <ClubSchedule range="vandaag" emptyMessage="Geen wedstrijden vandaag." />
      </div>
    </main>
  )
}
