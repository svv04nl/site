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
  // Teams that train together (same group, day, time and field) share one line.
  const lines = new Map<
    string,
    { row: (typeof rows)[number]; teams: { name: string; slug: string }[] }
  >()
  for (const r of rows) {
    const key = r.group
      ? [r.group, r.day, r.startTime, r.endTime, r.field].join('|')
      : `${r.teamSlug}|${r.id ?? r.day + r.startTime}`
    const line = lines.get(key) ?? { row: r, teams: [] }
    line.teams.push({ name: r.teamName, slug: r.teamSlug })
    lines.set(key, line)
  }
  const days = DAY_ORDER.map((day) => ({
    day,
    lines: [...lines.values()].filter((l) => l.row.day === day),
  })).filter((d) => d.lines.length > 0)

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
            {days.map(({ day, lines: dayLines }) => (
              <section key={day} className="training-times__day card">
                <h2 className="sidebar-section-title">{DAY_LABELS[day]}</h2>
                <ul className="training-times__list">
                  {dayLines.map(({ row: r, teams: lineTeams }) => (
                    <li
                      key={`${r.teamSlug}-${r.id ?? r.startTime}`}
                      className="training-times__row"
                    >
                      <span className="training-times__time">{timeRange(r)}</span>
                      {r.group ? (
                        <span className="training-times__team">
                          {r.group}
                          <span className="training-times__members">
                            {lineTeams.map((t, i) => (
                              <React.Fragment key={t.slug}>
                                {i > 0 && ', '}
                                <Link href={`/teams/${t.slug}`}>{t.name}</Link>
                              </React.Fragment>
                            ))}
                          </span>
                        </span>
                      ) : (
                        <Link href={`/teams/${r.teamSlug}`} className="training-times__team">
                          {r.teamName}
                        </Link>
                      )}
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
