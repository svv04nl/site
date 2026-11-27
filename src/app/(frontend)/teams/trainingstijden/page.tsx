import { getPayload } from 'payload'
import config from '@payload-config'
import React from 'react'
import Link from 'next/link'
import { SetBreadcrumb } from '@/components/BreadcrumbContext'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { DAY_LABELS, DAY_ORDER, sortTrainings, timeRange } from '@/lib/trainings'

export const metadata = { title: "SVV'04 - Trainingstijden" }

// All training times per day, from the teams in the CMS (Teams.trainings).
export default async function TrainingTimesPage() {
  const payload = await getPayload({ config })
  const { docs: teams } = await payload.find({
    collection: 'teams',
    where: { 'trainings.day': { exists: true } },
    sort: 'order',
    limit: 200,
    depth: 0,
    select: { name: true, slug: true, trainings: true },
  })

  const rows = sortTrainings(
    teams.flatMap((team) =>
      (team.trainings ?? []).map((t) => ({ ...t, teamName: team.name, teamSlug: team.slug })),
    ),
  )
  const days = DAY_ORDER.map((day) => ({ day, rows: rows.filter((r) => r.day === day) })).filter(
    (d) => d.rows.length > 0,
  )

  return (
    <main className="page">
      <SetBreadcrumb
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Teams', href: '/teams' },
          { label: 'Trainingstijden' },
        ]}
      />
      <div className="page-inner">
        <SectionHeader as="h1" title="Trainingstijden" />
        <p className="training-times__intro">
          De vaste trainingen van dit seizoen. Bij afgelastingen hoor je het van je trainer of in de
          groepsapp van je team.
        </p>

        {days.length === 0 ? (
          <p className="training-times__empty">De trainingstijden staan er nog niet in.</p>
        ) : (
          <div className="training-times">
            {days.map(({ day, rows: dayRows }) => (
              <section key={day} className="training-times__day card">
                <h2 className="sidebar-section-title">{DAY_LABELS[day]}</h2>
                <ul className="training-times__list">
                  {dayRows.map((r) => (
                    <li
                      key={`${r.teamSlug}-${r.id ?? r.startTime}`}
                      className="training-times__row"
                    >
                      <span className="training-times__time">{timeRange(r)}</span>
                      <Link href={`/teams/${r.teamSlug}`} className="training-times__team">
                        {r.teamName}
                      </Link>
                      {r.field && <span className="training-times__field">{r.field}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
