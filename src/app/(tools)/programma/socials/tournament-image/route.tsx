import { ImageResponse } from 'next/og'
import { loadGoogleFont } from '@/lib/og/fonts'
import {
  getWeekMatches,
  getDayOptions,
  pickDefaultDay,
  getScheduleForDay,
  getTournamentTeamsForDay,
} from '../data'
import { getClubLogoDataUri, get7x7LogoDataUri } from '../logos'
import { Tournament7x7Poster, POSTER_DIMENSIONS, type PosterFormat } from '../Poster'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const posterFormat: PosterFormat = searchParams.get('format') === 'post' ? 'post' : 'story'
  const requestedDay = searchParams.get('day')
  const { width, height } = POSTER_DIMENSIONS[posterFormat]

  const [matches, rajdhaniBold, outfitRegular, outfitMedium, logoDataUri, sevenBySevenLogoDataUri] =
    await Promise.all([
      getWeekMatches(),
      loadGoogleFont('Rajdhani', 700),
      loadGoogleFont('Outfit', 400),
      loadGoogleFont('Outfit', 600),
      getClubLogoDataUri(),
      get7x7LogoDataUri(),
    ])

  const dayOptions = getDayOptions(matches)
  if (dayOptions.length === 0) {
    return new Response('Geen wedstrijden gevonden voor deze week.', { status: 404 })
  }

  const dayKey =
    requestedDay && dayOptions.some((d) => d.dayKey === requestedDay)
      ? requestedDay
      : (pickDefaultDay(dayOptions) as string)

  const teams = getTournamentTeamsForDay(matches, dayKey)
  if (teams.length === 0) {
    return new Response('Geen 7x7-wedstrijden gevonden voor deze dag.', { status: 404 })
  }

  const daySchedule = getScheduleForDay(matches, dayKey)

  return new ImageResponse(
    <Tournament7x7Poster
      teams={teams}
      format={posterFormat}
      logoDataUri={logoDataUri}
      sevenBySevenLogoDataUri={sevenBySevenLogoDataUri}
      periodLabel={daySchedule.periodLabel}
    />,
    {
      width,
      height,
      fonts: [
        { name: 'Rajdhani', data: rajdhaniBold, weight: 700, style: 'normal' },
        { name: 'Outfit', data: outfitRegular, weight: 400, style: 'normal' },
        { name: 'Outfit', data: outfitMedium, weight: 600, style: 'normal' },
      ],
    },
  )
}
