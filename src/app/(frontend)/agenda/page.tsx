'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import { activiteitenQuery } from '@/lib/clubdata/queries'
import { SectionHeader } from '@/components/ui/SectionHeader'
import CalendarButton from '@/components/ui/CalendarDialog'
import { AgendaItem } from '@/components/agenda/AgendaItem'

export default function AgendaPage() {
  const { data: activiteiten = [], isLoading } = useQuery(activiteitenQuery(365))

  // Group by month
  const grouped: { label: string; items: typeof activiteiten }[] = []
  for (const item of activiteiten) {
    const date = new Date(item.datumvan)
    const label = date.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
    const existing = grouped.find((g) => g.label === label)
    if (existing) {
      existing.items.push(item)
    } else {
      grouped.push({ label, items: [item] })
    }
  }

  return (
    <main className="page">
      <SetBreadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Agenda' }]} />

      <div className="page-inner">
        <SectionHeader as="h1" title="Agenda" />

        {/* Subscribe to the club calendar: new activities come in by themselves */}
        <div className="agenda-subscribe">
          <div>
            <strong>Volg de clubagenda</strong>
            <span>Activiteiten van de club in je eigen agenda, altijd actueel.</span>
          </div>
          <CalendarButton
            title="Volg de clubagenda"
            subtitle="Alle activiteiten van SVV'04, altijd actueel."
            label="Volgen"
            target={{ kind: 'feed', path: '/api/agenda/clubagenda.ics', name: "SVV'04 clubagenda" }}
          />
        </div>

        {isLoading ? null : activiteiten.length === 0 ? (
          <p className="agenda-empty">Geen activiteiten gepland.</p>
        ) : (
          grouped.map((group) => (
            <section key={group.label} className="agenda-group">
              <h2 className="agenda-month">{group.label}</h2>
              <ul className="agenda-list">
                {group.items.map((item, i) => (
                  <AgendaItem key={i} item={item} full />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </main>
  )
}
