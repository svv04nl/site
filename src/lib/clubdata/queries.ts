import { fetchClubData } from '@/lib/clubdata/fetch'
import {
  transformSchedule,
  transformStandings,
  transformPeriodeStandings,
  transformLineup,
  transformResults,
  transformTeamRoster,
  transformNextMatch,
} from '@/lib/clubdata/transform'
import { CLUB_RELATIECODE } from '@/lib/clubdata/config'
import type {
  RawWedstrijdEvenement,
  RawProgrammaResponse,
  RawPoulestandResponse,
  RawPeriodestandResponse,
  RawPouleIndelingResponse,
  RawPouleUitslagenResponse,
  RawTeamsResponse,
  RawTeamsEntry,
  RawTeamIndelingResponse,
  RawTeamSponsorsResponse,
  RawPeriodeNummer,
  PouleInfo,
  RawWedstrijdInformatie as RawGameInfoResponse,
  RawWedstrijdSpelersResponse as RawGamePlayersResponse,
  RawWedstrijdEvenementenResponse,
  RawActiviteitenResponse,
} from '@/lib/clubdata/types'

const STALE_TIME = 5 * 60 * 1000

const CLUB_PROGRAMMA_PARAMS = {
  teamcode: 'NULL',
  lokaleteamcode: 'NULL',
  sorteervolgorde: 'datum',
  gebruiklokaleteamgegevens: 'NEE',
  aantalregels: '100',
  aantaldagen: '365',
  weekoffset: '0',
  eigenwedstrijden: 'JA',
  spelsoort: 'ALLES',
  competitiesoort: 'ALLES',
  dagsoort: 'ALLES',
  leeftijdscategorie: 'ALLES',
  wedstrijdtype: '',
}

const toPouleInfo = (e: RawTeamsEntry): PouleInfo => ({
  poulecode: e.poulecode,
  klasse: e.klasse,
  klassepoule: e.klassepoule,
})

const isFasePoule = (klasse: string) => /fase/i.test(klasse)

export const teamPoulesQuery = (teamcode: number | null) => ({
  queryKey: ['team-poules', teamcode] as const,
  queryFn: async () => {
    const raw = await fetchClubData<RawTeamsResponse>('teams')

    const teamPoules = raw.filter((e) => e.teamcode === teamcode)
    const regularPoules = teamPoules.filter((e) => e.competitiesoort === 'regulier')
    const cupPoules = teamPoules.filter((e) => e.competitiesoort === 'beker')
    const fasePoules = regularPoules.filter((e) => isFasePoule(e.klasse))
    const poules = regularPoules.filter((e) => !isFasePoule(e.klasse))

    return {
      poules: poules.map(toPouleInfo),
      cupPoules: cupPoules.map(toPouleInfo),
      fasePoules: fasePoules.map(toPouleInfo),
    }
  },
  enabled: !!teamcode,
  staleTime: STALE_TIME,
})

export const periodStandingQuery = (poulecode: number | undefined, periodeNummer: number) => ({
  queryKey: ['periodestand', poulecode, periodeNummer] as const,
  queryFn: async () => {
    const raw = await fetchClubData<RawPeriodestandResponse>('periodestand', {
      poulecode: String(poulecode),
      periodenummer: String(periodeNummer),
    })
    return transformPeriodeStandings(raw, CLUB_RELATIECODE)
  },
  enabled: !!poulecode,
  staleTime: STALE_TIME,
})

export const periodNumbersQuery = (poulecode: number | undefined) => ({
  queryKey: ['periodenummers', poulecode] as const,
  queryFn: async () => {
    const raw = await fetchClubData<RawPeriodeNummer[]>('keuzelijst-periodenummers', {
      poulecode: String(poulecode),
    })
    return raw
      .map((item) => ({ periodenummer: Number(item.waarde) }))
      .filter((p) => !isNaN(p.periodenummer))
  },
  enabled: !!poulecode,
  staleTime: STALE_TIME,
})

export const teamRosterQuery = (teamcode: number | null) => ({
  queryKey: ['team-roster', teamcode] as const,
  queryFn: async () => {
    const raw = await fetchClubData<RawTeamIndelingResponse>('team-indeling', {
      teamcode: String(teamcode),
      lokaleteamcode: 'NULL',
      toonlidfoto: 'NEE',
    })
    return transformTeamRoster(raw)
  },
  enabled: !!teamcode,
  staleTime: STALE_TIME,
})

export const teamSponsorsQuery = (teamcode: number | null) => ({
  queryKey: ['team-sponsors', teamcode] as const,
  queryFn: () =>
    fetchClubData<RawTeamSponsorsResponse>('team-sponsors', {
      teamcode: String(teamcode),
      lokaleteamcode: 'NULL',
    }),
  enabled: !!teamcode,
  staleTime: STALE_TIME,
})

export const standingsQuery = (poulecode: number | undefined) => ({
  queryKey: ['standings', poulecode] as const,
  queryFn: async () => {
    const raw = await fetchClubData<RawPoulestandResponse>('poulestand', {
      poulecode: String(poulecode),
    })
    return transformStandings(raw, CLUB_RELATIECODE)
  },
  enabled: !!poulecode,
  staleTime: STALE_TIME,
})

export const lineupQuery = (poulecode: number | undefined) => ({
  queryKey: ['lineup', poulecode] as const,
  queryFn: async () => {
    const raw = await fetchClubData<RawPouleIndelingResponse>('poule-indeling', {
      poulecode: String(poulecode),
    })
    return transformLineup(raw)
  },
  enabled: !!poulecode,
  staleTime: STALE_TIME,
})

