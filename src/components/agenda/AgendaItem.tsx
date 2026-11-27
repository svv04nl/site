import React from 'react'
import type { RawActiviteit } from '@/lib/clubdata/types'

type Props = {
  item: RawActiviteit
  /** The agenda page also shows the end date of a multi-day activity and the notes. */
  full?: boolean
}

const dayMonth = (d: Date) =>
  d.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })

/** One activity: the date box, the name and when/where. Used by the homepage block and /agenda. */
export function AgendaItem({ item, full = false }: Props) {
  const date = new Date(item.datumvan)
  const isAllDay = item.heledag === 'true'
  const time = isAllDay
    ? null
    : date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })

  const end = item.datumtm ? new Date(item.datumtm) : null
  const until =
    full && end && end > date && end.toDateString() !== date.toDateString()
      ? `t/m ${dayMonth(end)}`
      : null

  const metaParts = [until, time, item.plaats].filter(Boolean)
  const notes = full ? item.opmerkingen?.trim() : ''

  return (
    <li className="agenda-item">
      <div className="agenda-item__date">
        <span className="agenda-item__day">{date.getDate()}</span>
        <span className="agenda-item__month">
          {date.toLocaleDateString('nl-NL', { month: 'short' }).replace('.', '')}
        </span>
      </div>
      <div className="agenda-item__content">
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="agenda-item__name"
          >
            {item.activiteit}
          </a>
        ) : (
          <span className="agenda-item__name">{item.activiteit}</span>
        )}
        {metaParts.length > 0 && <span className="agenda-item__meta">{metaParts.join(' · ')}</span>}
        {notes && <span className="agenda-item__notes">{notes}</span>}
      </div>
      {item.url && (
        <span className="agenda-item__arrow" aria-hidden="true">
          &rarr;
        </span>
      )}
    </li>
  )
}
