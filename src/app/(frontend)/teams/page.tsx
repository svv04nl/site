import { getPayload } from 'payload'
import config from '@payload-config'
import React from 'react'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import { SectionHeader } from '@/components/ui/SectionHeader'
import TeamsGrid, { type GridTeam } from '@/components/team/TeamsGrid'

export const metadata = { title: "SVV'04 - Teams" }

export default async function TeamsPage() {
  const payload = await getPayload({ config })

  const { docs: teams } = await payload.find({
    collection: 'teams',
    where: { type: { in: ['senior', 'youth'] } },
    sort: 'order',
    limit: 100,
    depth: 1,
  })

  const seniorTeams = teams.filter((team) => team.type === 'senior')
  const youthTeams = teams.filter((team) => team.type === 'youth')
  const sortedTeams = [...seniorTeams, ...youthTeams] as GridTeam[]

  return (
    <main className="page">
      <SetBreadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Teams' }]} />

      <div className="page-inner">
        <SectionHeader as="h1" title="Teams" />

        <TeamsGrid teams={sortedTeams} />
      </div>
    </main>
  )
}
