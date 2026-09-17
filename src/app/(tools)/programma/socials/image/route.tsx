import fs from 'node:fs'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import { loadGoogleFont } from '@/lib/og/fonts'
import { getWeekMatches, getDayOptions, pickDefaultDay, getScheduleForDay } from '../data'
import {
  Poster,
  POSTER_DIMENSIONS,
  paginateTeamGroups,
  shouldUseBigStyle,
  type PosterFormat,
} from '../Poster'

export const dynamic = 'force-dynamic'

let cachedLogoDataUri: string | null = null

function getLogoDataUri() {
  if (cachedLogoDataUri) return cachedLogoDataUri
  const filePath = path.join(process.cwd(), 'public', 'svv04-logo.png')
  const buffer = fs.readFileSync(filePath)
  cachedLogoDataUri = `data:image/png;base64,${buffer.toString('base64')}`
  return cachedLogoDataUri
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const posterFormat: PosterFormat = searchParams.get('format') === 'post' ? 'post' : 'story'
  const requestedDay = searchParams.get('day')
  const requestedPage = Number.parseInt(searchParams.get('page') ?? '1', 10) || 1
  const { width, height } = POSTER_DIMENSIONS[posterFormat]

  const [matches, rajdhaniBold, outfitRegular, outfitMedium] = await Promise.all([
    getWeekMatches(),
    loadGoogleFont('Rajdhani', 700),
    loadGoogleFont('Outfit', 400),
    loadGoogleFont('Outfit', 600),
  ])

  const dayOptions = getDayOptions(matches)
  if (dayOptions.length === 0) {
    return new Response('Geen wedstrijden gevonden voor deze week.', { status: 404 })
  }

  const dayKey =
    requestedDay && dayOptions.some((d) => d.dayKey === requestedDay)
      ? requestedDay
      : (pickDefaultDay(dayOptions) as string)

  const daySchedule = getScheduleForDay(matches, dayKey)
  const bigStyle = shouldUseBigStyle(daySchedule.teamGroups)
  const pages = paginateTeamGroups(daySchedule.teamGroups, posterFormat, bigStyle)
  const pageIndex = Math.min(Math.max(requestedPage, 1), pages.length) - 1
  const pageSchedule = { teamGroups: pages[pageIndex], periodLabel: daySchedule.periodLabel }

  return new ImageResponse(
    <Poster
      schedule={pageSchedule}
      format={posterFormat}
      logoDataUri={getLogoDataUri()}
      bigStyle={bigStyle}
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
