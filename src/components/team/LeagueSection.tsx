'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { teamPoulesQuery } from '@/lib/clubdata/queries'
import { useTeam } from '@/components/team/TeamContext'
import TeamTabNav from '@/components/team/TeamTabNav'
import StandingsTab from '@/components/team/StandingsTab'
import ResultsTab from '@/components/team/ResultsTab'
import ScheduleTab from '@/components/team/ScheduleTab'
import LineupTab from '@/components/team/LineupTab'
import CupTab from '@/components/team/CupTab'

export default function LeagueSection() {
  const { teamcode } = useTeam()
  const [activeTab, setActiveTab] = useState('stand')
  const { data: poules } = useQuery(teamPoulesQuery(teamcode))

  const regularPoules = [...(poules?.poules ?? []), ...(poules?.fasePoules ?? [])]

  const getFaseNumber = (klasse: string) => {
    const match = klasse.match(/\((\d+)[a-z]*\s+fase\)/i)
    return match ? parseInt(match[1]) : -1
  }
  const latestFaseIndex = regularPoules.reduce((best, p, i) => {
    const n = getFaseNumber(p.klasse)
    return n > getFaseNumber(regularPoules[best]?.klasse ?? '') ? i : best
  }, 0)

  return (
    <div className="league-section">
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
