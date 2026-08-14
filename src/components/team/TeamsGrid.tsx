import React from 'react'
import Link from 'next/link'
import type { Media } from '@/payload-types'

export type GridTeam = {
  id: string | number
  slug: string
  name: string
  type: string
  category?: string | null
  photo?: Media | number | string | null
}

type Props = {
  teams: GridTeam[]
}

const groupLabel: Record<string, string> = {
  senior: 'Senioren',
  youth: 'Jeugd',
}

function TeamCard({ team }: { team: GridTeam }) {
  const photo = team.photo as Media | null | undefined
  const photoUrl = photo?.sizes?.teamCard?.url ?? photo?.url ?? null

  return (
    <Link href={`/teams/${team.slug}`} className="card-team card">
      <div className="card-team-img-wrap">
        {groupLabel[team.type] && (
          <span className={`card-team-badge card-team-badge--${team.type}`}>
            {groupLabel[team.type]}
          </span>
        )}
        <img
          src={photoUrl ?? '/team-placeholder.png'}
          alt={photo?.alt ?? team.name}
          className="card-team-img"
        />
      </div>
      <div className="card-team-body">
        {team.category && <span className="card-team-category">{team.category}</span>}
        <h3 className="card-team-name">{team.name}</h3>
      </div>
    </Link>
  )
}

export default function TeamsGrid({ teams }: Props) {
  const groups = [
    { type: 'senior', teams: teams.filter((team) => team.type === 'senior') },
    { type: 'youth', teams: teams.filter((team) => team.type === 'youth') },
  ]

  if (groups.every((group) => group.teams.length === 0)) {
    return <p className="news-empty">Geen teams gevonden.</p>
  }

  return (
    <>
      {groups.map(
        (group) =>
          group.teams.length > 0 && (
            <div key={group.type} className="teams-group">
              <h2 className="teams-group-title">{groupLabel[group.type]}</h2>
              <div className="teams-grid">
                {group.teams.map((team) => (
                  <TeamCard key={team.id} team={team} />
                ))}
              </div>
            </div>
          ),
      )}
    </>
  )
}
