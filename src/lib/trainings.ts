import type { Team } from '@/payload-types'

// Training times of the teams (Teams.trainings), for the team page and /teams/trainingstijden.

export type Training = NonNullable<Team['trainings']>[number]
export type TrainingDay = Training['day']

export const DAY_ORDER: TrainingDay[] = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']

export const DAY_LABELS: Record<TrainingDay, string> = {
  ma: 'Maandag',
  di: 'Dinsdag',
  wo: 'Woensdag',
  do: 'Donderdag',
  vr: 'Vrijdag',
  za: 'Zaterdag',
  zo: 'Zondag',
}

/** "18:15" → minutes, for sorting. */
const minutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

/** Monday first, then by start time. */
export function sortTrainings<T extends Pick<Training, 'day' | 'startTime'>>(trainings: T[]): T[] {
  return [...trainings].sort(
    (a, b) =>
      DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) ||
      minutes(a.startTime) - minutes(b.startTime),
  )
}

/** "18:15 – 19:30" */
export const timeRange = (t: Pick<Training, 'startTime' | 'endTime'>) =>
  `${t.startTime} – ${t.endTime}`
