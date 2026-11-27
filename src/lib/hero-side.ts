import { getPayload } from 'payload'
import config from '@payload-config'
import { loadClubProgram } from '@/lib/app-api/matches'
import type { MatchDto } from '@/lib/app-api/types'
import { amsterdamDay, amsterdamTime } from '@/lib/agenda/links'
import { isProduction } from '@/lib/site-env'
import type { Media, Pupil, Team } from '@/payload-types'

// The block on the right of the homepage hero, around a match of the first team:
// - a home match: the pupil van de week (when there is one, with consent of the parents);
// - an away match: the match with a route button.
// Shown from the night of Thursday to Friday (00:00) before a weekend match, or from 00:00 on the
// day itself for a match from Monday to Thursday, until two hours after the kickoff.

const FIRST_TEAM_SLUG = 'svv04-1'
const HOURS_AFTER = 2

export type HeroPupil = {
  name: string
  team?: string
  photo?: { url: string; alt: string }
  answers: { question: string; answer: string }[]
}

export type HeroSide =
  | { kind: 'pupil'; match: MatchDto; pupil: HeroPupil }
  | { kind: 'away'; match: MatchDto }

const QUESTIONS: [keyof Pupil, string][] = [
  ['position', 'Positie'],
  ['favoriteClub', 'Favoriete club'],
  ['favoritePlayer', 'Favoriete speler'],
  ['favoriteSvvPlayer', "Favoriete speler van SVV'04 1"],
  ['happyWhen', 'Hier word ik blij van'],
  ['laterBecome', 'Later word ik'],
]

/** Friday 00:00 for a match on Friday, Saturday or Sunday; otherwise the match day itself. */
function showFrom(day: string): string {
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay() // 0 = Sunday … 6 = Saturday
  const back = weekday === 0 ? 2 : weekday === 6 ? 1 : 0
  return shiftDay(day, -back)
}

function shiftDay(day: string, days: number): string {
  const d = new Date(`${day}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** The next match of the first team, when it falls in the window around now. */
async function firstTeamMatch(now: Date): Promise<MatchDto | null> {
  const program = await loadClubProgram()
  const match = program.find((m) => m.ownTeamSlug === FIRST_TEAM_SLUG && m.status !== 'played')
  if (!match) {
    return null
  }
  const from = amsterdamTime(showFrom(match.date), '00:00')
  const kickoff = match.startsAt
    ? new Date(match.startsAt)
    : amsterdamTime(match.date, match.kickoff)
  if (!from || !kickoff) {
    return null
  }
  const until = new Date(kickoff.getTime() + HOURS_AFTER * 3_600_000)
  return now >= from && now <= until ? match : null
}

async function pupilFor(day: string): Promise<HeroPupil | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pupils',
    where: {
      and: [
        { consent: { equals: true } },
        { matchDate: { greater_than_equal: `${shiftDay(day, -1)}T00:00:00.000Z` } },
        { matchDate: { less_than_equal: `${shiftDay(day, 1)}T23:59:59.999Z` } },
      ],
    },
    depth: 1,
    limit: 5,
  })
  const pupil = docs.find((p) => amsterdamDay(new Date(p.matchDate)) === day)
  if (!pupil) {
    return null
  }
  const photo = typeof pupil.photo === 'object' && pupil.photo ? (pupil.photo as Media) : null
  const photoUrl = photo ? (photo.sizes?.teamPhoto?.url ?? photo.url) : null
  const team = typeof pupil.team === 'object' && pupil.team ? (pupil.team as Team).name : undefined
  return {
    name: pupil.name,
    ...(team ? { team } : {}),
    ...(photoUrl ? { photo: { url: photoUrl, alt: photo?.alt || pupil.name } } : {}),
    answers: QUESTIONS.flatMap(([field, question]) => {
      const answer = pupil[field]
      return typeof answer === 'string' && answer.trim()
        ? [{ question, answer: answer.trim() }]
        : []
    }),
  }
}

// Test mode on previews and locally (never on the live site): ?hero=pupil shows the next home
// match of the first team with its pupil (or an example pupil), ?hero=uit the next away match,
// whatever the date.
export type HeroTest = 'pupil' | 'uit'

export function heroTestMode(value: string | string[] | undefined): HeroTest | null {
  const mode = (Array.isArray(value) ? value[0] : value)?.toLowerCase()
  return !isProduction() && (mode === 'pupil' || mode === 'uit') ? mode : null
}

const EXAMPLE_PUPIL: HeroPupil = {
  name: '[NAAM PUPIL]',
  team: '[TEAM]',
  answers: QUESTIONS.map(([, question]) => ({ question, answer: '[ANTWOORD]' })),
}

async function testSide(test: HeroTest): Promise<HeroSide | null> {
  const program = await loadClubProgram()
  const match = program.find(
    (m) =>
      m.ownTeamSlug === FIRST_TEAM_SLUG &&
      m.status !== 'played' &&
      m.isHomeGame === (test === 'pupil'),
  )
  if (!match) {
    return null
  }
  if (test === 'uit') {
    return { kind: 'away', match }
  }
  return { kind: 'pupil', match, pupil: (await pupilFor(match.date)) ?? EXAMPLE_PUPIL }
}

/** What the hero shows on the right, or null. Never throws: the hero then stays as it is. */
export async function loadHeroSide(
  now = new Date(),
  test: HeroTest | null = null,
): Promise<HeroSide | null> {
  try {
    if (test) {
      return await testSide(test)
    }
    const match = await firstTeamMatch(now)
    if (!match) {
      return null
    }
    if (!match.isHomeGame) {
      return { kind: 'away', match }
    }
    if (match.status === 'cancelled' || match.status === 'postponed') {
      return null
    }
    const pupil = await pupilFor(match.date)
    return pupil ? { kind: 'pupil', match, pupil } : null
  } catch (error) {
    console.error('hero side:', error)
    return null
  }
}
