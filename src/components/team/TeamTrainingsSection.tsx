import React from 'react'
import Link from 'next/link'
import type { Team } from '@/payload-types'
import { DAY_LABELS, sortTrainings, timeRange } from '@/lib/trainings'

/** The team's training times (from the CMS, Sportlink has none), in the side column. */
export default function TeamTrainingsSection({ trainings }: { trainings: Team['trainings'] }) {
  const rows = sortTrainings(trainings ?? [])
  if (rows.length === 0) {
    return null
  }

  return (
    <div className="sidebar-section">
      <h2 className="sidebar-section-title">Trainingen</h2>
      <ul className="team-trainings">
        {rows.map((t) => (
          <li key={t.id ?? `${t.day}-${t.startTime}`} className="team-trainings__row">
            <span className="team-trainings__day">{DAY_LABELS[t.day]}</span>
            <span className="team-trainings__time">{timeRange(t)}</span>
            {(t.group || t.field) && (
              <span className="team-trainings__field">
                {[t.group, t.field].filter(Boolean).join(' · ')}
              </span>
            )}
          </li>
        ))}
      </ul>
      <Link href="/teams/trainingstijden" className="team-trainings__all">
        Alle trainingstijden &rarr;
      </Link>
    </div>
  )
}
