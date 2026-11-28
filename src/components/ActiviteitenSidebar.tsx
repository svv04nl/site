'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { activiteitenQuery } from '@/lib/clubdata/queries'
import Link from 'next/link'
import { AgendaItem } from '@/components/agenda/AgendaItem'

export function ActiviteitenSidebar() {
  const { data: activiteiten = [], isLoading } = useQuery(activiteitenQuery(100))

  // Geen agenda-items (en niet meer aan het laden): laat de sectie helemaal weg.
  if (!isLoading && activiteiten.length === 0) {
    return null
  }

  return (
    <div className="sidebar-section">
      <div className="sidebar-head">
        <h2 className="sidebar-head-title">Agenda</h2>
        <Link href="/agenda" className="home-text-link">
          Volledige agenda &rarr;
        </Link>
      </div>
      <ul className="agenda-list">
        {activiteiten.slice(0, 3).map((item, i) => (
          <AgendaItem key={i} item={item} />
        ))}
      </ul>
    </div>
  )
}
