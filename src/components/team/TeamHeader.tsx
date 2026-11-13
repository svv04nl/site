'use client'

import React from 'react'
import { useTeam } from '@/components/team/TeamContext'
import MyTeamButton from '@/components/team/MyTeamButton'
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
 * Top of a team page: class and match day, the name, "Mijn team" and, for teams with a
 * standing, the form. The youngest teams get no form (the bond keeps no results for them).
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
  const { teamcode, slug } = useTeam()
  const { klasse, speeldag } = useTeamClass(teamcode)
  const eyebrow = [klasse, speeldag || category].filter(Boolean).join(' · ')

  return (
    <div className="team-header">
      <div className="team-header__main">
        {eyebrow && <p className="team-header__eyebrow">{eyebrow}</p>}
        <div className="team-header__title-row">
          <h1 className="team-header__name">{name}</h1>
          <MyTeamButton slug={slug} teamName={name} />
        </div>
      </div>
      {showForm && <TeamForm />}
    </div>
  )
}
