import React from 'react'
import type { TeamRosterData } from '@/lib/clubdata/transform'

type Props = {
  data: TeamRosterData
}

export default function TeamRoster({ data }: Props) {
  const { players, staff, hiddenCount } = data

  return (
    <div className="team-roster">
      {players.length > 0 && (
        <section className="team-roster-group">
          <h3 className="team-roster-role">Spelers</h3>
          <ul className="team-roster-list">
            {players.map((member) => (
              <li key={member.name}>{member.name}</li>
            ))}
            {hiddenCount > 0 && (
              <li className="team-roster-hidden">
                Afgeschermd ({hiddenCount}x)
              </li>
            )}
          </ul>
        </section>
      )}

      {staff.map((group) => (
        <section key={group.role} className="team-roster-group">
          <h3 className="team-roster-role">{group.role || 'Staf'}</h3>
          <ul className="team-roster-list">
            {group.members.map((member) => (
              <li key={member.name}>{member.name}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
