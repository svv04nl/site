import React from 'react'
import Link from 'next/link'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { TeamProvider } from '@/components/team/TeamContext'
import TeamSponsorSection from '@/components/team/TeamSponsorSection'
import TeamPhotoWithLightbox from '@/components/team/TeamPhotoWithLightbox'
import type { Media } from '@/payload-types'
import ScrollToTop from '@/components/team/ScrollToTop'
import TeamNextMatchSection from '@/components/team/TeamNextMatchSection'
import LeagueSection from '@/components/team/LeagueSection'
import TeamHeader from '@/components/team/TeamHeader'
import TeamStaffSection from '@/components/team/TeamStaffSection'
import { hasStandings } from '@/components/team/team-category'

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
  // The youngest teams: no standing, results or form (see hasStandings).
  const showStandings = hasStandings(categoryLabel)

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
            { label: 'Teams', href: '/teams' },
            { label: team.name },
          ]}
        />

        <div className="page-inner">
          <TeamHeader name={team.name} category={categoryLabel} showForm={showStandings} />
        </div>

        {/* Laptop: photo and tabs left, the sidebar right. Phone: the next match first, then the
            photo, the tabs, and the staff and the rest below (see _team.scss). */}
        <div className="team-layout">
          <div className="team-layout__main">
            <div className="team-photo team-layout__photo">
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
            <div className="team-layout__tabs">
              <LeagueSection teamName={team.name} showStandings={showStandings} />
            </div>
          </div>
          <div className="team-layout__side sidebar-col">
            <div className="team-layout__side-inner sidebar-col__inner">
              <div className="team-layout__next">
                <TeamNextMatchSection
                  teamcode={teamcode}
                  teamName={team.name}
                  slug={teamcode ? slug : undefined}
                />
              </div>
              <div className="team-layout__info">
                <TeamStaffSection />
                <TeamSponsorSection sponsors={team.sponsors} />

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
        </div>
      </main>
    </TeamProvider>
  )
}
