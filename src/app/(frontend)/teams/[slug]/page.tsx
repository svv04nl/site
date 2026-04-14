import React from 'react'
import Link from 'next/link'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TeamProvider } from '@/components/team/TeamContext'
import TeamRosterSection from '@/components/team/TeamRosterSection'
import TeamSponsorSection from '@/components/team/TeamSponsorSection'
import TeamPhotoWithLightbox from '@/components/team/TeamPhotoWithLightbox'
import type { Media } from '@/payload-types'
import ScrollToTop from '@/components/team/ScrollToTop'
import TeamNextMatchSection from '@/components/team/TeamNextMatchSection'
import LeagueSection from '@/components/team/LeagueSection'
import { SectionHeader } from '@/components/ui/SectionHeader'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function TeamPage({ params }: Props) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'teams',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })

  const team = docs[0]
  if (!team) {
    notFound()
  }

  const photo = team.photo as Media | null | undefined
  const photoLargeUrl = photo?.url ?? null
  const photoUrl = photo?.sizes?.teamPhoto?.url ?? photo?.url ?? null
  const teamcode = team.teamcode ?? null

  const categoryLabel = team.category ?? null
  const sectionHref = team.type === 'youth' ? '/jeugd' : team.type === 'senior' ? '/senioren' : null

  const { docs: teamPosts } = await payload.find({
    collection: 'posts',
    where: {
      and: [{ status: { equals: 'published' } }, { relatedTeams: { contains: team.id } }],
    },
    sort: '-publishedAt',
    limit: 3,
    depth: 0,
  })

  return (
    <TeamProvider teamcode={teamcode} slug={slug}>
      <ScrollToTop />
      <main className="page">
        <SetBreadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            sectionHref
              ? { label: team.type === 'youth' ? 'Jeugd' : 'Senioren', href: sectionHref }
              : { label: 'Teams', href: '/teams' },
            { label: team.name },
          ]}
        />

        <div className="page-inner">
          <SectionHeader as="h1" title={team.name} subtitle={categoryLabel ?? undefined} />
        </div>
        <div className="section-with-sidebar">
          <div className="sidebar-content-col">
            <div className="team-photo">
              {photoUrl ? (
                <TeamPhotoWithLightbox
                  src={photoUrl}
                  largeSrc={photoLargeUrl ?? photoUrl}
                  alt={team.name}
                />
              ) : (
                <img
                  src="/team-placeholder.png"
                  alt={team.name}
                  width={900}
                  height={600}
                  className="team-photo-img"
                />
              )}
            </div>
            <TeamRosterSection />
            <LeagueSection />
          </div>
          <div className="sidebar-col">
            <div className="sidebar-col__inner">
              <TeamNextMatchSection teamcode={teamcode!} teamName={team.name} />
              <TeamSponsorSection sponsor={team.sponsor} />

              {teamPosts.length > 0 && (
                <div className="sidebar-section">
                  <h2 className="sidebar-section-title">Team nieuws</h2>
                  <ul className="news-sidebar-list">
                    {teamPosts.map((post) => (
                      <li key={post.id}>
                        <Link href={`/nieuws/${post.slug}`} className="news-sidebar-item">
                          <div className="news-sidebar-item-meta">
                            {post.publishedAt && (
                              <time className="news-secondary-date">
                                {new Date(post.publishedAt).toLocaleDateString('nl-NL', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </time>
                            )}
                          </div>
                          <h3 className="news-sidebar-item-title">{post.title}</h3>
                          {post.excerpt && (
                            <p className="news-sidebar-item-excerpt">{post.excerpt}</p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </TeamProvider>
  )
}
