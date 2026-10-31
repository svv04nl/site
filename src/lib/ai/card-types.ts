// What the chat UI renders as cards and buttons. Tools return this under `ui`
// next to the data the model sees; `stripUi` removes it before the model does,
// so the cards cost no tokens and the model cannot change what they show.

export type MatchCardData = {
  /** Short date, e.g. "zo 11 okt". */
  date: string
  time?: string
  score?: string
  home: string
  away: string
  homeRelatiecode?: string
  awayRelatiecode?: string
  isOwnHome?: boolean
  isOwnAway?: boolean
  venue?: string
  status?: string
  matchUrl: string
}

export type ContactCardData = {
  name: string
  roles: { title: string; slug?: string }[]
  email?: string
  phone?: string
}

export type LinkCardData = {
  title: string
  url: string
  /** "article" reads as "Lees het artikel", anything else as "Bekijk de pagina". */
  kind: 'article' | 'page'
  date?: string
}

export type StandingsCardData = {
  /** Competition and poule, e.g. "Zaterdag 11-tal 4e klasse". */
  title: string
  /** The SVV'04 team the table was asked for (the app links to it). */
  team?: { slug: string; name: string }
  rows: {
    position: number
    team: string
    clubRelatiecode?: string
    isOwn: boolean
    played: number
    won: number
    drawn: number
    lost: number
    goalDiff: number
    points: number
  }[]
}

export type ToolUi = {
  matches?: MatchCardData[]
  standings?: StandingsCardData[]
  contacts?: ContactCardData[]
  links?: LinkCardData[]
  /** Shown as a button when more items exist than cards are shown. */
  more?: { label: string; url: string }
  /** Always shown as a button, e.g. to the team page tab with the full data. */
  link?: { label: string; url: string }
}

/** Most match cards shown at once; the rest sit behind the "more" button. */
export const MAX_MATCH_CARDS = 6
