import { tool } from 'ai'
import { z } from 'zod'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import config from '@payload-config'
import type { Team } from '@/payload-types'
import { searchQueryVariants } from '@/lib/search-query'
import { teamHref } from '@/lib/ai/hrefs'
import { findTeams } from '@/lib/ai/tools/site'
import { stripUi } from '@/lib/ai/tools/ui'
import type { ToolUi } from '@/lib/ai/card-types'

const MAX_RESULTS = 25
/** Staff of more teams than this gets no team page buttons: they would not help the visitor. */
const MAX_TEAM_LINKS = 3

/** The team page lists the staff, so it is the source behind the answer. */
function teamLinks(staff: { team: string; teamUrl: string }[]): ToolUi {
  const teams = [...new Map(staff.map((s) => [s.teamUrl, s.team])).entries()]
  if (teams.length === 1) {
    const [[url, name]] = teams
    return { link: { label: `Bekijk de teampagina van ${name}`, url } }
  }
  if (teams.length > MAX_TEAM_LINKS) return {}
  return {
    links: teams.map(([url, name]) => ({ title: name, url, kind: 'page' as const })),
  }
}

export const findStaff = tool({
  description:
    "Find staff members (trainers, coaches, team managers, physios) of SVV'04 teams, by person name, " +
    'by team, or both. Only staff is available: there is no data about players and none can be looked up.',
  inputSchema: z
    .object({
      name: z.string().min(2).max(80).optional().describe("(Part of) the staff member's name"),
      team: z.string().min(1).max(80).optional().describe('Team name, e.g. "O11-1" or "SVV\'04 1"'),
    })
    .refine((v) => v.name || v.team, { message: 'Provide a name, a team, or both.' }),
  execute: async ({ name, team }) => {
    const payload = await getPayload({ config })
    const and: Where[] = []

    if (team) {
      const teams = await findTeams(team)
      if (!teams.length) return { error: `Geen team gevonden voor "${team}".` }
      and.push({ team: { in: teams.map((t) => t.id) } })
    }
    if (name) {
      and.push({ or: searchQueryVariants(name).map((v) => ({ name: { contains: v } })) })
    }

    // `team-staff` is not publicly readable (admin only); this server-side tool
    // is the only reader, and it exposes name, function and team, nothing else.
    const { docs } = await payload.find({
      collection: 'team-staff',
      where: { and },
      depth: 1,
      limit: MAX_RESULTS,
      sort: 'name',
    })

    const staff = docs.map((s) => {
      const t = s.team as Team
      return { name: s.name, role: s.role, team: t.name, teamUrl: teamHref(t) }
    })
    return staff.length
      ? { staff, ui: teamLinks(staff) }
      : { staff: [], note: 'Geen staflid gevonden.' }
  },
  toModelOutput: stripUi,
})
