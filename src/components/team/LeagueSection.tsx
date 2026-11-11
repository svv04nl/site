'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { teamPoulesQuery } from '@/lib/clubdata/queries'
import { useTeam } from '@/components/team/TeamContext'
import TeamTabNav from '@/components/team/TeamTabNav'
import StandingsTab from '@/components/team/StandingsTab'
import ResultsTab from '@/components/team/ResultsTab'
import ScheduleTab from '@/components/team/ScheduleTab'
import LineupTab from '@/components/team/LineupTab'
import CupTab from '@/components/team/CupTab'

const TABS = ['stand', 'programma', 'uitslagen', 'indeling', 'beker']

export default function LeagueSection() {
  const { teamcode } = useTeam()
  // ?tab=uitslagen etc. opens that tab directly (used by links from the assistant).
  const requestedTab = useSearchParams().get('tab')
  const hasRequestedTab = TABS.includes(requestedTab ?? '')
  const [activeTab, setActiveTab] = useState(hasRequestedTab ? (requestedTab as string) : 'stand')
  const sectionRef = useRef<HTMLDivElement>(null)

  // Opened for a specific tab: bring that section into view instead of the team photo at the top.
  // Sections above it (next match, photo) load later and push it down, so keep correcting for a
  // few seconds, until the visitor scrolls themselves.
  useEffect(() => {
    if (!hasRequestedTab) {
      return
    }
    const scrollToSection = () => sectionRef.current?.scrollIntoView({ block: 'start' })
    scrollToSection()

    const observer = new ResizeObserver(scrollToSection)
    observer.observe(document.body)
    const stop = () => observer.disconnect()
    const timer = setTimeout(stop, 4000)
    const events = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const
    events.forEach((e) => window.addEventListener(e, stop, { once: true, passive: true }))
    return () => {
      stop()
      clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, stop))
    }
    // Only on arrival; switching tabs afterwards must not scroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { data: poules } = useQuery(teamPoulesQuery(teamcode))

  // The API can list a poule without name or code (e.g. between competition phases); skip it.
  const regularPoules = [...(poules?.poules ?? []), ...(poules?.fasePoules ?? [])].filter(
    (p) => p.klasse && p.poulecode,
  )

  const getFaseNumber = (klasse: string) => {
    const match = klasse.match(/\((\d+)[a-z]*\s+fase\)/i)
    return match ? parseInt(match[1]) : -1
  }
  const latestFaseIndex = regularPoules.reduce((best, p, i) => {
    const n = getFaseNumber(p.klasse)
    return n > getFaseNumber(regularPoules[best]?.klasse ?? '') ? i : best
  }, 0)

  return (
    <div className="league-section" ref={sectionRef}>
      <TeamTabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasCup={(poules?.cupPoules.length ?? 0) > 0}
      />
      <div className="league-content">
        {activeTab === 'stand' && (
          <StandingsTab poules={regularPoules} initialIndex={latestFaseIndex} />
        )}
        {activeTab === 'programma' && (
          <ScheduleTab
            teamcode={teamcode ?? 0}
            poules={[...regularPoules, ...(poules?.cupPoules ?? [])]}
          />
        )}
        {activeTab === 'uitslagen' && (
          <ResultsTab poules={regularPoules} initialIndex={latestFaseIndex} />
        )}
        {activeTab === 'indeling' && (
          <LineupTab poules={regularPoules} initialIndex={latestFaseIndex} />
        )}
        {activeTab === 'beker' && (
          <CupTab poules={poules?.cupPoules ?? []} teamcode={teamcode ?? 0} />
        )}
      </div>
    </div>
  )
}
