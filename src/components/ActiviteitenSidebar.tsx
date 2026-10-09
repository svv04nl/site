'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { activiteitenQuery } from '@/lib/clubdata/queries'
import Link from 'next/link'

export function ActiviteitenSidebar() {
  const { data: activiteiten = [], isLoading } = useQuery(activiteitenQuery(100))

  // Geen agenda-items (en niet meer aan het laden): laat de sectie helemaal weg.
  if (!isLoading && activiteiten.length === 0) return null

  return (
    <div className="sidebar-section">
      <div className="sidebar-head">
        <h2 className="sidebar-head-title">Agenda</h2>
        <Link href="/agenda" className="home-text-link">
          Volledige agenda &rarr;
        </Link>
      </div>
      <ul className="sidebar-agenda-list">
        {activiteiten.slice(0, 3).map((item, i) => {
          const date = new Date(item.datumvan)
          const isAllDay = item.heledag === 'true'
          const time = isAllDay
            ? null
            : date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
          const metaParts = [time, item.plaats].filter(Boolean)
          return (
            <li key={i} className="sidebar-agenda-item">
              <div className="sidebar-agenda-date-box">
                <span className="sidebar-agenda-day">{date.getDate()}</span>
                <span className="sidebar-agenda-month">
                  {date.toLocaleDateString('nl-NL', { month: 'short' }).replace('.', '')}
                </span>
              </div>
              <div className="sidebar-agenda-content">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sidebar-agenda-name"
                  >
                    {item.activiteit}
                  </a>
                ) : (
                  <span className="sidebar-agenda-name">{item.activiteit}</span>
                )}
                {metaParts.length > 0 && (
                  <span className="sidebar-agenda-meta">{metaParts.join(' · ')}</span>
                )}
              </div>
              {item.url && (
                <span className="sidebar-agenda-arrow" aria-hidden="true">
                  &rarr;
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
