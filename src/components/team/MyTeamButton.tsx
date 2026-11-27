'use client'

import React, { useState } from 'react'
import cx from 'classnames'
import { useClientValue } from '@/lib/use-client-value'

// The team a visitor follows, kept in this browser only. The homepage and the countdown can
// read it later to put that team's match first.
export const MY_TEAM_KEY = 'svv-mijn-team'

function readMyTeam(): string | null {
  try {
    return localStorage.getItem(MY_TEAM_KEY)
  } catch {
    return null
  }
}

/** "Mijn team": the star in the team header. A second click forgets the team again. */
export default function MyTeamButton({ slug, teamName }: { slug: string; teamName: string }) {
  const stored = useClientValue(readMyTeam, null)
  // What the visitor picked on this page; until then, what the browser remembered.
  const [picked, setPicked] = useState<string | null | undefined>(undefined)
  const current = picked === undefined ? stored : picked
  const isMine = current === slug

  function toggle() {
    const next = isMine ? null : slug
    setPicked(next)
    try {
      if (next) {
        localStorage.setItem(MY_TEAM_KEY, next)
      } else {
        localStorage.removeItem(MY_TEAM_KEY)
      }
    } catch {
      // Storage blocked (private window): the star still shows for this visit.
    }
  }

  return (
    <button
      type="button"
      className={cx('my-team-button', { 'is-active': isMine })}
      onClick={toggle}
      aria-pressed={isMine}
      title={isMine ? `${teamName} is jouw team` : `Maak ${teamName} jouw team`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={isMine ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
      </svg>
      Mijn team
    </button>
  )
}
