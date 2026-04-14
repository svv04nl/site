import React from 'react'
import type { TeamRosterData } from '@/lib/clubdata/transform'

type Props = {
  data: TeamRosterData
}

export default function TeamRoster({ data }: Props) {
  const { players, staff, hiddenCount } = data

  return (
    <div className="card-selection card">
      {players.length > 0 && (
        <section className="team-selection-group">
          <h3 className="team-selection-role">Spelers</h3>
          <ul className="team-selection-list">
            {players.map((member) => (
              <li key={member.name}>{member.name}</li>
            ))}
            {hiddenCount > 0 && (
              <li className="team-selection-hidden">Afgeschermd ({hiddenCount}x)</li>
            )}
          </ul>
        </section>
      )}

      {staff.map((group) => (
        <section key={group.role} className="team-selection-group">
          <h3 className="team-selection-role">{group.role || 'Staf'}</h3>
          <ul className="team-selection-list">
            {group.members.map((member) => (
              <li key={member.name}>{member.name}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
