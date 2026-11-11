import { CLUB_RELATIECODE } from '@/lib/clubdata/config'
import { fetchClubData } from '@/lib/clubdata/fetch'
import type {
  RawWedstrijdInformatie,
  RawWedstrijdSpeler,
  RawWedstrijdSpelersResponse,
} from '@/lib/clubdata/types'
import { toE164 } from '@/lib/app-api/format'
import { mapMatches } from '@/lib/app-api/matches'
import type { MatchDto } from '@/lib/app-api/types'

// Wedstrijddetail voor de app: dezelfde gegevens als de wedstrijdpagina op de site (kleedkamers,
// officials, selectie en staf), in de vorm van de app-API. Van de tegenstander tonen we geen
// spelers of staf: dat staat zo in het contract (openapi.yaml).

export type MatchDetailDto = {
  match: MatchDto
  /** Klasse en poule, bijvoorbeeld "3e klasse". */
  competition?: string
  remarks?: string
  venue: { name: string; address?: string; phone?: string; routeUrl?: string }
  lockerRooms?: { home?: string; away?: string; referee?: string }
  officials: { role: string; name: string }[]
  /** Selectie en staf van het SVV'04-team in deze wedstrijd. */
  ownTeam?: {
    name: string
    players: string[]
    hiddenCount: number
    staff: { name: string; role: string }[]
  }
}

/** "Naam (Functie), Naam (Functie)": namen kunnen komma's bevatten, dus splitsen op "),". */
function parseReferees(value: string): { role: string; name: string }[] {
  if (!value) {
    return []
  }
  return value
    .split(/\),\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^(.+?)\s*\(([^)]+)\)?$/)
      return match
        ? { name: match[1].trim(), role: match[2].trim() }
        : { name: part.replace(/\)$/, '').trim(), role: 'Scheidsrechter' }
    })
}

/** Sportlink's route link has spaces in it; make it a valid https URL, or drop it. */
function routeUrlOf(value: string | null | undefined): string | undefined {
  try {
    const url = new URL(value?.trim() ?? '')
    url.protocol = 'https:'
    return url.toString()
  } catch {
    return undefined
  }
}

const clean = (value: string | null | undefined) =>
  value && value.trim() ? value.trim() : undefined

function ownTeamOf(
  name: string,
  people: RawWedstrijdSpelersResponse,
): NonNullable<MatchDetailDto['ownTeam']> {
  const players = people.filter((p) => p.rol === 'Teamspeler')
  const visible = players.filter((p) => p.relatiecode !== null)
  const staff = people
    .filter((p) => p.rol !== 'Teamspeler')
    .sort((a: RawWedstrijdSpeler, b: RawWedstrijdSpeler) =>
      a.functie === 'Trainer/coach' ? -1 : b.functie === 'Trainer/coach' ? 1 : 0,
    )
    .map((p) => ({
      name: p.relatiecode === null ? 'Afgeschermd' : p.naam,
      role: p.functie || p.rol,
    }))
  return {
    name,
    players: visible.map((p) => p.naam).sort((a, b) => a.localeCompare(b, 'nl')),
    hiddenCount: players.length - visible.length,
    staff,
  }
}

export async function loadMatchDetail(code: string): Promise<MatchDetailDto> {
  const [raw, homePeople, awayPeople] = await Promise.all([
    fetchClubData<RawWedstrijdInformatie>('wedstrijd-informatie', { wedstrijdcode: code }),
    fetchClubData<RawWedstrijdSpelersResponse>('wedstrijd-thuisteam', {
      wedstrijdcode: code,
    }).catch(() => [] as RawWedstrijdSpelersResponse),
    fetchClubData<RawWedstrijdSpelersResponse>('wedstrijd-uitteam', { wedstrijdcode: code }).catch(
      () => [] as RawWedstrijdSpelersResponse,
    ),
  ])

  const info = raw.wedstrijdinformatie
  const hasScore = info.thuisscore !== null && info.uitscore !== null
  const [match] = await mapMatches([
    {
      wedstrijdcode: Number(code),
      wedstrijddatum: info.wedstrijddatetime,
      aanvangstijd: info.aanvangstijd,
      thuisteam: info.thuisteam,
      uitteam: info.uitteam,
      thuisteamid: info.thuisteamid,
      uitteamid: info.uitteamid,
      thuisteamclubrelatiecode: raw.thuisteam?.code,
      uitteamclubrelatiecode: raw.uitteam?.code,
      accommodatie: raw.accommodatie?.naam,
      plaats: raw.accommodatie?.plaats,
      veld: info.veldnaam,
      klasse: info.klasse,
      uitslag: hasScore ? `${info.thuisscore} - ${info.uitscore}` : null,
    },
  ])

  const ownHome = raw.thuisteam?.code === CLUB_RELATIECODE
  const ownAway = raw.uitteam?.code === CLUB_RELATIECODE
  const officials = [
    ...parseReferees(raw.matchofficials?.scheidsrechters ?? ''),
    ...(clean(raw.officials?.verenigingsscheidsrechter)
      ? [
          {
            role: 'Verenigingsscheidsrechter',
            name: raw.officials.verenigingsscheidsrechter!.trim(),
          },
        ]
      : []),
    ...(clean(raw.officials?.overigeofficial)
      ? [{ role: 'Overige official', name: raw.officials.overigeofficial!.trim() }]
      : []),
  ]
  const lockerRooms = {
    ...(clean(raw.kleedkamers?.thuis) ? { home: clean(raw.kleedkamers.thuis) } : {}),
    ...(clean(raw.kleedkamers?.uit) ? { away: clean(raw.kleedkamers.uit) } : {}),
    ...(clean(raw.kleedkamers?.official) ? { referee: clean(raw.kleedkamers.official) } : {}),
  }

  return {
    match,
    ...(clean(info.klasse) ? { competition: clean(info.klasse) } : {}),
    ...(clean(info.opmerkingen) ? { remarks: clean(info.opmerkingen) } : {}),
    venue: {
      name: raw.accommodatie?.naam ?? match.venue.name,
      ...(match.venue.address ? { address: match.venue.address } : {}),
      ...(toE164(raw.accommodatie?.telefoon) ? { phone: toE164(raw.accommodatie.telefoon) } : {}),
      ...(routeUrlOf(raw.accommodatie?.routeplanner)
        ? { routeUrl: routeUrlOf(raw.accommodatie.routeplanner) }
        : {}),
    },
    ...(Object.keys(lockerRooms).length ? { lockerRooms } : {}),
    officials,
    ...(ownHome || ownAway
      ? {
          ownTeam: ownTeamOf(
            ownHome ? info.thuisteam : info.uitteam,
            ownHome ? homePeople : awayPeople,
          ),
        }
      : {}),
  }
}
