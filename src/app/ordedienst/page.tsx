'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { ordiedienstScheduleQuery } from '@/lib/clubdata/queries'
import './styles.scss'

const ACCOMMODATIE = 'Sportpark de Kampen'

export default function OrdiedienstPage() {
  const { data: all = [] } = useQuery(ordiedienstScheduleQuery())
  const matches = all.filter((m) => m.accommodatie === ACCOMMODATIE)

  // Group by date
  const grouped: { date: string; label: string; items: typeof matches }[] = []
  for (const m of matches) {
    const dateKey = m.wedstrijddatum.slice(0, 10)
    const label = new Date(dateKey).toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    const existing = grouped.find((g) => g.date === dateKey)
    if (existing) {
      existing.items.push(m)
    } else {
      grouped.push({ date: dateKey, label, items: [m] })
    }
  }

  return (
    <main>
      <h1>Ordedienst</h1>
      <p className="subtitle">Thuiswedstrijden</p>

      {grouped.length === 0 ? (
        <p className="empty">Geen thuiswedstrijden op {ACCOMMODATIE} de komende 7 dagen.</p>
      ) : (
        <div className="groups">
          {grouped.map((group) => (
            <div key={group.date}>
              <h2 className="day-label">{group.label}</h2>
              <div className="table-wrap">
                <table>
                  <colgroup>
                    <col className="col-time" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Tijd</th>
                      <th>Team</th>
                      <th>Tegenstander</th>
                      <th>Veld</th>
                      <th>Kleedkamer thuis</th>
                      <th>Kleedkamer uit</th>
                      <th>Kleedkamer scheidsrechter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((m) => (
                      <tr key={m.wedstrijdcode}>
                        <td className="time">{m.aanvangstijd}</td>
                        <td className="team">{m.thuisteam}</td>
                        <td>{m.uitteam}</td>
                        <td>{m.veld || '—'}</td>
                        <td>{m.kleedkamerthuisteam || '—'}</td>
                        <td>{m.kleedkameruitteam || '—'}</td>
                        <td>{m.kleedkamerscheidsrechter || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
