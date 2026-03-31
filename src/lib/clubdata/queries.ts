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
    const fasePoules = teamPoules.filter((e) => isFasePoule(e.klasse))
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

export const periodestandQuery = (poulecode: number | undefined, periodeNummer: number) => ({
  queryKey: ['periodestand', poulecode, periodeNummer] as const,
  queryFn: async () => {
    const raw = await fetchClubData<RawPeriodestandResponse>('periodestand', null, {
      poulecode: String(poulecode),
      periodenummer: String(periodeNummer),
    })
    return transformPeriodeStandings(raw, CLUB_RELATIECODE)
  },
  enabled: !!poulecode,
  staleTime: STALE_TIME,
})

export const periodenummersQuery = (poulecode: number | undefined) => ({
  queryKey: ['periodenummers', poulecode] as const,
  queryFn: async () => {
    const raw = await fetchClubData<RawPeriodeNummer[]>('keuzelijst-periodenummers', null, {
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
    const raw = await fetchClubData<RawTeamIndelingResponse>('team-indeling', teamcode, {
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
    fetchClubData<RawTeamSponsorsResponse>('team-sponsors', teamcode, {
      lokaleteamcode: 'NULL',
    }),
  enabled: !!teamcode,
  staleTime: STALE_TIME,
})

export const standingsQuery = (poulecode: number | undefined) => ({
  queryKey: ['standings', poulecode] as const,
  queryFn: async () => {
    const raw = await fetchClubData<RawPoulestandResponse>('poulestand', null, {
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
    const raw = await fetchClubData<RawPouleIndelingResponse>('poule-indeling', null, {
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
    const raw = await fetchClubData<RawPouleUitslagenResponse>('pouleuitslagen', null, {
      poulecode: String(poulecode),
      eigenwedstrijden: 'NEE',
    })
    return transformResults(raw, CLUB_RELATIECODE)
  },
  enabled: !!poulecode,
  staleTime: STALE_TIME,
})

export const cupResultsQuery = (poulecode: number | undefined) => ({
  queryKey: ['cup-results', poulecode] as const,
  queryFn: async () => {
    const raw = await fetchClubData<RawPouleUitslagenResponse>('pouleuitslagen', null, {
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

export const pouleScheduleQuery = (poulecode: number, teamcode: number) => ({
  queryKey: ['poule-programma', poulecode] as const,
  queryFn: async () => {
    const raw = await fetchClubData<RawProgrammaResponse>('poule-programma', null, {
      poulecode: String(poulecode),
      eigenwedstrijden: 'NEE',
    })
    return transformSchedule(raw, CLUB_RELATIECODE, teamcode)
  },
  staleTime: STALE_TIME,
})

export const nextMatchQuery = (teamcode: number | null) => ({
  queryKey: ['next-match', teamcode] as const,
  queryFn: async () => {
    const raw = await fetchClubData<RawProgrammaResponse>('programma', teamcode, {
      aantaldagen: '365',
      aantalregels: '1',
    })
    return transformNextMatch(raw, Number(teamcode))
  },
  enabled: !!teamcode,
  staleTime: STALE_TIME,
})

export const clubScheduleQuery = (filter: 'thuis' | 'uit' | 'alles') => ({
  queryKey: ['programma', filter] as const,
  queryFn: async () => {
    const raw = await fetchClubData<RawProgrammaResponse>('programma', null, {
      ...CLUB_PROGRAMMA_PARAMS,
      thuis: filter !== 'uit' ? 'ja' : 'nee',
      uit: filter !== 'thuis' ? 'ja' : 'nee',
    })
    return transformSchedule(raw, CLUB_RELATIECODE)
  },
  staleTime: STALE_TIME,
})
