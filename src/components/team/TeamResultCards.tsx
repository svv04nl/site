'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { matchEventsQuery } from '@/lib/clubdata/queries'
import type { ResultMatch } from '@/lib/clubdata/transform'
import { useTeam } from '@/components/team/TeamContext'
import MatchCard from '@/components/ui/MatchCard'
import { useOwnResults } from '@/components/team/team-utils'

// Goals and cards come per match from the bond, so a few cards at a time keeps it light.
const PAGE = 5

type EventLine = { key: string; name: string; minute: string; red?: boolean }

/**
 * Our goals and cards in one match. Empty when the bond has none for it. An own goal by the
 * other side counts for us, so it is listed with our goals (and theirs is left out), so the list
 * adds up to the score.
 */
function useOwnEvents(m: ResultMatch) {
  const { data } = useQuery({ ...matchEventsQuery(m.matchCode), enabled: m.isOwn })
  const ourSide = m.isOwnHome ? 'thuisteam' : 'uitteam'
  const events = data ?? []
  const isOurs = (e: (typeof events)[number]) => (e.teamtype ?? '').toLowerCase() === ourSide
  const isOwnGoal = (e: (typeof events)[number]) => /eigen/i.test(e.toevoeging ?? '')
  const line = (e: (typeof events)[number], i: number): EventLine => ({
    key: `${e.soort}-${e.minuut}-${i}`,
    // A player who keeps his name private shows up without one; an own goal by the other side
    // gets no name of theirs.
    name: isOwnGoal(e) ? 'Eigen doelpunt tegenstander' : e.spelernaam?.trim() || 'Afgeschermd',
    minute: String(e.minuut ?? ''),
    red: /rood/i.test(e.soort),
  })
  const goals = events.filter(
    (e) => /doelpunt/i.test(e.soort) && (isOurs(e) ? !isOwnGoal(e) : isOwnGoal(e)),
  )
  const cards = events.filter((e) => isOurs(e) && /kaart/i.test(e.soort))
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

// A competition match needs no label; cup matches and friendlies get one.
const KIND_LABEL: Partial<Record<ResultMatch['kind'], string>> = {
  beker: 'Beker',
  oefen: 'Oefenwedstrijd',
}

/** One played match as a card, with our goals and cards under it. Also used in the Beker tab. */
export function ResultCard({ m, showKind = true }: { m: ResultMatch; showKind?: boolean }) {
  const { goals, cards } = useOwnEvents(m)
  const kind = showKind ? KIND_LABEL[m.kind] : undefined

  return (
    <article className="result-card">
      {kind && <p className={`result-card__kind result-card__kind--${m.kind}`}>{kind}</p>}
      <MatchCard
        date={m.date}
        score={m.score}
        venue={m.venue}
        status={m.status}
        homeTeam={m.homeTeam}
        awayTeam={m.awayTeam}
        homeTeamRelatiecode={m.homeTeamRelatiecode}
        awayTeamRelatiecode={m.awayTeamRelatiecode}
        isOwnHome={m.isOwnHome}
        isOwnAway={m.isOwnAway}
        href={`/wedstrijd/${m.matchCode}`}
      />
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
export default function TeamResultCards() {
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
        <ResultCard key={m.matchCode} m={m} />
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
