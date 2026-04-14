'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import { activiteitenQuery } from '@/lib/clubdata/queries'
import { SectionHeader } from '@/components/ui/SectionHeader'

export default function AgendaPage() {
  const { data: activiteiten = [] } = useQuery(activiteitenQuery(365))

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

      <div className="page-inner agenda-inner">
        <SectionHeader as="h1" title="Agenda" />

        {activiteiten.length === 0 ? (
          <p className="agenda-empty">Geen activiteiten gepland.</p>
        ) : (
          grouped.map((group) => (
            <div key={group.label} className="agenda-group">
              <h2 className="agenda-month">{group.label}</h2>
              <ol className="calendar-list">
                {group.items.map((item, i) => {
                  const date = new Date(item.datumvan)
                  const dateToRaw = item.datumtm ? new Date(item.datumtm) : null
                  const dateTo =
                    dateToRaw &&
                    dateToRaw.toDateString() !== date.toDateString() &&
                    dateToRaw > date
                      ? dateToRaw
                      : null

                  const formattedFrom = date.toLocaleDateString('nl-NL', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })
                  const formattedTo = dateTo
                    ? dateTo.toLocaleDateString('nl-NL', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })
                    : null

                  return (
                    <li key={i} className="calendar-item agenda-item">
                      <div className="agenda-item-date">
                        <time className="calendar-date agenda-date-from">{formattedFrom}</time>
                        {formattedTo && <time className="agenda-date-to">t/m {formattedTo}</time>}
                      </div>
                      <div className="agenda-item-content">
                        <span className="calendar-event">
                          {item.url ? (
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                              {item.activiteit}
                            </a>
                          ) : (
                            item.activiteit
                          )}
                        </span>
                        {item.plaats && <span className="agenda-item-place">{item.plaats}</span>}
                        {item.opmerkingen && (
                          <span className="agenda-item-notes">{item.opmerkingen}</span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          ))
        )}
      </div>
    </main>
  )
}
