// Raw API response types from Club.Dataservice (data.sportlink.com)
// Field names reflect the actual wire format from the API.

export type RawWedstrijd = {
  wedstrijddatum: string
  wedstrijdcode: number
  teamnaam: string
  thuisteamid: number
  thuisteam: string
  thuisteamlogo: string
  thuisteamclubrelatiecode?: string  // present in poule-programma response
  uitteamid: number
  uitteam: string
  uitteamlogo: string
  uitteamclubrelatiecode?: string    // present in poule-programma response
  aanvangstijd: string      // e.g. "10:30"
  datum: string             // e.g. "11 apr." — already formatted by API
  competitie: string
  competitiesoort: string   // "regulier" | "beker" | "-"
  klasse: string
  poule: string
  klassepoule: string
  accommodatie: string
  locatie: string
  plaats: string
  status: string
  meer: string
}

export type RawProgrammaResponse = RawWedstrijd[]

export type RawTeamLid = {
  relatiecode: string | null  // null = afgeschermd (privacy-protected)
  naam: string                // "Achternaam, Voornaam" or "Afgeschermd"
  voornaam: string | null
  achternaam: string | null
  tussenvoegsel: string | null
  geslacht: string | null
  rol: string                 // "Teamspeler" | "Technische staf" | ...
  functie: string             // "Trainer/coach" | ""
}

export type RawTeamIndelingResponse = RawTeamLid[]

// teams endpoint — one entry per poule, multiple entries per teamcode
// Regulier entries = competition phases (fases); beker entries = cup rounds
export type RawTeamsEntry = {
  teamcode: number
  lokaleteamcode: number
  poulecode: number
  teamnaam: string
  competitienaam: string
  klasse: string         // e.g. "Hoofdklasse Zwaluwen Jeugd (1e fase)" — label for fase dropdown
  poule: string
  klassepoule: string
  spelsoort: string
  competitiesoort: string  // "regulier" | "beker" | "-"
  geslacht: string
  teamsoort: string
  leeftijdscategorie: string
  speeldag: string
  more: string
}

export type RawTeamsResponse = RawTeamsEntry[]

// poulestand endpoint — only needs poulecode (no teamcode)
export type RawPoulestandRow = {
  positie: number
  teamnaam: string
  clubrelatiecode: string
  clublogo: string           // direct logo URL
  gespeeldewedstrijden: number
  gewonnen: number
  gelijk: number
  verloren: number
  doelpuntenvoor: number
  doelpuntentegen: number
  doelsaldo: number
  verliespunten: number
  punten: number
  eigenteam: 'true' | 'false'
}

export type RawPoulestandResponse = RawPoulestandRow[]

// poule-indeling endpoint
export type RawPouleIndelingEntry = {
  teamnaam: string
  clubrelatiecode: string
  speelnummer: string
  speeldag: string
  starttijd: string
  eigenteam: 'true' | 'false'
}

export type RawPouleIndelingResponse = RawPouleIndelingEntry[]

// pouleuitslagen endpoint
export type RawPouleUitslag = {
  wedstrijdcode: number
  wedstrijddatum: string
  datum: string
  datumopgemaakt: string
  aanvangstijd: string
  thuisteam: string
  thuisteamid: string
  thuisteamclubrelatiecode: string
  uitteam: string
  uitteamid: string
  uitteamclubrelatiecode: string
  uitslag: string
  eigenteam: 'true' | 'false'
  status: string
  accommodatie: string
}

export type RawPouleUitslagenResponse = RawPouleUitslag[]

// verenigingsactiviteiten endpoint
export type RawActiviteit = {
  kalendernaam: string
  kalendersoort: string
  activiteit: string
  datumvan: string
  datumtm: string
  heledag: string   // "true" | "false"
  opmerkingen: string
  plaats: string | null
  url: string | null
}

export type RawActiviteitenResponse = RawActiviteit[]

// team-sponsors endpoint
export type RawTeamSponsor = {
  naam: string
  website: string
  logo: string   // base64-encoded PNG
}

export type RawTeamSponsorsResponse = RawTeamSponsor[]
