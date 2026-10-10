import React from 'react'
import cx from 'classnames'
import ClubLogo from '@/components/ClubLogo'
import type { StandingsCardData } from '@/lib/ai/card-types'

/** Compact league table in the chat; same look as the Stand tab on the team page. */
export default function StandingsCard({ table }: { table: StandingsCardData }) {
  return (
    <div className="assistant-standings">
      <p className="assistant-standings__title">{table.title}</p>
      <div className="assistant-standings__scroll">
        <table className="league-table">
          <thead>
            <tr>
              <th>#</th>
              <th />
              <th>Team</th>
              <th title="Gespeeld">GW</th>
              <th title="Gewonnen">W</th>
              <th title="Gelijk">G</th>
              <th title="Verloren">V</th>
              <th title="Doelsaldo">DS</th>
              <th title="Punten">P</th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.position} className={cx({ 'league-table-own-row': row.isOwn })}>
                <td className="league-table-pos">{row.position}</td>
                <td className="league-table-logo-cell">
                  <ClubLogo
                    clubcode={row.clubRelatiecode}
                    name={row.team}
                    className="league-table-logo"
                  />
                </td>
                <td className={cx('league-table-name', { 'is-own': row.isOwn })}>{row.team}</td>
                <td>{row.played}</td>
                <td>{row.won}</td>
                <td>{row.drawn}</td>
                <td>{row.lost}</td>
                <td>{row.goalDiff}</td>
                <td className="league-table-pts">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
