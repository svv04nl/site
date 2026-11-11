'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import CalendarIcon from '@/components/ui/CalendarIcon'
import { CalendarDialog, type CalendarTarget } from '@/components/ui/CalendarDialog'

type TeamOption = { slug: string; name: string }

// Teams shown before "Toon alle teams": the seniors come first in the list.
const FIRST_TEAMS = 6

/**
 * "Zet in mijn agenda" on the programme: first choose the whole programme or only your own
 * teams (and optionally only home matches), then the calendar.
 */
export default function ProgramCalendarButton() {
  const [open, setOpen] = useState(false)
  const [teams, setTeams] = useState<TeamOption[] | null>(null)
  const [mode, setMode] = useState<'all' | 'mine'>('mine')
  const [selected, setSelected] = useState<string[]>([])
  const [homeOnly, setHomeOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  // The team list comes from the app API, only when the popup opens for the first time.
  useEffect(() => {
    if (!open || teams) {
      return
    }
    fetch('/api/app/teams')
      .then((r) => r.json())
      .then((data: { groups: { teams: TeamOption[] }[] }) =>
        setTeams(data.groups.flatMap((g) => g.teams.map(({ slug, name }) => ({ slug, name })))),
      )
      .catch(() => setTeams([]))
  }, [open, teams])

  const visibleTeams = useMemo(() => {
    const all = teams ?? []
    const q = search.trim().toLowerCase()
    if (q) {
      return all.filter((t) => t.name.toLowerCase().includes(q))
    }
    if (showAll) {
      return all
    }
    // Keep chosen teams visible even when they are further down the list.
    const first = all.slice(0, FIRST_TEAMS)
    return [...first, ...all.filter((t) => selected.includes(t.slug) && !first.includes(t))]
  }, [teams, search, showAll, selected])

  const toggle = (slug: string) =>
    setSelected((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]))

  const params = new URLSearchParams()
  if (mode === 'mine') {
    params.set('teams', selected.join(','))
  }
  if (homeOnly) {
    params.set('thuis', '1')
  }
  const query = params.toString()
  const target: CalendarTarget | null =
    mode === 'mine' && selected.length === 0
      ? null
      : {
          kind: 'feed',
          path: `/api/agenda/programma.ics${query ? `?${query}` : ''}`,
          name: mode === 'mine' ? "SVV'04 mijn teams" : "SVV'04 programma",
        }

  return (
    <>
      <button
        type="button"
        className="btn btn--primary calendar-button programma-calendar-button"
        onClick={() => setOpen(true)}
      >
        <CalendarIcon />
        Zet in mijn agenda
      </button>
      {open && (
        <CalendarDialog
          title="Zet het programma in je agenda"
          subtitle="Kies welke wedstrijden je wilt volgen."
          target={target}
          onClose={close}
        >
          <div className="calendar-dialog__step">
            <p className="calendar-dialog__label">1 · Welke teams?</p>
            <div className="calendar-dialog__modes" role="radiogroup" aria-label="Welke teams">
              {(
                [
                  ['all', 'Hele programma'],
                  ['mine', 'Alleen mijn teams'],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className={`calendar-dialog__mode${mode === value ? ' is-active' : ''}`}
                >
                  <input
                    type="radio"
                    name="programma-teams"
                    checked={mode === value}
                    onChange={() => setMode(value)}
                  />
                  {label}
                </label>
              ))}
            </div>

            {mode === 'all' && (
              <p className="calendar-dialog__hint">
                Alle wedstrijden van alle teams, ook de jeugd. Dat zijn er veel.
              </p>
            )}

            {mode === 'mine' && (
              <div className="calendar-dialog__teams">
                <input
                  type="search"
                  className="calendar-dialog__search"
                  placeholder="Zoek team, bijv. JO13"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Zoek team"
                />
                {!teams && <p className="calendar-dialog__hint">Teams laden…</p>}
                <div className="calendar-dialog__chips">
                  {visibleTeams.map((t) => (
                    <label
                      key={t.slug}
                      className={`calendar-dialog__chip${selected.includes(t.slug) ? ' is-active' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(t.slug)}
                        onChange={() => toggle(t.slug)}
                      />
                      {t.name}
                    </label>
                  ))}
                </div>
                <div className="calendar-dialog__teams-foot">
                  <span>
                    {selected.length === 0
                      ? 'Kies minstens één team'
                      : `${selected.length} ${selected.length === 1 ? 'team' : 'teams'} gekozen`}
                  </span>
                  {!search && teams && teams.length > FIRST_TEAMS && (
                    <button type="button" onClick={() => setShowAll((v) => !v)}>
                      {showAll ? 'Minder teams' : 'Toon alle teams'}
                    </button>
                  )}
                </div>
              </div>
            )}

            <label className="calendar-dialog__check">
              <input
                type="checkbox"
                checked={homeOnly}
                onChange={(e) => setHomeOnly(e.target.checked)}
              />
              Alleen thuiswedstrijden
            </label>

            <p className="calendar-dialog__label">2 · Toevoegen aan</p>
          </div>
        </CalendarDialog>
      )}
    </>
  )
}
