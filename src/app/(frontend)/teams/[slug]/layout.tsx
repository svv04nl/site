import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import NextMatch from '@/components/NextMatch'
import { TeamProvider } from '@/components/team/TeamContext'
import TeamRosterSection from '@/components/team/TeamRosterSection'
import TeamSponsorSection from '@/components/team/TeamSponsorSection'
import TeamTabNav from '@/components/team/TeamTabNav'
import type { Media } from '@/payload-types'
import NextMatchServer from '@/components/NextMatchServer'
import ScrollToTop from '@/components/team/ScrollToTop'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}

export default async function TeamLayout({ params, children }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'teams',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })

  const team = docs[0]
  if (!team) notFound()

  const photo = team.photo as Media | null | undefined
  const photoUrl = photo?.url ?? null
  const teamcode = team.teamcode ?? null

  const categoryLabel = team.category ?? null
  const sectionHref = team.type === 'youth' ? '/jeugd' : team.type === 'senior' ? '/senioren' : null

  return (
    <TeamProvider teamcode={teamcode} slug={slug}>
      <ScrollToTop />
      <main className="team-page">
        {/* Breadcrumb */}
        <nav className="team-breadcrumb" aria-label="Kruimelpad">
          <div className="team-page-inner">
            <Link href="/">Home</Link>
            <span aria-hidden="true">›</span>
            {sectionHref ? (
              <Link href={sectionHref}>{team.type === 'youth' ? 'Jeugd' : 'Senioren'}</Link>
            ) : (
              <Link href="/teams">Teams</Link>
            )}
            <span aria-hidden="true">›</span>
            <span>{team.name}</span>
          </div>
        </nav>

        {/* Two-column layout */}
        <div className="team-page-inner team-page-inner--title">
          <h1 className="programma-title">{team.name}</h1>
          {categoryLabel && (
            <p className="team-page-category">{categoryLabel}</p>
          )}
        </div>
        <div className="team-page-inner">
          <div className="team-layout">
            <div className="team-main">
              <div className="team-photo">
                <img
                  src={photoUrl ?? '/team-placeholder.png'}
                  alt={team.name}
                  width={1200}
                  height={800}
                />
              </div>
              <TeamRosterSection />
            </div>

            <aside className="team-sidebar">
              <NextMatchServer teamcode={teamcode!} teamName={team.name} />
              <TeamSponsorSection />
            </aside>
          </div>
        </div>

        {/* League section */}
        <div className="team-league-wrap">
          <div className="team-page-inner">
            <div className="league-section">
              <TeamTabNav />
              <div className="league-content">{children}</div>
            </div>
          </div>
        </div>
      </main>
    </TeamProvider>
  )
}
