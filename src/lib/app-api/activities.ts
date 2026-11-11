import { activiteitenQuery } from '@/lib/clubdata/queries'
import { slugify } from '@/lib/app-api/format'
import type { ActivityDto } from '@/lib/app-api/types'
import { sharedCache } from '@/lib/shared-cache'

/** How long the club calendar is shared before Sportlink is asked again (seconds). */
export const ACTIVITIES_TTL_S = 15 * 60

/**
 * Club activities (not matches) from the Club.Dataservice calendar, soonest first. Cached for
 * the whole site (sharedCache), so the app, the agenda page and the club feed share one copy.
 */
export const loadActivities = sharedCache(fetchActivities, 'club-activities', {
  revalidate: ACTIVITIES_TTL_S,
})

async function fetchActivities(): Promise<ActivityDto[]> {
  const raw = await activiteitenQuery(365, { fresh: true }).queryFn()
  const seen = new Map<string, number>()

  return raw
    .map((a): ActivityDto => {
      // Sportlink gives local times with their offset ("2026-11-23T19:00:00+0100"), so slicing is exact.
      const date = a.datumvan.slice(0, 10)
      const base = `${date}-${slugify(a.activiteit)}`
      const n = (seen.get(base) ?? 0) + 1
      seen.set(base, n)
      return {
        id: n === 1 ? base : `${base}-${n}`,
        date,
        ...(a.heledag === 'true' ? {} : { time: a.datumvan.slice(11, 16) }),
        title: a.activiteit,
        ...(a.plaats ? { location: a.plaats } : {}),
        ...(a.opmerkingen ? { note: a.opmerkingen } : {}),
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''))
}
