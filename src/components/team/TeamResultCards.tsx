'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { matchEventsQuery } from '@/lib/clubdata/queries'
import type { ResultMatch } from '@/lib/clubdata/transform'
import { useTeam } from '@/components/team/TeamContext'
import { parseScore, useOwnResults } from '@/components/team/team-utils'

// Goals and cards come per match from the bond, so a few cards at a time keeps it light.
const PAGE = 5

type EventLine = { key: string; name: string; minute: string; red?: boolean }

/** Our goals and cards in one match. Empty when the bond has none for it. */
function useOwnEvents(m: ResultMatch) {
  const { data } = useQuery(matchEventsQuery(m.matchCode))
  const ourSide = m.isOwnHome ? 'thuisteam' : 'uitteam'
  const ours = (data ?? []).filter((e) => (e.teamtype ?? '').toLowerCase() === ourSide)
  const line = (e: (typeof ours)[number], i: number): EventLine => ({
    key: `${e.soort}-${e.minuut}-${i}`,
    // A player who keeps his name private shows up without one.
    name: e.spelernaam?.trim() || 'Afgeschermd',
    minute: String(e.minuut ?? ''),
    red: /rood/i.test(e.soort),
  })
  const goals = ours.filter((e) => /doelpunt/i.test(e.soort) && !/eigen/i.test(e.toevoeging ?? ''))
  const cards = ours.filter((e) => /kaart/i.test(e.soort))
  return { goals: goals.map(line), cards: cards.map(line) }
}

function BallIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="result-card__ball"
    >
      <circle cx="12" cy="12" r="10" fill="#fff" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7l4 3-1.5 4.5h-5L8 10z" fill="currentColor" />
    </svg>
  )
}

function ResultCard({ m, teamName }: { m: ResultMatch; teamName: string }) {
  const score = parseScore(m.score)
  const { goals, cards } = useOwnEvents(m)

  return (
    <article className="result-card">
      <div className="result-card__top">
        <span className="result-card__team">{teamName}</span>
        <span className="result-card__date">{m.date}</span>
      </div>
      <Link href={`/wedstrijd/${m.matchCode}`} className="result-card__score-row">
        <span
          className={`result-card__side result-card__side--home${m.isOwnHome ? ' is-own' : ''}`}
        >
          {m.homeTeam}
        </span>
        <span className="result-card__score">{score ? `${score[0]} – ${score[1]}` : m.score}</span>
        <span className={`result-card__side${m.isOwnAway ? ' is-own' : ''}`}>{m.awayTeam}</span>
      </Link>
      {(goals.length > 0 || cards.length > 0) && (
        <div className="result-card__events">
          {goals.length > 0 && (
            <div>
              <h3 className="result-card__events-title">Doelpunten</h3>
              <ul className="result-card__list">
                {goals.map((g) => (
                  <li key={g.key}>
                    <BallIcon />
                    {g.name}
                    {g.minute && ` · ${g.minute}'`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {cards.length > 0 && (
            <div>
              <h3 className="result-card__events-title">Kaarten</h3>
              <ul className="result-card__list">
                {cards.map((c) => (
                  <li key={c.key}>
                    <span
                      className={`result-card__card${c.red ? ' result-card__card--red' : ''}`}
                      aria-label={c.red ? 'Rode kaart' : 'Gele kaart'}
                    />
                    {c.name}
                    {c.minute && ` · ${c.minute}'`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

/** "Uitslagen" on a team page: our own played matches as cards, newest first. */
export default function TeamResultCards({ teamName }: { teamName: string }) {
  const { teamcode } = useTeam()
  const { results, isLoading, isError } = useOwnResults(teamcode)
  const [shown, setShown] = useState(PAGE)

  if (isError) {
    return <p className="league-error">Gegevens konden niet worden geladen.</p>
  }
  if (isLoading && results.length === 0) {
    return (
      <div className="schedule-loading" aria-label="Laden…">
        <span className="schedule-spinner" />
      </div>
    )
  }
  if (results.length === 0) {
    return <p className="league-empty">Nog geen uitslagen dit seizoen.</p>
  }

  return (
    <div className="result-cards">
      {results.slice(0, shown).map((m) => (
        <ResultCard key={m.matchCode} m={m} teamName={teamName} />
      ))}
      {results.length > shown && (
        <button
          type="button"
          className="btn btn--outline-dark result-cards__more"
          onClick={() => setShown((n) => n + PAGE)}
        >
          Meer uitslagen
        </button>
      )}
    </div>
  )
}
