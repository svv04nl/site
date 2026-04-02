import { getPayload } from 'payload'
import config from '@payload-config'
import React from 'react'
import Link from 'next/link'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import type { Media } from '@/payload-types'

export const metadata = { title: "SVV'04 - Senioren" }

export default async function SeniorenPage() {
  const payload = await getPayload({ config })

  const { docs: teams } = await payload.find({
    collection: 'teams',
    where: { type: { equals: 'senior' } },
    sort: 'order',
    limit: 100,
    depth: 1,
  })

  return (
    <main className="teams-overview-page">
      <SetBreadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Senioren' }]} />

      <div className="team-page-inner">
        <h1 className="programma-title">Senioren</h1>

        {teams.length === 0 ? (
          <p className="news-empty">Geen teams gevonden.</p>
        ) : (
          <div className="teams-grid">
            {teams.map((team) => {
              const photo = team.photo as Media | null | undefined
              const photoUrl = photo?.sizes?.teamCard?.url ?? photo?.url ?? null
              return (
                <Link key={team.id} href={`/teams/${team.slug}`} className="card-team card">
                  <div className="team-card-img-wrap">
                    <img
                      src={photoUrl ?? '/team-placeholder.png'}
                      alt={photo?.alt ?? team.name}
                      className="team-card-img"
                    />
                  </div>
                  <div className="team-card-body">
                    {team.category && <span className="team-card-category">{team.category}</span>}
                    <h3 className="team-card-name">{team.name}</h3>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
