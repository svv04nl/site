'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTeam } from '@/components/team/TeamContext'
import { useTeamPoules } from '@/components/team/team-utils'
import TeamTabNav from '@/components/team/TeamTabNav'
import StandingsTab from '@/components/team/StandingsTab'
import TeamResultCards from '@/components/team/TeamResultCards'
import TeamRosterSection from '@/components/team/TeamRosterSection'
import ScheduleTab from '@/components/team/ScheduleTab'
import LineupTab from '@/components/team/LineupTab'
import CupTab from '@/components/team/CupTab'

// The youngest teams have no standing and no results (see hasStandings): their page starts with
// the schedule and the poule.
const TABS = ['programma', 'uitslagen', 'stand', 'beker', 'indeling', 'spelers']
const TABS_NO_STANDINGS = ['programma', 'indeling', 'beker', 'spelers']

export default function LeagueSection({
  teamName,
  showStandings,
}: {
  teamName: string
  showStandings: boolean
}) {
  const { teamcode } = useTeam()
  const { regularPoules, cupPoules, latestFaseIndex } = useTeamPoules(teamcode)
  const tabIds = (showStandings ? TABS : TABS_NO_STANDINGS).filter(
    (t) => t !== 'beker' || cupPoules.length > 0,
  )
  // ?tab=uitslagen etc. opens that tab directly (used by links from the assistant).
  const requestedTab = useSearchParams().get('tab')
  const hasRequestedTab = tabIds.includes(requestedTab ?? '')
  const [activeTab, setActiveTab] = useState(
    hasRequestedTab ? (requestedTab as string) : 'programma',
  )
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

  return (
    <div className="league-section" ref={sectionRef}>
      <TeamTabNav tabIds={tabIds} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="league-content">
        {activeTab === 'stand' && showStandings && (
          <StandingsTab poules={regularPoules} initialIndex={latestFaseIndex} />
        )}
        {activeTab === 'programma' && (
          <ScheduleTab teamcode={teamcode ?? 0} poules={[...regularPoules, ...cupPoules]} />
        )}
        {activeTab === 'uitslagen' && showStandings && <TeamResultCards teamName={teamName} />}
        {activeTab === 'indeling' && (
          <LineupTab poules={regularPoules} initialIndex={latestFaseIndex} />
        )}
        {activeTab === 'beker' && <CupTab poules={cupPoules} teamcode={teamcode ?? 0} />}
        {activeTab === 'spelers' && <TeamRosterSection playersOnly />}
      </div>
    </div>
  )
}
