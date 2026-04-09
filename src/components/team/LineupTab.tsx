'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import cx from 'classnames'
import { lineupQuery } from '@/lib/clubdata/queries'
import type { PouleInfo } from '@/lib/clubdata/types'

type Props = {
  poules: PouleInfo[]
  initialIndex?: number
}

export default function LineupTab({ poules, initialIndex = 0 }: Props) {
  const [explicitIndex, setExplicitIndex] = useState<number | undefined>(undefined)

  const selectedIndex = explicitIndex ?? initialIndex
  const selectedPoule = poules[selectedIndex]
  const poulecode = selectedPoule?.poulecode

  const { data: entries, isLoading, isError } = useQuery(lineupQuery(poulecode))

  if (!poulecode) {
    return <p className="league-empty">Geen competitiegegevens beschikbaar.</p>
  }

  return (
    <div className="league-standings">
      <div className="league-standings-controls">
        <h2 className="league-standings-title">Indeling</h2>
        {poules.length > 1 && (
          <select
            className="league-fase-select"
            value={selectedIndex}
            onChange={(e) => setExplicitIndex(Number(e.target.value))}
          >
            {poules.map((p, i) => (
              <option key={p.poulecode} value={i}>
                {p.klasse}
              </option>
            ))}
          </select>
        )}
      </div>
      {selectedPoule?.klassepoule && (
        <p className="league-standings-subtitle">{selectedPoule.klassepoule}</p>
      )}

      {isError && <p className="league-error">Gegevens konden niet worden geladen.</p>}

      {!isError && entries ? (
        <div style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.15s' }}>
          <table className="league-table league-lineup-table">
            <colgroup>
              <col className="col-pos" />
              <col className="col-lineup-team" />
              <col className="col-lineup-day" />
              <col className="col-lineup-time" />
            </colgroup>
            <thead>
              <tr>
                <th>#</th>
                <th>Team</th>
                <th>Speeldag</th>
                <th>Starttijd</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i} className={cx({ 'league-table-own-row': e.isOwn })}>
                  <td className="league-table-pos" data-label="#">
                    {e.speelnummer}
                  </td>
                  <td className={cx('league-table-name', { 'is-own': e.isOwn })} data-label="Team">
                    {e.teamName}
                  </td>
                  <td data-label="Speeldag">{e.speeldag}</td>
                  <td data-label="Starttijd">{e.starttijd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !isError &&
        !isLoading && <p className="league-empty">Indelingsgegevens worden binnenkort geladen.</p>
      )}
    </div>
  )
}
