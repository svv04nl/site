import { searchQueryVariants } from '@/lib/search-query'

// Colloquial team references that don't literally appear in any team's name
// or category — tied to this club's current team names.
export const TEAM_QUERY_ALIASES: Record<string, string> = {
  '1e elftal': "SVV'04 1",
  'eerste elftal': "SVV'04 1",
  '1e team': "SVV'04 1",
  'eerste team': "SVV'04 1",
}

// Words visitors use for a team's category that don't appear in it ("zaal" for the Futsal team).
const TEAM_TOKEN_SYNONYMS: Record<string, string> = {
  zaal: 'futsal',
  zaalvoetbal: 'futsal',
  zaalteam: 'futsal',
}

// A bare "team"/"teams" query is a request to browse teams, not a literal
// match — strip it out so the remaining tokens (if any) still narrow things
// down (e.g. "team zondag").
const TEAM_BROWSE_STOPWORDS = new Set(['team', 'teams'])

// `category` is a `select` field — Payload/Postgres doesn't support the
// `contains` operator on select fields (it 500s), only `equals`/`in`. The
// collection is tiny (~25 docs) either way, so team matching happens here in
// JS against the full fetched list rather than via the DB `where` clause.
export function filterTeamsByQuery<T extends { name: string; category?: string | null }>(
  docs: T[],
  q: string,
): T[] {
  const alias = TEAM_QUERY_ALIASES[q.toLowerCase()]
  if (alias) return docs.filter((t) => t.name === alias)

  const tokens = q
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t && !TEAM_BROWSE_STOPWORDS.has(t))
    .map((t) => TEAM_TOKEN_SYNONYMS[t] ?? t)

  if (tokens.length === 0) return docs // browse-all

  // Every token must match somewhere — name (e.g. "35+1") or category (e.g.
  // "zondag") — so a query like "zondag 1" finds the team that is both.
  return docs.filter((team) => {
    const haystack = `${team.name} ${team.category ?? ''}`.toLowerCase()
    return tokens.every((token) => searchQueryVariants(token).some((v) => haystack.includes(v)))
  })
}

// Senior teams first (by team number), then youth teams from O21 down to
// O7 — the `order` field already encodes exactly this within each type.
function teamPriority(team: { type?: string | null; order?: number | null }): [number, number] {
  const typeRank = team.type === 'senior' ? 0 : team.type === 'youth' ? 1 : 2
  return [typeRank, team.order ?? Number.MAX_SAFE_INTEGER]
}

export function sortTeamsByPriority<T extends { type?: string | null; order?: number | null }>(
  docs: T[],
): T[] {
  return [...docs].sort((a, b) => {
    const [aType, aOrder] = teamPriority(a)
    const [bType, bOrder] = teamPriority(b)
    return aType !== bType ? aType - bType : aOrder - bOrder
  })
}