export const resultsQuery = (poulecode: number | undefined) => ({
  queryKey: ['results', poulecode] as const,
  queryFn: async () => {
    const raw = await fetchClubData<RawPouleUitslagenResponse>('pouleuitslagen', {
      poulecode: String(poulecode),
      eigenwedstrijden: 'NEE',
      aantaldagen: '100',
    })
    return transformResults(raw, CLUB_RELATIECODE)
  },
  enabled: !!poulecode,
  staleTime: STALE_TIME,
})

export const cupResultsQuery = (poulecode: number | undefined) => ({
  queryKey: ['cup-results', poulecode] as const,
  queryFn: async () => {
    const raw = await fetchClubData<RawPouleUitslagenResponse>('pouleuitslagen', {
      poulecode: String(poulecode),
      aantaldagen: '365',
      weekoffset: '-52',
      eigenwedstrijden: 'NEE',
      gebruiklokaleteamgegevens: 'NEE',
    })
    return transformResults(raw, CLUB_RELATIECODE)
  },
  enabled: !!poulecode,
  staleTime: STALE_TIME,
})

export const pouleScheduleQuery = (poulecode: number, teamcode: number, maxDays = 365) => ({
  queryKey: ['poule-programma', poulecode, maxDays] as const,
  queryFn: async () => {
    const raw = await fetchClubData<RawProgrammaResponse>('poule-programma', {
      poulecode: String(poulecode),
      eigenwedstrijden: 'NEE',
      aantaldagen: String(maxDays),
      aantalregels: '200',
    })
    return transformSchedule(raw, CLUB_RELATIECODE, teamcode)
  },
  staleTime: STALE_TIME,
})

export const nextMatchQuery = (teamcode: number | null, maxDays = 365) => ({
  queryKey: ['next-match', teamcode, maxDays] as const,
  queryFn: async () => {
    const raw = await fetchClubData<RawProgrammaResponse>('programma', {
      teamcode: String(teamcode),
      aantaldagen: String(maxDays),
      aantalregels: '1',
    })
    return transformNextMatch(raw, Number(teamcode))
  },
  enabled: !!teamcode,
  staleTime: STALE_TIME,
})

export const gameInfoQuery = (wedstrijdcode: string | number) => ({
  queryKey: ['wedstrijd-informatie', String(wedstrijdcode)] as const,
  queryFn: () =>
    fetchClubData<RawGameInfoResponse>('wedstrijd-informatie', {
      wedstrijdcode: String(wedstrijdcode),
    }),
  staleTime: STALE_TIME,
})

export const gameHomeTeamQuery = (wedstrijdcode: string | number) => ({
  queryKey: ['wedstrijd-thuisteam', String(wedstrijdcode)] as const,
  queryFn: () =>
    fetchClubData<RawGamePlayersResponse>('wedstrijd-thuisteam', {
      wedstrijdcode: String(wedstrijdcode),
    }),
  staleTime: STALE_TIME,
})

export const gameAwayTeamQuery = (wedstrijdcode: string | number) => ({
  queryKey: ['wedstrijd-uitteam', String(wedstrijdcode)] as const,
  queryFn: () =>
    fetchClubData<RawGamePlayersResponse>('wedstrijd-uitteam', {
      wedstrijdcode: String(wedstrijdcode),
    }),
  staleTime: STALE_TIME,
})

export const ordiedienstScheduleQuery = () => ({
  queryKey: ['ordedienst-programma'] as const,
  queryFn: () =>
    fetchClubData<RawProgrammaResponse>('programma', {
      teamcode: 'NULL',
      lokaleteamcode: 'NULL',
      sorteervolgorde: 'datum',
      gebruiklokaleteamgegevens: 'NEE',
      aantalregels: '100',
      aantaldagen: '7',
      weekoffset: '0',
      eigenwedstrijden: 'NEE',
      spelsoort: 'ALLES',
      competitiesoort: 'ALLES',
      dagsoort: 'ALLES',
      leeftijdscategorie: 'ALLES',
      wedstrijdtype: '',
      thuis: 'ja',
      uit: 'ja',
    }).catch(() => [] as RawProgrammaResponse),
  staleTime: STALE_TIME,
})

export const activiteitenQuery = (aantaldagen = 365, { fresh = false } = {}) => ({
  queryKey: ['verenigingsactiviteiten', aantaldagen] as const,
  queryFn: () =>
    fetchClubData<RawActiviteitenResponse>(
      'verenigingsactiviteiten',
      { aantaldagen: String(aantaldagen) },
      { fresh },
    ).catch(() => [] as RawActiviteitenResponse),
  staleTime: STALE_TIME,
})

export const clubScheduleQuery = (filter: 'thuis' | 'uit' | 'alles') => ({
  queryKey: ['programma', filter] as const,
  queryFn: async () => {
    const raw = await fetchClubData<RawProgrammaResponse>('programma', {
      ...CLUB_PROGRAMMA_PARAMS,
      thuis: filter !== 'uit' ? 'ja' : 'nee',
      uit: filter !== 'thuis' ? 'ja' : 'nee',
    })
    return transformSchedule(raw, CLUB_RELATIECODE)
  },
  staleTime: STALE_TIME,
})

/**
 * Goals and cards of one played match (wedstrijd-statistieken). Not every competition fills
 * them in, and the endpoint can fail for an old match: then the list is empty and the result
 * card shows only the score.
 */
export const matchEventsQuery = (wedstrijdcode: number) => ({
  queryKey: ['match-events', wedstrijdcode] as const,
  queryFn: async (): Promise<RawWedstrijdEvenement[]> => {
    try {
      const raw = await fetchClubData<unknown>('wedstrijd-statistieken', {
        wedstrijdcode: String(wedstrijdcode),
      })
      return Array.isArray(raw) ? (raw as RawWedstrijdEvenement[]) : []
    } catch {
      return []
    }
  },
  staleTime: STALE_TIME,
})
