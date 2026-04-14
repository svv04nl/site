'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { activiteitenQuery } from '@/lib/clubdata/queries'
import { MoreLink } from '@/components/ui/MoreLink'

export function ActiviteitenSidebar() {
  const { data: activiteiten = [] } = useQuery(activiteitenQuery(100))

  return (
    <div className="sidebar-section">
      <h2 className="sidebar-section-title">Agenda</h2>
      <ul className="sidebar-agenda-list">
        {activiteiten.length === 0 && (
          <li style={{ color: '#888', fontSize: '0.875rem' }}>Geen activiteiten gepland.</li>
        )}
        {activiteiten.slice(0, 4).map((item, i) => {
          const date = new Date(item.datumvan)
          return (
            <li key={i} className="sidebar-agenda-item">
              <div
                className={`sidebar-agenda-date-box${i === 0 ? ' sidebar-agenda-date-box--primary' : ''}`}
              >
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
                {item.plaats && <span className="sidebar-agenda-meta">{item.plaats}</span>}
              </div>
            </li>
          )
        })}
      </ul>
      <MoreLink href="/agenda" text="Volledige agenda" />
    </div>
  )
}
