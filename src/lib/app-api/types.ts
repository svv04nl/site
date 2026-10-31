// Response shapes of the app API. They mirror openapi.yaml (the contract with the app).

export type RoleSlug =
  | 'spelers'
  | 'ouders'
  | 'trainers-leiders'
  | 'vrijwilligers'
  | 'sponsoring'
  | 'supporters'

export type ImageDto = {
  url: string
  width?: number
  height?: number
  alt?: string
  mobileUrl?: string
}

export type ScreenName =
  | 'home'
  | 'program'
  | 'results'
  | 'posts'
  | 'post'
  | 'teams'
  | 'team'
  | 'club'
  | 'page'
  | 'audience'
  | 'contacts'
  | 'activities'
  | 'sponsors'
  | 'assistant'

export type LinkTarget =
  | { kind: 'screen'; screen: ScreenName; slug?: string; contactTopic?: string }
  | { kind: 'browser'; url: string; inApp?: boolean }
  | { kind: 'externalApp'; app: 'voetbalnl'; deepLink?: string }

export type LinkDto = {
  title: string
  subtitle?: string
  icon?: string
  target: LinkTarget
}

export type ContactDto = {
  name: string
  role: string
  photo?: ImageDto
  phone?: string
  email?: string
  whatsapp?: boolean
}

export type MatchTeamDto = {
  name: string
  isOwn: boolean
  teamSlug?: string
  logoUrl?: string
}

export type MatchDto = {
  id: string
  date: string
  kickoff: string
  startsAt?: string
  status: 'scheduled' | 'cancelled' | 'postponed' | 'played'
  competition?: string
  ownTeamSlug: string
  isHomeGame: boolean
  home: MatchTeamDto
  away: MatchTeamDto
  venue: {
    name: string
    shortName?: string
    address?: string
    mapsQuery?: string
    field?: string
  }
  result?: { home: number; away: number } | null
  externalUrl?: string
}

export type MatchDayDto = { date: string; label: string; matches: MatchDto[] }

export type MatchScheduleDto = {
  period: { from: string; to: string }
  days: MatchDayDto[]
  moreUrl?: LinkTarget
}

export type CategoryDto = { slug: string; title: string }

export type TeamRefDto = { slug: string; name: string; shortName?: string }

export type TeamDto = TeamRefDto & {
  type: 'senior' | 'youth' | 'other'
  category?: string
  order?: number
  photo?: ImageDto
  nextMatch?: MatchDto | null
}

export type PostSummaryDto = {
  slug: string
  title: string
  excerpt?: string
  publishedAt: string
  image?: ImageDto
  categories?: CategoryDto[]
  teams?: TeamRefDto[]
  webUrl?: string
}

export type StandingsDto = {
  competition?: string
  period?: string
  rows: {
    position: number
    team: string
    logoUrl?: string
    played: number
    points: number
    isOwn: boolean
  }[]
}

export type SponsorDto = { name: string; logo?: ImageDto; url?: string }

export type ActivityDto = {
  id: string
  date: string
  time?: string
  title: string
  location?: string
  note?: string
}

export type InlineDto = {
  text: string
  bold?: boolean
  italic?: boolean
  accent?: boolean
  link?: LinkTarget
}

export type BlockDto =
  | { type: 'paragraph'; children: InlineDto[] }
  | { type: 'heading'; level: 2 | 3; id?: string; text: string }
  | { type: 'list'; ordered: boolean; items: InlineDto[][] }
  | { type: 'image'; image: ImageDto; caption?: string }
  | { type: 'cta'; title: string; text?: string; action: LinkDto }
  | { type: 'contact'; contact: ContactDto }
  | { type: 'quote'; text: string; author?: string; authorRole?: string }
  | {
      type: 'documentDownload'
      title: string
      url: string
      mimeType?: string
      sizeBytes?: number
    }
  | { type: 'address'; name: string; address: string; mapsQuery?: string }
  | {
      type: 'pricingTable'
      title?: string
      season?: string
      columns?: { key: string; title: string }[]
      rows: { label: string; amounts: Record<string, number>; note?: string }[]
    }
  | { type: 'appStoreButtons'; app: 'voetbalnl'; title?: string }
  | { type: 'unsupported'; blockType: string; title?: string; webUrl?: string }

export type ChatCardDto =
  | { type: 'match'; match: MatchDto; action?: LinkDto }
  | { type: 'contact'; contact: ContactDto }
  | { type: 'standings'; team?: TeamRefDto; standings: StandingsDto }
  | { type: 'link'; link: LinkDto }
