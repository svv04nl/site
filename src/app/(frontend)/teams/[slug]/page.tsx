export const dynamic = 'force-dynamic'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import NextMatch from '@/components/NextMatch'
import TeamLeagueTabs from '@/components/TeamLeagueTabs'
import TeamRoster from '@/components/TeamRoster'
import { fetchClubData } from '@/lib/clubdata/fetch'
import { transformNextMatch, transformTeamRoster } from '@/lib/clubdata/transform'
import type {
  RawProgrammaResponse,
  RawTeamIndelingResponse,
  RawTeamsResponse,
  RawTeamSponsorsResponse,
} from '@/lib/clubdata/types'
import type { Media } from '@/payload-types'

type Props = {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export default async function TeamPage({ params }: Props) {
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

  const [rawSchedule, rawRoster, rawTeams, rawSponsors] = await Promise.all([
    teamcode
      ? fetchClubData<RawProgrammaResponse>('programma', teamcode, {
          aantaldagen: '365',
          aantalregels: '1',
        }).catch(() => null)
      : null,
    teamcode
      ? fetchClubData<RawTeamIndelingResponse>('team-indeling', teamcode, {
          lokaleteamcode: 'NULL',
          toonlidfoto: 'NEE',
        }).catch(() => null)
      : null,
    teamcode
      ? fetchClubData<RawTeamsResponse>('teams').catch(() => null)
      : null,
    teamcode
      ? fetchClubData<RawTeamSponsorsResponse>('team-sponsors', teamcode, {
          lokaleteamcode: 'NULL',
        }).catch(() => null)
      : null,
  ])

  const matchData = rawSchedule ? transformNextMatch(rawSchedule, teamcode!) : null
  const rosterData = rawRoster ? transformTeamRoster(rawRoster) : null

  const teamPoules = rawTeams?.filter((e) => e.teamcode === teamcode) ?? []
  const regulierPoules = teamPoules.filter((e) => e.competitiesoort === 'regulier')
  const bekerPoules = teamPoules.filter((e) => e.competitiesoort === 'beker')

  // Determine active fase: match next-match klassepoule against regulier poules
  let initialFaseIndex = regulierPoules.length > 1 ? regulierPoules.length - 1 : 0
  if (rawSchedule?.[0] && regulierPoules.length > 1) {
    const nextMatchPoule = rawSchedule[0].klassepoule
    const idx = regulierPoules.findIndex((p) => p.klassepoule === nextMatchPoule)
    if (idx >= 0) initialFaseIndex = idx
  }

  return (
    <main className="team-page">

      {/* Breadcrumb */}
      <nav className="team-breadcrumb" aria-label="Kruimelpad">
        <div className="team-page-inner">
          <Link href="/">Home</Link>
          <span aria-hidden="true">›</span>
          <Link href="/teams">Teams</Link>
          <span aria-hidden="true">›</span>
          <span>{team.name}</span>
        </div>
      </nav>

      {/* Two-column layout */}
      <div className="team-page-inner">
        <div className="team-layout">

          {/* Main — photo + roster */}
          <div className="team-main">
            <div className="team-photo">
              <img
                src={photoUrl ?? '/team-placeholder.png'}
                alt={team.name}
                width={1200}
                height={800}
              />
            </div>
            {rosterData && <TeamRoster data={rosterData} />}
          </div>

          {/* Sidebar */}
          <aside className="team-sidebar">
            <NextMatch match={matchData} teamName={team.name} />
            <div className="team-sponsor-card">
              <h2 className="team-sponsor-title">Sponsor</h2>
              {rawSponsors && rawSponsors.length > 0 ? (
                <div className="team-sponsor-logos">
                  {rawSponsors.map((sponsor) => (
                    sponsor.website ? (
                      <a
                        key={sponsor.naam}
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="team-sponsor-link"
                        title={sponsor.naam}
                      >
                        <img
                          src={`data:image/png;base64,${sponsor.logo}`}
                          alt={sponsor.naam}
                          className="team-sponsor-logo-img"
                        />
                      </a>
                    ) : (
                      <img
                        key={sponsor.naam}
                        src={`data:image/png;base64,${sponsor.logo}`}
                        alt={sponsor.naam}
                        className="team-sponsor-logo-img"
                      />
                    )
                  ))}
                </div>
              ) : (
                <p className="team-sponsor-empty">Dit team heeft nog geen sponsor.</p>
              )}
            </div>
          </aside>

        </div>

      </div>

      {/* League section */}
      <div className="team-league-wrap">
        <div className="team-page-inner">
          <Suspense>
            <TeamLeagueTabs
              teamName={team.name}
              regulierPoules={regulierPoules}
              bekerPoules={bekerPoules}
              initialFaseIndex={initialFaseIndex}
            />
          </Suspense>
        </div>
      </div>

    </main>
  )
}
