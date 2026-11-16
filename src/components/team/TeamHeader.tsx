'use client'

import React from 'react'
import { useTeam } from '@/components/team/TeamContext'
import { outcomeOf, useOwnResults, useTeamClass, type Outcome } from '@/components/team/team-utils'

const OUTCOME_LABEL: Record<Outcome, string> = { W: 'Gewonnen', G: 'Gelijk', V: 'Verloren' }

/** The last five results as W, G and V circles, oldest left. */
function TeamForm() {
  const { teamcode } = useTeam()
  const { results } = useOwnResults(teamcode)
  const last = results
    .slice(0, 5)
    .map((m) => ({ m, outcome: outcomeOf(m) }))
    .filter((r): r is { m: (typeof results)[number]; outcome: Outcome } => r.outcome !== null)
    .reverse()

  if (last.length === 0) {
    return null
  }

  return (
    <div className="team-form" aria-label="Vorm, laatste vijf wedstrijden">
      <span className="team-form__label">Laatste {last.length}</span>
      <ol className="team-form__list">
        {last.map(({ m, outcome }) => (
          <li
            key={m.matchCode}
            className={`team-form__dot team-form__dot--${outcome.toLowerCase()}`}
            title={`${OUTCOME_LABEL[outcome]}: ${m.homeTeam} – ${m.awayTeam} ${m.score}`}
          >
            {outcome}
          </li>
        ))}
      </ol>
    </div>
  )
}

/**
 * Top of a team page: class and match day, the name (the part after "SVV'04" in red) and, for
 * teams with a standing, the form. The youngest teams get no form (the bond keeps no results for them).
 */
export default function TeamHeader({
  name,
  category,
  showForm,
}: {
  name: string
  category?: string | null
  showForm: boolean
}) {
  const { teamcode } = useTeam()
  const { klasse, speeldag } = useTeamClass(teamcode)
  const eyebrow = [klasse, speeldag || category].filter(Boolean).join(' · ')
  // "SVV'04 1": the club in black, the team in red.
  const [, club = name, rest = ''] = name.match(/^(SVV['’]04)(\s.+)$/i) ?? []

  return (
    <div className="team-header">
      <div className="team-header__main">
        {eyebrow && <p className="home-eyebrow">{eyebrow}</p>}
        <h1 className="page-title team-header__name">
          {club}
          {rest && <span>{rest}</span>}
        </h1>
      </div>
      {showForm && <TeamForm />}
    </div>
  )
}
