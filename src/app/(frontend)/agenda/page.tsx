export const dynamic = 'force-dynamic'

import React from 'react'
import Link from 'next/link'
import { fetchClubData } from '@/lib/clubdata/fetch'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import type { RawActiviteitenResponse } from '@/lib/clubdata/types'

export const metadata = { title: "SVV'04 - Agenda" }

export default async function AgendaPage() {
  const activiteiten = await fetchClubData<RawActiviteitenResponse>(
    'verenigingsactiviteiten',
    null,
    { aantaldagen: '365' },
  ).catch(() => [] as RawActiviteitenResponse)

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
    <main className="agenda-page">

      <SetBreadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Agenda' }]} />

      <div className="agenda-inner">
        <h1 className="programma-title">Agenda</h1>

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
                  // Only show end date when it's strictly after the start date (different calendar day)
                  const dateTo =
                    dateToRaw && dateToRaw.toDateString() !== date.toDateString() && dateToRaw > date
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
                        {formattedTo && (
                          <time className="agenda-date-to">t/m {formattedTo}</time>
                        )}
                      </div>
                      <div className="agenda-item-content">
                        <span className="calendar-event">
                          {item.url ? (
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                              {item.activiteit}
                            </a>
                          ) : item.activiteit}
                        </span>
                        {item.plaats && (
                          <span className="agenda-item-place">{item.plaats}</span>
                        )}
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
